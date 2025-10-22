const variants = {
  default: 'bg-[#c41230]/10 text-[#c41230]',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  info: 'bg-slate-100 text-slate-700',
  neutral: 'bg-slate-100 text-slate-600',
};

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const classes = `inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variants[variant]} ${className}`;
  return <span className={classes}>{children}</span>;
};

export default Badge;
