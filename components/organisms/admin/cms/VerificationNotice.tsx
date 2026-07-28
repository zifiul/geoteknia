'use client';

type Props = {
  checked: boolean;
  onCheckedChange: (value: boolean) => void;
  disabled?: boolean;
};

export function VerificationNotice({ checked, onCheckedChange, disabled }: Props) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      data-testid="cms-verification-notice"
    >
      <p className="font-semibold">Verificación técnica obligatoria (YMYL)</p>
      <p className="mt-1 text-amber-900/90">
        Confirme que ha revisado la exactitud técnica, normativa aplicable y
        claims del contenido antes de aprobar.
      </p>
      <label className="mt-3 flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-amber-400"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
        />
        <span>
          He verificado el contenido con criterio técnico y asumo la
          responsabilidad de esta aprobación.
        </span>
      </label>
    </div>
  );
}
