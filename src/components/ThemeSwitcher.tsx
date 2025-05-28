import { useEffect, useState } from 'react';
import { Sun, Monitor, MoonStar } from 'lucide-react';

type Theme = 'light' | 'system' | 'dark';

const themes = [
  { key: 'light' as Theme, icon: Sun, label: 'ライト' },
  { key: 'system' as Theme, icon: Monitor, label: 'システム' },
  { key: 'dark' as Theme, icon: MoonStar, label: 'ダーク' },
];

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('system');
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme;
    if (saved && ['light', 'system', 'dark'].includes(saved)) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      setTheme('system');
      applyTheme('system');
    }
  }, []);

  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        applyTheme('system');
      };
      mediaQuery.addEventListener('change', listener);
      return () => {
        mediaQuery.removeEventListener('change', listener);
      };
    }
  }, [theme]);

  function applyTheme(selected: Theme) {
    const applied: 'light' | 'dark' = selected === 'system' ? getSystemTheme() : selected as 'light' | 'dark';
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(applied);
    setCurrentTheme(applied);
  }

  function handleChange(selected: Theme) {
    setTheme(selected);
    localStorage.setItem('theme', selected);
    applyTheme(selected);
  }

  const isDark = currentTheme === 'dark';

  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className={`
        ${isDark ? 'bg-neutral-800 border-neutral-700' : 'bg-white border-gray-200'}
        rounded-full shadow-sm border flex items-center px-1.5 py-1.5 
        min-w-[80px] justify-center gap-1 transition-colors duration-200
      `}>
        {themes.map((t) => {
          const IconComponent = t.icon;
          const isActive = theme === t.key;
          
          return (
            <button
              key={t.key}
              aria-pressed={isActive}
              onClick={() => handleChange(t.key)}
              className={`
                ${isDark 
                  ? `${isActive ? 'bg-neutral-600' : 'hover:text-white'} ` 
                  : `${isActive ? 'bg-gray-200' : 'hover:text-black'} `
                }
                border-none rounded-full p-2 cursor-pointer outline-none text-neutral-400
                flex items-center justify-center
              `}
            >
              <IconComponent size={16} />
            </button>
          );
        })}
      </div>
    </div>
  );
}