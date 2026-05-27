import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Github, Twitter, Instagram, Send, CheckCircle2 } from 'lucide-react';
import { buttonTap } from '../lib/motion';

export function Footer({ onViewChange, onRandom }) {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setEmail('');
        setIsSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer className="w-full mt-24 border-t border-white/20 bg-white/40 backdrop-blur-xl relative z-10">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Column 1: Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-white shadow-soft">
                <BookMarked className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold tracking-tight text-ink">NextRead</span>
            </div>
            <p className="text-sm text-graphite leading-relaxed max-w-xs">
              Умная библиотека нового поколения. Мы объединяем силу ИИ и любовь к книгам, чтобы каждый нашел свою идеальную историю.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {[Github, Twitter, Instagram].map((Icon, idx) => (
                <motion.a
                  key={idx}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-8 h-8 rounded-full bg-white border border-line flex items-center justify-center text-graphite hover:text-iris hover:border-iris/30 transition-colors shadow-sm"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h4 className="font-semibold text-ink mb-4">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onViewChange && onViewChange('search')} className="text-sm text-graphite hover:text-iris transition-colors relative group inline-block">
                  Главная
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-iris transition-all duration-300 group-hover:w-full"></span>
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange && onViewChange('search')} className="text-sm text-graphite hover:text-iris transition-colors relative group inline-block">
                  Каталог книг
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-iris transition-all duration-300 group-hover:w-full"></span>
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange && onViewChange('shelves')} className="text-sm text-graphite hover:text-iris transition-colors relative group inline-block">
                  Мои полки
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-iris transition-all duration-300 group-hover:w-full"></span>
                </button>
              </li>
              <li>
                <button onClick={() => onRandom && onRandom()} className="text-sm text-graphite hover:text-iris transition-colors relative group inline-block">
                  Случайная книга
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-iris transition-all duration-300 group-hover:w-full"></span>
                </button>
              </li>
              <li>
                <button onClick={() => onViewChange && onViewChange('support')} className="text-sm text-graphite hover:text-iris transition-colors relative group inline-block">
                  Поддержка
                  <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-iris transition-all duration-300 group-hover:w-full"></span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Top Genres */}
          <div>
            <h4 className="font-semibold text-ink mb-4">Топ жанров СНГ</h4>
            <ul className="space-y-2">
              {['Русская классика', 'Киберпанк', 'Эпическое фэнтези', 'Психологический триллер', 'Современная проза'].map((genre, idx) => (
                <li key={idx}>
                  <a href="#" className="text-sm text-graphite hover:text-iris transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-line group-hover:bg-iris transition-colors"></span>
                    {genre}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h4 className="font-semibold text-ink mb-4">Книжные новинки</h4>
            <p className="text-sm text-graphite mb-4">
              Подпишитесь на рассылку, чтобы первыми узнавать о лучших новинках. Без спама.
            </p>
            <form onSubmit={handleSubscribe} className="relative mt-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                disabled={isSubscribed}
                className="w-full pl-4 pr-12 py-2.5 bg-white border border-line rounded-xl text-sm focus:outline-none focus:border-iris focus:ring-1 focus:ring-iris disabled:opacity-50 transition-all shadow-sm"
              />
              <motion.button
                type="submit"
                {...buttonTap}
                disabled={isSubscribed || !email}
                className={`absolute right-1 top-1 bottom-1 px-3 rounded-lg flex items-center justify-center transition-colors ${
                  isSubscribed ? 'bg-emerald-500 text-white' : 'bg-iris/10 text-iris hover:bg-iris hover:text-white'
                } disabled:cursor-not-allowed`}
              >
                {isSubscribed ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </motion.button>
            </form>
          </div>

        </div>
        
        <div className="mt-12 pt-6 border-t border-line flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-graphite">
            © {new Date().getFullYear()} NextRead Library. Все права защищены.
          </p>
          <div className="flex gap-4 text-xs text-graphite">
            <a href="#" className="hover:text-ink transition-colors">Политика конфиденциальности</a>
            <a href="#" className="hover:text-ink transition-colors">Условия использования</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
