'use client';

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

export function BodyEditor({ label, value, onChange, error }: Props) {
  return (
    <label className="mt-3 block text-sm text-brand-secondary">
      {label}
      <textarea
        rows={10}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-brand-secondary/30 px-3 py-2 font-mono text-sm"
        spellCheck={false}
      />
      {error ? (
        <p role="alert" className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </label>
  );
}
