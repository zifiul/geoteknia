'use client';

type Props = {
  message: string | null;
  variant?: 'success' | 'error';
};

export function ProjectActionFeedback({
  message,
  variant = 'success',
}: Props) {
  if (!message) {
    return null;
  }

  return (
    <p
      role="status"
      aria-live="polite"
      className={
        variant === 'error'
          ? 'text-sm text-red-700'
          : 'text-sm text-brand-accent'
      }
    >
      {message}
    </p>
  );
}
