import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { useSupportStore } from "../store/supportStore";

export function ChatChip({ text, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(text)}
      className="inline-block px-4 py-1.5 mb-2 mr-2 text-sm font-medium transition-colors border rounded-full text-iris border-iris/30 bg-iris/5 hover:bg-iris hover:text-white"
    >
      {text}
    </motion.button>
  );
}

export function ChatBookCard({ book, onSelect }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  const handleSelect = () => {
    setIsSelecting(true);
    
    // Имитация задержки сети
    setTimeout(() => {
      setIsSelecting(false);
      setIsSelected(true);
      if (onSelect) {
        onSelect(book);
      }
    }, 600);
  };

  return (
    <div className="flex gap-4 p-3 my-3 transition-shadow border shadow-sm rounded-xl bg-white/70 backdrop-blur-md border-white/40 hover:shadow-md">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-16 h-24 overflow-hidden rounded-md bg-graphite/10">
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="block object-cover w-full h-full"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-graphite/50">
            <BookOpen className="w-6 h-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col justify-center flex-1">
        <h4 className="font-semibold leading-tight text-ink line-clamp-2">
          {book.title}
        </h4>
        <p className="mt-1 text-xs text-graphite line-clamp-1">
          {book.author}
        </p>
        <button 
          onClick={handleSelect}
          disabled={isSelecting || isSelected}
          className={`self-start px-3 py-1 mt-3 text-xs font-medium text-white transition-colors rounded-lg flex items-center justify-center min-w-[120px] h-8 ${
            isSelected ? "bg-emerald-500 cursor-default" : "bg-ink hover:bg-graphite"
          }`}
        >
          {isSelecting ? (
            <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
          ) : isSelected ? (
            "Выбрано ✓"
          ) : (
            "Выбрать книгу"
          )}
        </button>
      </div>
    </div>
  );
}

export function SupportTicketForm() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const subjectRef = useRef(null);
  const messageRef = useRef(null);
  const addTicket = useSupportStore(s => s.addTicket);

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("loading");
    
    setTimeout(() => {
      const subject = subjectRef.current?.options[subjectRef.current.selectedIndex]?.text || "Обращение из чата";
      const message = messageRef.current?.value || "";
      addTicket(subject, message);
      setStatus("success");
    }, 1200);
  };

  if (status === "success") {
    return (
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 my-3 text-center flex flex-col items-center gap-2">
        <CheckCircle className="w-8 h-8 text-emerald-500" />
        <p className="text-sm font-medium text-emerald-800">Ваше обращение зарегистрировано!</p>
        <p className="text-xs text-emerald-600">Мы ответим вам в разделе Поддержка.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-md border border-line rounded-xl p-4 my-3 shadow-sm">
      <h4 className="font-semibold text-ink mb-1 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-coral" />
        Служба поддержки
      </h4>
      <p className="text-xs text-graphite mb-4">Опишите вашу проблему, и мы постараемся помочь как можно скорее.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <select ref={subjectRef} className="w-full text-sm p-2 rounded-lg border border-line bg-white focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris">
          <option value="bug">Техническая ошибка</option>
          <option value="account">Проблема с аккаунтом (пароль)</option>
          <option value="content">Контент / Книги</option>
          <option value="other">Другое</option>
        </select>
        
        <textarea 
          ref={messageRef}
          required
          rows="3"
          placeholder="Что случилось?"
          className="w-full text-sm p-2 rounded-lg border border-line bg-white focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris resize-none"
        ></textarea>
        
        <button 
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-ink hover:bg-graphite text-white text-sm font-medium py-2 rounded-lg transition-colors flex justify-center items-center h-9"
        >
          {status === "loading" ? (
            <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
          ) : (
            "Отправить обращение"
          )}
        </button>
      </form>
    </div>
  );
}
