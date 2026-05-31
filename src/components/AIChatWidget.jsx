import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X, Send, Trash2, Sparkles, Bookmark, LifeBuoy } from "lucide-react";
import { ChatChip, ChatBookCard, SupportTicketForm } from "./ChatComponents";

export function AIChatWidget({ onOpenBook }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Привет! Я ваш Книжный Сомелье 🤖\n\nЯ помогу вам подобрать идеальную книгу. Что бы вы хотели почитать сегодня?\n[CHIP: Легкую фантастику]\n[CHIP: Что-то из классики СНГ]\n[CHIP: Динамичный детектив]" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  
  // Состояние корзины/закладок
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: isTyping ? "auto" : "smooth" });
    }
  }, [messages, isTyping]);

  // WebSocket Connection
  useEffect(() => {
    let ws;
    try {
      ws = new WebSocket("ws://localhost:8000/ws/chat/");
      ws.onopen = () => console.log("AI Chat connected");
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'history') {
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        } else if (data.type === 'stream_chunk') {
          setIsTyping(false);
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage && lastMessage.role === "assistant") {
              const newMessages = [...prev];
              const lastIndex = newMessages.length - 1;
              const lastMsg = newMessages[lastIndex];
              newMessages[lastIndex] = {
                ...lastMsg,
                content: lastMsg.content + data.content
              };
              return newMessages;
            } else {
              return [...prev, { role: "assistant", content: data.content }];
            }
          });
        } else if (data.type === 'stream_end') {
          setIsTyping(false);
        } else if (data.type === 'clear_success') {
          setMessages([{ role: "assistant", content: "История чата очищена. Чем могу помочь?\n[CHIP: Порекомендуй бестселлеры]" }]);
        }
      };

      ws.onclose = () => console.log("AI Chat disconnected");
      setSocket(ws);
    } catch (e) {
      console.warn("WebSocket is not available, using fallback mode.");
    }

    return () => {
      if (ws) ws.close();
    };
  }, []);

  const sendUserMessage = (text) => {
    if (!text.trim() || isTyping) return;

    const userMsg = { role: "user", content: text.trim() };
    
    setMessages(prev => {
      const newMessages = [...prev, userMsg];
      
      // Выполняем побочные эффекты вне цикла рендера React
      setTimeout(() => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ message: userMsg.content }));
        } else {
          callCohereAPI(newMessages);
        }
      }, 0);
      
      return newMessages;
    });
    
    setInputValue("");
    setIsTyping(true);
  };

  const handleSend = () => sendUserMessage(inputValue);
  const handleChipClick = (text) => sendUserMessage(text);

  const callCohereAPI = async (chatMessages) => {
    const apiKey = import.meta.env.VITE_COHERE_API_KEY;
    if (!apiKey) {
      setIsTyping(false);
      setMessages(prev => [...prev, { role: "assistant", content: "Упс! API ключ не найден в .env.local.\n[CHIP: Понятно]" }]);
      return;
    }

    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      let validContents = [];
      validContents.push({
        role: "system",
        content: "Ты 'Книжный сомелье' — вежливый, дружелюбный и невероятно умный ИИ-помощник по подбору книг в приложении NextRead. Твоя цель — помочь читателю найти идеальную книгу. Выясняй его вкусы и предлагай варианты. \n\nВАЖНО: Если ты рекомендуешь конкретную книгу, ты ОБЯЗАН вывести её в специальном формате: [BOOK: {\"title\": \"Название книги\", \"author\": \"Автор\", \"thumbnail\": \"\"}]. Выводи этот тег с новой строки. \nТакже ВСЕГДА в самом конце своего сообщения предлагай 2-3 варианта быстрых ответов (чипсов) для пользователя в таком формате: [CHIP: Текст кнопки]. Если пользователь просит позвать человека (техподдержку), выведи тег [TICKET_FORM]."
      });

      for (const msg of chatMessages) {
        if (msg.role === 'assistant' && msg.content === "") continue;

        let text = String(msg.content);
        text = text.replace(/\[CHIP:[\s\S]*?\]/g, '').replace(/\[BOOK:[\s\S]*?\]/g, '').replace(/\[TICKET_FORM\]/g, '').trim();
        if (!text) continue;

        validContents.push({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: text
        });
      }

      const response = await fetch("https://api.cohere.ai/v2/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "command-a-plus-05-2026",
          messages: validContents,
          stream: false
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("RATE_LIMIT");
        }
        throw new Error("API Error: " + response.statusText);
      }

      const data = await response.json();
      
      let fullText = "";
      if (data.message && Array.isArray(data.message.content)) {
        fullText = data.message.content.map(c => c.text || "").join("");
      } else if (data.message && typeof data.message.content === "string") {
        fullText = data.message.content;
      } else if (data.text) {
        fullText = data.text;
      } else {
        fullText = JSON.stringify(data.message || data);
      }
      
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIndex = newMsgs.length - 1;
        if (newMsgs.length > 0 && newMsgs[lastIndex].role === "assistant") {
          newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: fullText };
        } else {
          newMsgs.push({ role: "assistant", content: fullText });
        }
        return newMsgs;
      });
    } catch (e) {
      console.error(e);
      const isRateLimit = e.message === "RATE_LIMIT";
      const errorMsg = isRateLimit 
        ? "Ух, кажется, в нашей библиотеке сейчас слишком много гостей! 😅 Я немного не успеваю всем отвечать из-за лимита обращений. Давайте сделаем паузу на полминутки, и я снова буду готов подобрать вам лучшую книгу!\n[CHIP: Попробовать снова]" 
        : "Извините, произошла ошибка при соединении с нейросетью. Попробуйте еще раз позже.\n[CHIP: Попробовать снова]";
        
      setMessages(prev => {
        const newMsgs = [...prev];
        const lastIndex = newMsgs.length - 1;
        if (newMsgs.length > 0 && newMsgs[lastIndex].role === "assistant") {
          newMsgs[lastIndex] = { ...newMsgs[lastIndex], content: errorMsg };
        } else {
          newMsgs.push({ role: "assistant", content: errorMsg });
        }
        return newMsgs;
      });
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: "clear" }));
    } else {
      setMessages([{ role: "assistant", content: "История чата очищена. Чем могу помочь?\n[CHIP: Предложи что-нибудь]" }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBookSelect = async (book) => {
    setSelectedBooks(prev => {
      if (prev.some(b => b.title === book.title)) return prev;
      return [...prev, book];
    });

    try {
      await fetch("/api/cart/add/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.id || book.title })
      });
    } catch (e) {
      console.warn("Backend API /api/cart/add/ not available, saving locally only.");
    }
  };

  const renderMessageContent = (content) => {
    if (!content) return null;
    // Lookahead Masking: Скрываем недописанные теги в конце строки при стриминге
    let displayContent = String(content);
    const openTagRegex = /\[[^\]]*$/;
    displayContent = displayContent.replace(openTagRegex, "");

    const tokenRegex = /(\[CHIP:\s*[\s\S]+?\s*\]|\[BOOK:\s*\{[\s\S]*?\}\s*\]|\[TICKET_FORM\])/g;
    const parts = displayContent.split(tokenRegex);

    return parts.map((part, index) => {
      if (!part) return null;

      const chipMatch = part.match(/^\[CHIP:\s*([\s\S]+?)\s*\]$/);
      if (chipMatch) {
        return <ChatChip key={index} text={chipMatch[1]} onClick={handleChipClick} />;
      }

      const bookMatch = part.match(/^\[BOOK:\s*(\{[\s\S]*?\})\s*\]$/);
      if (bookMatch) {
        try {
          const bookData = JSON.parse(bookMatch[1]);
          return <ChatBookCard key={index} book={bookData} onSelect={handleBookSelect} />;
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      }

      if (part.trim() === "[TICKET_FORM]") {
        return <SupportTicketForm key={index} />;
      }

      const formattedHtml = part
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br/>');

      return (
        <div 
          key={index}
          className="prose prose-sm max-w-none prose-p:leading-relaxed prose-a:text-iris prose-strong:font-semibold"
          dangerouslySetInnerHTML={{ __html: formattedHtml }}
        />
      );
    });
  };

  return (
    <>
      {/* FAB Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-[0_0_20px_rgba(30,30,30,0.4)] transition-colors hover:bg-graphite"
          >
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ink opacity-20"></span>
            <Bot className="h-6 w-6 relative z-10" />
            <Sparkles className="absolute right-3 top-3 h-3 w-3 text-iris opacity-80" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-[0_8px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl sm:h-[600px] sm:w-[400px] h-[calc(100vh-48px)] w-[calc(100vw-48px)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-white/40 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-iris/10 text-iris">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold tracking-tight text-ink">Книжный Сомелье</h3>
                  <p className="text-xs font-medium text-graphite flex items-center gap-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Онлайн
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => sendUserMessage("Мне нужна техническая поддержка")}
                  className="p-2 text-graphite transition hover:text-coral rounded-full hover:bg-white/50"
                  title="Позвать поддержку"
                >
                  <LifeBuoy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsCartOpen(!isCartOpen)}
                  className="relative p-2 text-graphite transition hover:text-iris rounded-full hover:bg-white/50"
                  title="Выбранные книги"
                >
                  <Bookmark className="h-5 w-5" />
                  {selectedBooks.length > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-coral text-[10px] font-bold text-white shadow-sm">
                      {selectedBooks.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={clearChat}
                  className="p-2 text-graphite transition hover:text-coral rounded-full hover:bg-white/50"
                  title="Очистить диалог"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-graphite transition hover:text-ink rounded-full hover:bg-white/50"
                  title="Закрыть"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Cart Panel Overlay */}
            <AnimatePresence>
              {isCartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-[73px] left-0 right-0 z-20 bg-white/95 backdrop-blur-xl border-b border-line p-5 shadow-lg max-h-[300px] overflow-hidden flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-ink">Ваша книжная полка</h4>
                    <button onClick={() => setIsCartOpen(false)} className="text-graphite hover:text-ink"><X className="w-4 h-4" /></button>
                  </div>
                  
                  {selectedBooks.length === 0 ? (
                    <p className="text-sm text-graphite text-center py-4">Вы еще не выбрали ни одной книги.</p>
                  ) : (
                    <ul className="flex-1 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-graphite/20 pr-2">
                      {selectedBooks.map((b, i) => (
                        <li key={i} className="flex gap-3 text-sm border-b border-line pb-3 last:border-0 last:pb-0 items-center transition-colors group">
                          {b.thumbnail ? (
                            <img 
                              src={b.thumbnail} 
                              alt={b.title} 
                              className="w-10 h-14 object-cover rounded shadow-sm cursor-pointer group-hover:opacity-80 transition-opacity" 
                              onClick={() => onOpenBook && onOpenBook(b)}
                            />
                          ) : (
                            <div 
                              className="w-10 h-14 bg-graphite/10 rounded flex items-center justify-center text-[10px] font-medium text-graphite text-center cursor-pointer group-hover:bg-graphite/20 transition-colors"
                              onClick={() => onOpenBook && onOpenBook(b)}
                            >
                              Нет фото
                            </div>
                          )}
                          <div className="flex-1 cursor-pointer" onClick={() => onOpenBook && onOpenBook(b)}>
                            <p className="font-medium text-ink line-clamp-1 group-hover:text-iris transition-colors">{b.title}</p>
                            <p className="text-xs text-graphite">{b.author}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedBooks(prev => prev.filter(item => item.title !== b.title))}
                            className="p-1.5 text-graphite hover:text-coral transition-colors rounded-md hover:bg-coral/10"
                            title="Удалить из полки"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              )}
            </AnimatePresence>



            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-graphite/20">
              {messages.map((msg, idx) => {
                if (!msg.content && msg.role === "assistant") return null;
                
                return (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                  <div
                    className={`relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-ink text-white rounded-tr-sm"
                        : "bg-white border border-line text-ink rounded-tl-sm shadow-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div>{renderMessageContent(msg.content)}</div>
                    ) : (
                      <div className="whitespace-pre-wrap">{renderMessageContent(msg.content)}</div>
                    )}
                  </div>
                </div>
                );
              })}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-line rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                    <motion.div className="w-1.5 h-1.5 bg-graphite rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                    <motion.div className="w-1.5 h-1.5 bg-graphite rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                    <motion.div className="w-1.5 h-1.5 bg-graphite rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-line bg-white/40 p-4">
              <div className="relative flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Задайте вопрос библиотекарю..."
                  className="max-h-32 min-h-12 w-full resize-none rounded-xl border border-line bg-white/80 py-3 pl-4 pr-12 text-sm text-ink shadow-sm backdrop-blur-md outline-none transition focus:border-iris/50 focus:ring-4 focus:ring-iris/10 scrollbar-thin"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-lg bg-iris text-white shadow-sm transition hover:bg-iris/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
