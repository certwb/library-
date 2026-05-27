import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Clock, CheckCircle2, AlertCircle, Plus, ChevronRight, Send, MessageSquare } from "lucide-react";
import { useSupportStore } from "../store/supportStore";

export function SupportView() {
  const tickets = useSupportStore(s => s.tickets);
  const addTicketStore = useSupportStore(s => s.addTicket);
  
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      addTicketStore(subject, message);
      setIsCreating(false);
      setSubject("");
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "resolved":
        return <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md"><CheckCircle2 className="w-3 h-3"/> Решен</span>;
      case "in_progress":
        return <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-100 px-2 py-1 rounded-md"><Clock className="w-3 h-3"/> В работе</span>;
      case "open":
      default:
        return <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-md"><AlertCircle className="w-3 h-3"/> Открыт</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-iris" /> 
            Служба поддержки
          </h1>
          <p className="text-graphite mt-2">История ваших обращений и связь с командой NextRead.</p>
        </div>
        <button
          onClick={() => { setIsCreating(true); setSelectedTicket(null); }}
          className="flex items-center gap-2 bg-ink hover:bg-graphite text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Новое обращение
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Tickets List */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="font-semibold text-ink px-1">Ваши тикеты</h2>
          {tickets.length === 0 ? (
            <div className="text-center py-8 bg-white/50 border border-line rounded-2xl">
              <MessageSquare className="w-8 h-8 text-graphite/30 mx-auto mb-2" />
              <p className="text-sm text-graphite">У вас пока нет обращений</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <button
                  key={ticket.id}
                  onClick={() => { setSelectedTicket(ticket); setIsCreating(false); }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedTicket?.id === ticket.id ? 'bg-white border-iris/40 shadow-sm ring-1 ring-iris/20' : 'bg-white/60 border-line hover:bg-white'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-graphite">{ticket.id}</span>
                    <span className="text-xs text-graphite">{ticket.date}</span>
                  </div>
                  <h3 className="font-medium text-ink line-clamp-1 mb-3">{ticket.subject}</h3>
                  <div className="flex justify-between items-center mt-2">
                    {getStatusBadge(ticket.status)}
                    <ChevronRight className="w-4 h-4 text-graphite/50" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Detail or Create Form */}
        <div className="md:col-span-2">
          {isCreating ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-ink mb-6">Создать новое обращение</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Тема проблемы</label>
                  <input
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    placeholder="Кратко опишите суть..."
                    className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-iris/30 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Подробное описание</label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Опишите, с чем вы столкнулись..."
                    rows={6}
                    className="w-full bg-white border border-line rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-iris/30 transition"
                    required
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-5 py-2.5 text-sm font-medium text-graphite hover:text-ink mr-3"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-iris hover:bg-iris/90 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm disabled:opacity-70"
                  >
                    {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                    Отправить тикет
                  </button>
                </div>
              </form>
            </motion.div>
          ) : selectedTicket ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-line rounded-3xl overflow-hidden shadow-sm flex flex-col h-[500px]">
              <div className="p-6 border-b border-line bg-gray-50/50">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-lg font-bold text-ink">{selectedTicket.subject}</h2>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <p className="text-xs text-graphite">Тикет {selectedTicket.id} • Открыт {selectedTicket.date}</p>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
                {selectedTicket.messages.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-ink text-white' : 'bg-iris/10 text-iris'}`}>
                      {msg.sender === 'user' ? <span className="text-xs font-bold">ВЫ</span> : <LifeBuoy className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-gray-100 text-ink rounded-tr-sm' : 'bg-iris/5 border border-iris/10 text-ink rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== 'resolved' && (
                <div className="p-4 border-t border-line bg-gray-50/50">
                  <div className="flex gap-2">
                    <input placeholder="Написать ответ..." className="flex-1 bg-white border border-line rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-iris/30" />
                    <button className="bg-iris hover:bg-iris/90 text-white w-10 h-10 flex items-center justify-center rounded-xl transition">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="h-[500px] border-2 border-dashed border-line rounded-3xl flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-white shadow-sm border border-line rounded-2xl flex items-center justify-center mb-4 text-graphite/50">
                <LifeBuoy className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold text-ink mb-2">Чем мы можем помочь?</h3>
              <p className="text-sm text-graphite max-w-sm mb-6">Выберите обращение слева для просмотра истории переписки или создайте новый тикет.</p>
              <button
                onClick={() => setIsCreating(true)}
                className="bg-ink hover:bg-graphite text-white px-6 py-2.5 rounded-xl text-sm font-medium transition shadow-sm"
              >
                Создать обращение
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
