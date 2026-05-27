import { create } from 'zustand';

export const useSupportStore = create((set) => ({
  tickets: [
    {
      id: "T-1042",
      date: "2026-05-20",
      subject: "Не загружается обложка у книги",
      status: "resolved", // open, in_progress, resolved
      messages: [
        { sender: "user", text: "Здравствуйте, у книги 'Дюна' не отображается обложка." },
        { sender: "support", text: "Добрый день! Проблема исправлена, кэш обложек обновлен." }
      ]
    }
  ],
  addTicket: (subject, message) => set((state) => {
    const newTicket = {
      id: `T-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date().toISOString().split('T')[0],
      subject: subject || "Обращение из чата",
      status: "open",
      messages: [{ sender: "user", text: message || "Опишите вашу проблему..." }]
    };
    return { tickets: [newTicket, ...state.tickets] };
  })
}));
