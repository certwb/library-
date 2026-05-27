import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, ChevronRight, BookOpen, Settings, Bell, Shield, LogOut } from 'lucide-react';
import { pageTransition, fadeUp } from '../lib/motion';
import { useUserStore } from '../store/userStore';

const GENRES = ["Фантастика", "Детектив", "Роман", "Киберпанк", "Ужасы", "Научпоп", "Классика"];

export function UserProfile({ onLogout }) {
  const users = useUserStore(state => state.users);
  const currentUserId = useUserStore(state => state.currentUserId);
  const currentUser = users.find(u => u.id === currentUserId);
  
  const updateProfile = useUserStore(state => state.updateProfile);
  
  const [name, setName] = useState(currentUser?.name || "Пользователь");
  const [avatar, setAvatar] = useState(currentUser?.avatar || "https://i.pravatar.cc/150?img=12");
  const [bio, setBio] = useState(currentUser?.bio || "Ищу вдохновение в книгах.");
  const [goal, setGoal] = useState(currentUser?.readingGoal || 12);
  const [selectedGenres, setSelectedGenres] = useState(currentUser?.genres || ["Фантастика", "Киберпанк"]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("Успешно сохранено!");
  const [activeTab, setActiveTab] = useState("profile"); // profile, notifications, security
  
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setAvatar(imageUrl);
    }
  };

  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
    );
  };

  const handleSave = (e, msg = "Профиль сохранен!") => {
    if (e) e.preventDefault();
    
    // Сохраняем в глобальный стор
    if (activeTab === "profile") {
      updateProfile({
        name,
        avatar,
        bio,
        readingGoal: goal,
        genres: selectedGenres,
      });
    }

    // Simulate API call
    setTimeout(() => {
      setToastMsg(msg);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 500);
  };

  return (
    <motion.div {...pageTransition} className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ink">Личный кабинет</h1>
        <p className="text-graphite mt-2">Управляйте своим профилем и настройками</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-6 flex flex-col items-center shadow-sm">
            <div 
              className="relative group cursor-pointer mb-4"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover shadow-md bg-white" />
              <div className="absolute inset-0 bg-ink/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="text-white w-6 h-6" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              hidden 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
            <h3 className="font-semibold text-lg text-ink text-center max-w-full truncate">{name}</h3>
            <p className="text-sm text-graphite mb-6">{currentUser?.email || "user@example.com"}</p>
            
            <div className="w-full space-y-2">
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "profile" ? "bg-iris/10 text-iris" : "text-graphite hover:bg-graphite/10"}`}
              >
                <span className="flex items-center gap-2"><Settings className="w-4 h-4"/> Профиль</span>
                {activeTab === "profile" && <ChevronRight className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "notifications" ? "bg-iris/10 text-iris" : "text-graphite hover:bg-graphite/10"}`}
              >
                <span className="flex items-center gap-2"><Bell className="w-4 h-4"/> Уведомления</span>
                {activeTab === "notifications" && <ChevronRight className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setActiveTab("security")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === "security" ? "bg-iris/10 text-iris" : "text-graphite hover:bg-graphite/10"}`}
              >
                <span className="flex items-center gap-2"><Shield className="w-4 h-4"/> Безопасность</span>
                {activeTab === "security" && <ChevronRight className="w-4 h-4" />}
              </button>
              <button onClick={onLogout} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-coral rounded-xl text-sm font-medium transition-colors hover:bg-coral/10">
                <LogOut className="w-4 h-4"/> Выйти
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-2xl border border-white/50 p-8 shadow-sm">
          {activeTab === "profile" && (
            <form onSubmit={(e) => handleSave(e, "Профиль успешно обновлен!")} className="space-y-6">
              <motion.div variants={fadeUp} initial="hidden" animate="visible">
                <h2 className="text-xl font-semibold text-ink mb-4 border-b border-line pb-2">О себе</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Имя</label>
                    <input 
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 bg-white/50 border border-line rounded-xl focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris transition-all"
                      placeholder="Ваше имя"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Био (О себе)</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full p-3 bg-white/50 border border-line rounded-xl focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris resize-none h-24 transition-all"
                      placeholder="Расскажите о своих книжных предпочтениях..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">Читательская цель на год (книг)</label>
                    <div className="flex items-center gap-3">
                      <BookOpen className="text-iris w-5 h-5" />
                      <input 
                        type="number" 
                        value={goal}
                        onChange={(e) => setGoal(parseInt(e.target.value) || 0)}
                        className="w-24 p-2 text-center bg-white/50 border border-line rounded-xl focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="visible" className="pt-4">
                <h2 className="text-xl font-semibold text-ink mb-4 border-b border-line pb-2">Любимые жанры</h2>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        type="button"
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                          isSelected 
                            ? "bg-iris text-white shadow-md shadow-iris/20 scale-105" 
                            : "bg-white border border-line text-graphite hover:border-iris hover:text-iris"
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-ink text-white font-medium rounded-xl hover:bg-graphite transition-colors shadow-lg"
                >
                  Сохранить изменения
                </button>
              </div>
            </form>
          )}

          {activeTab === "notifications" && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
              <h2 className="text-xl font-semibold text-ink mb-4 border-b border-line pb-2">Настройки уведомлений</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/50 border border-line rounded-xl">
                  <div>
                    <h4 className="font-medium text-ink">Email-рассылка</h4>
                    <p className="text-xs text-graphite mt-1">Получать еженедельные подборки книг и новости</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-iris"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-white/50 border border-line rounded-xl">
                  <div>
                    <h4 className="font-medium text-ink">Push-уведомления</h4>
                    <p className="text-xs text-graphite mt-1">Уведомления о новых ответах ИИ в браузере</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-line peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-iris"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button onClick={(e) => handleSave(e, "Настройки уведомлений обновлены")} className="px-6 py-2.5 bg-ink text-white font-medium rounded-xl hover:bg-graphite transition-colors shadow-lg">
                  Сохранить настройки
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "security" && (
            <motion.form onSubmit={(e) => handleSave(e, "Пароль успешно изменен!")} variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
              <h2 className="text-xl font-semibold text-ink mb-4 border-b border-line pb-2">Смена пароля</h2>
              
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">Старый пароль</label>
                  <input 
                    type="password" 
                    required
                    className="w-full p-3 bg-white/50 border border-line rounded-xl focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">Новый пароль</label>
                  <input 
                    type="password" 
                    required
                    className="w-full p-3 bg-white/50 border border-line rounded-xl focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite mb-1">Подтвердите новый пароль</label>
                  <input 
                    type="password" 
                    required
                    className="w-full p-3 bg-white/50 border border-line rounded-xl focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-start">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-coral text-white font-medium rounded-xl hover:bg-coral/90 transition-colors shadow-lg shadow-coral/20"
                >
                  Обновить пароль
                </button>
              </div>
            </motion.form>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-8 right-8 z-50 bg-white border border-line shadow-2xl rounded-xl p-4 flex items-center gap-3"
        >
          <div className="bg-emerald-100 text-emerald-500 rounded-full p-1">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-ink">Успешно</p>
            <p className="text-xs text-graphite">{toastMsg}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
