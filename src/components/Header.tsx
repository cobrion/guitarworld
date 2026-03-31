import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  return (
    <header
      className="flex items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
    >
      <div className="flex items-center gap-3">
        <img
          src="/guitar-icon-clean.png"
          alt="Guitar"
          className="w-10 h-10 sm:w-12 sm:h-12"
          style={{ objectFit: 'contain' }}
        />
        <div>
          <h1
            className="text-xl sm:text-2xl font-bold tracking-tight"
            style={{ color: 'var(--color-primary)' }}
          >
            GuitarWorld
          </h1>
          <p
            className="text-xs sm:text-sm"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Every chord in every key
          </p>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
