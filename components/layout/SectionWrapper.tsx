interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

export function SectionWrapper({
  id,
  children,
  className = "",
  fullWidth = false,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={`py-24 md:py-32 ${
        fullWidth ? "" : "mx-auto max-w-7xl px-6 md:px-12"
      } ${className}`}
    >
      {children}
    </section>
  );
}
