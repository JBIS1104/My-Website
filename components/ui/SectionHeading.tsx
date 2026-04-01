interface SectionHeadingProps {
  children: React.ReactNode;
  subtitle?: string;
}

export function SectionHeading({ children, subtitle }: SectionHeadingProps) {
  return (
    <div className="mb-16">
      <h2
        className="text-[clamp(2rem,5vw,3.5rem)] font-bold leading-tight tracking-tight
                   text-[var(--color-text)]"
      >
        {children}
      </h2>
      {subtitle && (
        <p className="mt-4 text-lg text-[var(--color-text-muted)]">
          {subtitle}
        </p>
      )}
      <div className="mt-6 h-1 w-16 rounded-full bg-[var(--color-accent)]" />
    </div>
  );
}
