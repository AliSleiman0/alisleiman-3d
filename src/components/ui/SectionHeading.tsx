interface SectionHeadingProps {
  overline: string;
  title: string;
  description?: string;
}

export function SectionHeading({ overline, title, description }: SectionHeadingProps) {
  return (
    <div className="mb-12 max-w-2xl sm:mb-16">
      <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-accent">
        {overline}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
      )}
    </div>
  );
}
