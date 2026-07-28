type Props = {
  isActive: boolean;
  twofaEnabled: boolean;
};

export function UserStatusBadge({ isActive, twofaEnabled }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="user-status-badge">
      <span
        className={
          isActive
            ? 'inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800'
            : 'inline-flex rounded-full bg-brand-neutral px-2.5 py-0.5 text-xs font-medium text-brand-secondary'
        }
      >
        {isActive ? 'Activo' : 'Inactivo'}
      </span>
      {twofaEnabled ? (
        <span className="inline-flex rounded-full bg-brand-accent/15 px-2.5 py-0.5 text-xs font-medium text-brand-primary">
          2FA activo
        </span>
      ) : (
        <span className="text-xs text-brand-secondary">Sin 2FA</span>
      )}
    </div>
  );
}
