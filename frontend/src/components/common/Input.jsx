import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <label className="block text-sm font-medium text-slate-700">
      <span>{label}</span>
      <input
        ref={ref}
        className={`mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary ${className}`.trim()}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
});

Input.displayName = 'Input';

export default Input;
