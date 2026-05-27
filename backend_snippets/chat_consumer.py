import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .chat_models import ChatSession, ChatMessage
from asgiref.sync import sync_to_async
import openai

from .rag_search import search_books_in_db

openai.api_key = "YOUR_OPENAI_API_KEY"

SYSTEM_PROMPT = """
Ты — "Книжный Сомелье", элитный ИИ-ассистент приложения "Умная библиотека".
Твоя цель: анализировать вкусы, вести живой диалог и помогать с выбором книг.

Важное правило: МАРШРУТИЗАЦИЯ ОБРАЩЕНИЙ
Если пользователь жалуется на технические проблемы (ошибки на сайте, не работает кнопка, забыл пароль, баги), ты ДОЛЖЕН переключиться в режим "Агент поддержки".
В этом случае прояви эмпатию, извинись за неудобства и ОБЯЗАТЕЛЬНО отправь тег `[TICKET_FORM]`, чтобы пользователь мог создать тикет. Не предлагай книги, если это явная тех. проблема.

Инструкции для книг:
1. Обязательно используй вызов функции `search_library`, если пользователь просит порекомендовать книгу, жанр или автора.
2. Делай ответы короткими и "вкусными".
3. Возвращай найденные книги через теги: `[BOOK: {"title": "Название", "author": "Автор", "thumbnail": "url", "id": "айди"}]`.
4. Предлагай пользователю варианты через теги: `[CHIP: вариант 1]`.
"""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_library",
            "description": "Поиск реальных книг в SQL-базе библиотеки по параметрам",
            "parameters": {
                "type": "object",
                "properties": {
                    "genre": {
                        "type": "string",
                        "description": "Основной жанр (например: 'Фантастика', 'Детектив', 'Роман')"
                    },
                    "subgenre": {
                        "type": "string",
                        "description": "Поджанр или специфика (например: 'Киберпанк', 'Космос', 'Психология')"
                    },
                    "author": {
                        "type": "string",
                        "description": "Имя автора, если указано"
                    },
                    "keywords": {
                        "type": "string",
                        "description": "Ключевые слова из запроса для поиска по описанию"
                    }
                },
                "required": ["keywords"],
            },
        }
    }
]

class AIChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs'].get('session_id')
        self.session, created = await sync_to_async(ChatSession.objects.get_or_create)(
            session_id=self.session_id
        )
        await self.accept()
        
        messages = await sync_to_async(list)(
            ChatMessage.objects.filter(session=self.session).order_by('timestamp')
        )
        history = [{"role": msg.role, "content": msg.content} for msg in messages]
        await self.send(text_data=json.dumps({'type': 'history', 'messages': history}))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        user_message = text_data_json.get('message')
        action = text_data_json.get('action')

        if action == 'clear':
            await sync_to_async(ChatMessage.objects.filter(session=self.session).delete)()
            await self.send(text_data=json.dumps({'type': 'clear_success'}))
            return

        if not user_message:
            return

        await sync_to_async(ChatMessage.objects.create)(
            session=self.session, role='user', content=user_message
        )

        db_messages = await sync_to_async(list)(
            ChatMessage.objects.filter(session=self.session).order_by('timestamp')
        )
        
        messages_for_llm = [{"role": "system", "content": SYSTEM_PROMPT}]
        total_msgs = len(db_messages)
        context_msgs = db_messages[:2] + db_messages[-6:] if total_msgs > 8 else db_messages

        for msg in context_msgs:
            messages_for_llm.append({"role": msg.role, "content": msg.content})

        asyncio.create_task(self.stream_openai_response(messages_for_llm))

    async def stream_openai_response(self, messages):
        try:
            client = openai.AsyncOpenAI(api_key=openai.api_key)
            
            # Первый проход без стриминга, чтобы быстро обработать вызов функции
            response = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                tools=TOOLS,
                tool_choice="auto"
            )
            
            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls

            if tool_calls:
                # LLM решила использовать функцию (SQL поиск)
                messages.append(response_message)
                
                for tool_call in tool_calls:
                    if tool_call.function.name == "search_library":
                        args = json.loads(tool_call.function.arguments)
                        # Запрашиваем SQL-базу через нашу ORM функцию (передаем все параметры)
                        found_books = await sync_to_async(search_books_in_db)(**args)
                        
                        messages.append({
                            "tool_call_id": tool_call.id,
                            "role": "tool",
                            "name": "search_library",
                            "content": json.dumps(found_books, ensure_ascii=False)
                        })
                
                # Теперь стримим финальный ответ с результатами поиска
                stream_response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    stream=True
                )
            else:
                # Если функция не нужна, пересоздаем запрос как потоковый
                stream_response = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    stream=True
                )
            
            full_assistant_message = ""
            
            # Отправка чанков клиенту
            async for chunk in stream_response:
                content = chunk.choices[0].delta.content
                if content:
                    full_assistant_message += content
                    await self.send(text_data=json.dumps({
                        'type': 'stream_chunk',
                        'content': content
                    }))
                    
            await self.send(text_data=json.dumps({'type': 'stream_end'}))
            
            await sync_to_async(ChatMessage.objects.create)(
                session=self.session,
                role='assistant',
                content=full_assistant_message
            )

        except Exception as e:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'content': 'Произошла ошибка при обращении к ИИ.'
            }))
