export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border-soft bg-surface px-3 py-1 font-mono text-xs text-foreground/80">
      {children}
    </span>
  );
}
