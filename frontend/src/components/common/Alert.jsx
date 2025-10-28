const variants = {
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
};

export const Alert = ({ title, description, variant = 'info', icon }) => {
  return (
    <div className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${variants[variant]}`}>
      {icon && <span className="mt-1 text-lg">{icon}</span>}
      <div>
        {title && <h4 className="font-semibold">{title}</h4>}
        {description && <p>{description}</p>}
      </div>
    </div>
  );
};

export default Alert;
