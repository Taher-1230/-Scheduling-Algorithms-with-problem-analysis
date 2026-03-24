import { MoonStar, SunMedium } from 'lucide-react';

function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-slate-700 shadow-glow transition hover:-translate-y-0.5 dark:text-slate-100"
    >
      {darkMode ? <SunMedium size={16} /> : <MoonStar size={16} />}
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}

export default ThemeToggle;
