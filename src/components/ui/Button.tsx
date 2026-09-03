import { cn } from "@/lib/utils";

interface ButtonProps {
  href: string;
  variant?: "primary" | "ghost";
  external?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Button({
  href,
  variant = "primary",
  external,
  children,
  className,
}: ButtonProps) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "inline-flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-all duration-200",
        variant === "primary" &&
          "bg-accent text-white shadow-[0_0_24px_-6px_var(--accent)] hover:shadow-[0_0_36px_-4px_var(--accent)] hover:brightness-110",
        variant === "ghost" &&
          "border border-border-soft text-foreground hover:border-white/25 hover:bg-surface",
        className
      )}
    >
      {children}
    </a>
  );
}
