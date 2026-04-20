import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/50 animate-pulse" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative p-2 rounded-full transition-all duration-500 ease-luxury group overflow-hidden"
      aria-label="Toggle theme"
    >
      {/* Background hover effect */}
      <span className="absolute inset-0 bg-accent/10 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
      
      <div className="relative z-10 flex items-center justify-center">
        <Sun 
          size={20} 
          className={`transition-all duration-500 transform ${
            isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
          } text-accent`}
        />
        <Moon 
          size={20} 
          className={`absolute transition-all duration-500 transform ${
            isDark ? "rotate-0 scale-100 opacity-100 text-gold-light" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>

      {/* Subtle ring animation */}
      <span className="absolute inset-0 border border-accent/20 rounded-full scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-500" />
    </button>
  );
}
