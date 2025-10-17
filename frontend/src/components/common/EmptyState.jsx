import Button from './Button.jsx';

const EmptyState = ({
  icon,
  title = 'Sin registros',
  description = 'No encontramos información para mostrar.',
  actionLabel,
  onAction,
}) => {
  const Icon = icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
      {Icon ? <Icon className="h-12 w-12 text-slate-300" /> : null}
      <h3 className="mt-4 text-lg font-semibold text-slate-700">{title}</h3>
      <p className="mt-2 text-sm">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyState;
