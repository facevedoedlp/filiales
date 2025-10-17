const COLOR_MAP = {
  success: 'bg-green-100 text-green-700',
  danger: 'bg-red-100 text-red-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  neutral: 'bg-slate-100 text-slate-600',
};

const Badge = ({ children, variant = 'neutral', className = '' }) => {
  const classes = COLOR_MAP[variant] || COLOR_MAP.neutral;

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${classes} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
