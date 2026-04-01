export function Footer() {
  return (
    <footer data-egg="footer" className="border-t border-[var(--color-border)] py-8">
      <div className="mx-auto max-w-7xl px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} Junbyung Park. Built with Next.js.
        </p>
        <div className="flex gap-6">
          <a
            href="https://github.com/JBIS1104"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)] transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/junbyung-park"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)] transition-colors"
          >
            LinkedIn
          </a>
          <a
            href="mailto:junbyung.park@student.manchester.ac.uk"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent-text)] transition-colors"
          >
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
