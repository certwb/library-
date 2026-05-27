import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Check, ChevronDown } from "lucide-react";

const CITIES = [
  { id: "astana", name: "Астана", lat: 51.169392, lon: 71.449074 },
  { id: "almaty", name: "Алматы", lat: 43.222014, lon: 76.851248 },
  { id: "shymkent", name: "Шымкент", lat: 42.3417, lon: 69.5901 },
  { id: "aktau", name: "Актау", lat: 43.6481, lon: 51.1706 },
  { id: "atyrau", name: "Атырау", lat: 47.0945, lon: 51.9238 },
  { id: "karaganda", name: "Караганда", lat: 49.8019, lon: 73.1021 },
  { id: "aktobe", name: "Актобе", lat: 50.2839, lon: 57.1670 },
  { id: "pavlodar", name: "Павлодар", lat: 52.2833, lon: 76.9667 },
  { id: "ust-kamenogorsk", name: "Усть-Каменогорск", lat: 49.9483, lon: 82.6279 },
  { id: "taraz", name: "Тараз", lat: 42.9000, lon: 71.3667 },
];

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Радиус Земли в км
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);
  const [toastMessage, setToastMessage] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Geolocation logic
  useEffect(() => {
    const hasPrompted = localStorage.getItem("hasPromptedGeolocation");
    
    if (!hasPrompted && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          let nearestCity = CITIES[0];
          let minDistance = Infinity;

          CITIES.forEach((city) => {
            const distance = calculateDistance(latitude, longitude, city.lat, city.lon);
            if (distance < minDistance) {
              minDistance = distance;
              nearestCity = city;
            }
          });

          setSelectedCity(nearestCity);
          localStorage.setItem("userCity", JSON.stringify(nearestCity));
          localStorage.setItem("hasPromptedGeolocation", "true");
          
          setToastMessage(`Ваш город автоматически определен: ${nearestCity.name}`);
          setTimeout(() => setToastMessage(""), 5000);
        },
        (error) => {
          // Fallback logic
          console.warn("Geolocation permission denied or failed.", error);
          localStorage.setItem("hasPromptedGeolocation", "true");
        }
      );
    } else {
      const saved = localStorage.getItem("userCity");
      if (saved) {
        setSelectedCity(JSON.parse(saved));
      }
    }
  }, []);

  const handleSelect = (city) => {
    setSelectedCity(city);
    localStorage.setItem("userCity", JSON.stringify(city));
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full border border-line bg-white/40 px-4 py-2 text-sm font-medium text-ink shadow-sm backdrop-blur-md transition-all hover:bg-white/60 focus:outline-none focus:ring-2 focus:ring-iris/50"
      >
        <MapPin className="h-4 w-4 text-iris" />
        {selectedCity.name}
        <ChevronDown className={`h-4 w-4 text-graphite transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-line bg-white/80 p-2 shadow-xl backdrop-blur-xl z-50"
          >
            <div className="flex flex-col gap-1">
              {CITIES.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleSelect(city)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    selectedCity.id === city.id
                      ? "bg-iris/10 font-semibold text-iris"
                      : "text-ink hover:bg-black/5"
                  }`}
                >
                  {city.name}
                  {selectedCity.id === city.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-line bg-white/90 px-5 py-4 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-iris/10 text-iris">
              <MapPin className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium text-ink">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
