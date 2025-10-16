const baseStyles =
  'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300';

const variants = {
  secondary:
    'inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300',
  ghost:
    'inline-flex items-center justify-center rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-50',
};

const Button = ({ children, variant = 'primary', className = '', as: Component = 'button', ...props }) => {
  const styles = variant === 'primary' ? baseStyles : variants[variant] ?? baseStyles;
  return (
    <Component className={`${styles} ${className}`.trim()} {...props}>
      {children}
    </Component>
  );
};

export default Button;
