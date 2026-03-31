export default function Footer() {
  return (
    <footer
      className="text-center py-8 px-4 mt-8"
      style={{ borderTop: '1px solid var(--color-border-subtle)' }}
    >
      <p
        className="text-sm font-semibold"
        style={{ color: 'var(--color-text-muted)' }}
      >
        GuitarWorld
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: 'var(--color-text-muted)', opacity: 0.6 }}
      >
        Every chord in every key
      </p>
    </footer>
  );
}
