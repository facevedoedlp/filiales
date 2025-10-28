import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  const baseClasses =
    'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-1';
  const focusClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-[#c41230] focus:ring-[#c41230]';

  return (
    <label className={`flex flex-col gap-1 text-sm font-medium text-slate-700 ${className}`}>
      {label && <span>{label}</span>}
      <input ref={ref} className={`${baseClasses} ${focusClasses}`} {...props} />
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
});

Input.displayName = 'Input';

export default Input;
