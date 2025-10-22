const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-[#c41230] text-white hover:bg-[#a50f27] focus:ring-[#c41230]',
  secondary:
    'bg-white text-[#c41230] border border-[#c41230]/30 hover:bg-[#c41230]/5 focus:ring-[#c41230]/40',
  ghost: 'bg-transparent text-[#c41230] hover:bg-[#c41230]/10 focus:ring-[#c41230]/40',
};

const sizes = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  leftIcon,
  rightIcon,
  ...props
}) => {
  const classes = [baseStyles, variants[variant], sizes[size], className].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {leftIcon && <span className="flex h-4 w-4 items-center justify-center">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="flex h-4 w-4 items-center justify-center">{rightIcon}</span>}
    </button>
  );
};

export default Button;
