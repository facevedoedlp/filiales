import { forwardRef, useEffect, useRef, useState } from 'react';

const TextArea = forwardRef(
  (
    {
      label,
      error,
      maxLength,
      autoResize = true,
      className = '',
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const innerRef = useRef(null);
    const combinedRef = ref || innerRef;
    const [currentLength, setCurrentLength] = useState(value?.length || 0);

    useEffect(() => {
      if (autoResize && combinedRef?.current) {
        const element = combinedRef.current;
        element.style.height = 'auto';
        element.style.height = `${element.scrollHeight}px`;
      }
    }, [combinedRef, value, autoResize]);

    const handleChange = (event) => {
      setCurrentLength(event.target.value.length);
      onChange?.(event);
    };

    return (
      <label className={`block text-sm font-medium text-slate-700 ${className}`}>
        {label ? <span>{label}</span> : null}
        <textarea
          ref={combinedRef}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          {...props}
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          {error ? <span className="text-red-600">{error}</span> : <span />}
          {maxLength ? (
            <span>
              {currentLength}/{maxLength}
            </span>
          ) : null}
        </div>
      </label>
    );
  }
);

TextArea.displayName = 'TextArea';

export default TextArea;
