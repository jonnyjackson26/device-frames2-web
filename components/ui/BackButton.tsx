import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export function BackButton({ href = "/", label = "Back to Home" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-1.5 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors mb-8"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      {label}
    </Link>
  );
}
