import { site } from "@/data/site";

/**
 * Floating WhatsApp button, fixed bottom-right for the whole page.
 *
 * A plain `<a>` with no `"use client"`: everything it does is hover styling,
 * so it stays server-rendered and ships no JS. It deliberately does not reuse
 * `ui/Button` — that primitive hardcodes `h-12 px-6` for a pill, and beating
 * it into a 56px circle overrides more of the base than it reuses.
 *
 * `z-40` clears everything currently mounted (nothing goes above `z-[5]`, and
 * HeroPinned's layers are scoped to their own stacking context) while staying
 * under the unmounted Navbar's `z-50`, so nothing collides if the nav returns.
 * Being `position: fixed` it is unaffected by HeroPinned's and ProjectsGrid's
 * sticky stages.
 */
export function WhatsAppFab() {
  return (
    <a
      href={site.whatsapp.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Message ${site.name} on WhatsApp`}
      className={[
        "fixed right-5 sm:right-8 z-40",
        // max() keeps it clear of the iOS home indicator without pushing it
        // away from the corner on everything else.
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:bottom-8",
        "grid h-14 w-14 place-items-center rounded-full",
        "bg-[#25D366] text-[#07070b]",
        "shadow-[0_8px_24px_-6px_rgba(37,211,102,0.55)]",
        "transition duration-200 hover:scale-105 hover:brightness-110",
        "hover:shadow-[0_10px_32px_-4px_rgba(37,211,102,0.7)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "motion-reduce:transition-none motion-reduce:hover:scale-100",
      ].join(" ")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden
        focusable="false"
        className="h-7 w-7"
      >
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 5.83 2.42 8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.79.97-.14.16-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.59.25 1.04.4 1.4.52.59.19 1.12.16 1.54.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.11-.22-.17-.47-.29Z" />
      </svg>
    </a>
  );
}
