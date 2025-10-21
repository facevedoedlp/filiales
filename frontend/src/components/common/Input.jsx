import { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', helperText, ...props }, ref) => {
  return (
    <label className={`flex flex-col gap-1 text-sm font-medium text-slate-700 ${className}`}>
      {label && <span>{label}</span>}
      <input
        ref={ref}
        className={`w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 ${
          error ? 'border-red-500' : ''
        }`}
        {...props}
      />
      {helperText && !error && <span className="text-xs text-slate-500">{helperText}</span>}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
});

Input.displayName = 'Input';

export default Input;
