import { useState, useEffect, useCallback, useRef } from 'react';
import { getPreference, setPreference } from '@/utils/api';

type Theme = 'dark' | 'light';

const PREF_KEY = 'theme';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');
  const initialLoadDone = useRef(false);

  // Load theme from MongoDB on mount
  useEffect(() => {
    (async () => {
      try {
        let stored = await getPreference<string>(PREF_KEY);
        // Migrate from localStorage if MongoDB has no value
        if (!stored) {
          try {
            const local = localStorage.getItem('guitarworld-theme');
            if (local === 'light' || local === 'dark') {
              await setPreference(PREF_KEY, local);
              stored = local;
              localStorage.removeItem('guitarworld-theme');
            }
          } catch { /* ignore */ }
        }
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored);
        }
      } catch {
        // MongoDB unavailable, try localStorage fallback
        try {
          const local = localStorage.getItem('guitarworld-theme');
          if (local === 'light' || local === 'dark') setTheme(local);
        } catch { /* ignore */ }
      }
      initialLoadDone.current = true;
    })();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (!initialLoadDone.current) return;
    setPreference(PREF_KEY, theme).catch(() => {});
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  return { theme, toggleTheme, isDark } as const;
}
