import { Inbox } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'Sin registros',
  description = 'Todavía no hay información para mostrar.',
  action,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c41230]/10 text-[#c41230]">
        <Icon className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {description && <p className="text-sm text-slate-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
      {!action && actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};

export default EmptyState;
