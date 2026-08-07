import { cn } from '@/lib/shared/cn';

type IconProps = { className?: string };

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn('size-[18px] shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  );
}

export function PersonAddIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}

export function WarningIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

export function PipelineIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22 11V3h-7v8h7zM9 3H2v8h7V3zm13 12h-7v8h7v-8zM9 13H2v8h7v-8z" />
    </svg>
  );
}

export function ChartIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
    </svg>
  );
}

export function ClockIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn('size-5 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}

export function DocumentIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 9l1.25-2.75L23 5l-2.75-1.25L19 1l-1.25 2.75L15 5l2.75 1.25L19 9zm-7.5.5L9 4 6.5 9.5 1 12l5.5 2.5L9 20l2.5-5.5L17 12l-5.5-2.5zM19 15l-1.25 2.75L15 19l2.75 1.25L19 23l1.25-2.75L23 19l-2.75-1.25L19 15z" />
    </svg>
  );
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

export function NotificationsIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}

export function ArrowForwardIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn('size-4 shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KanbanIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-[18px] shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 3h5v18H4V3zm6 5h5v13h-5V8zm6 3h5v10h-5v-10z" />
    </svg>
  );
}

export function AssignIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-[18px] shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

export function NoteAddIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-[18px] shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z" />
    </svg>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn('size-[18px] shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 3v12M7 10l5 5 5-5M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AddIcon({ className }: IconProps) {
  return (
    <svg
      aria-hidden
      className={cn('size-[18px] shrink-0', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

export function HistoryIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
    </svg>
  );
}

export function NotificationsActiveIcon({ className }: IconProps) {
  return (
    <svg aria-hidden className={cn('size-5 shrink-0', className)} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      <circle cx="18" cy="6" r="3.5" />
    </svg>
  );
}
