import { forwardRef, useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

const Select = forwardRef(
  (
    {
      label,
      options = [],
      placeholder = 'Seleccionar...',
      error,
      isMulti = false,
      value,
      onChange,
      searchable = true,
      disabled = false,
      className = '',
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');

    const filteredOptions = useMemo(() => {
      if (!searchable || !query) return options;
      return options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase())
      );
    }, [options, query, searchable]);

    const handleSelect = (option) => {
      if (isMulti) {
        const isSelected = Array.isArray(value)
          ? value.some((val) => val.value === option.value)
          : false;
        const newValue = isSelected
          ? value.filter((val) => val.value !== option.value)
          : [...(value || []), option];
        onChange?.(newValue);
      } else {
        onChange?.(option);
        setIsOpen(false);
      }
    };

    const renderValue = () => {
      if (isMulti) {
        if (!value || value.length === 0) return (
          <span className="text-slate-400">{placeholder}</span>
        );
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item) => (
              <span
                key={item.value}
                className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs text-red-700"
              >
                {item.label}
              </span>
            ))}
          </div>
        );
      }

      if (!value) return <span className="text-slate-400">{placeholder}</span>;
      return <span>{value.label}</span>;
    };

    return (
      <label className={`block text-sm font-medium text-slate-700 ${className}`}>
        {label ? <span>{label}</span> : null}
        <div
          className={`mt-1 flex min-h-[42px] items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-red-500 focus-within:ring-1 focus-within:ring-red-500 ${
            disabled ? 'bg-slate-100 opacity-75' : ''
          }`}
          tabIndex={0}
          ref={ref}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              !disabled && setIsOpen((prev) => !prev);
            }
          }}
        >
          <div className="flex-1 text-sm text-slate-700">{renderValue()}</div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
        </div>
        {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}

        {isOpen ? (
          <div className="relative">
            <div className="absolute z-20 mt-2 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
              {searchable ? (
                <div className="flex items-center border-b border-slate-200 px-3 py-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="ml-2 w-full border-none text-sm text-slate-600 focus:outline-none"
                    placeholder="Buscar..."
                  />
                </div>
              ) : null}
              <ul className="max-h-60 overflow-y-auto py-2 text-sm">
                {filteredOptions.length === 0 ? (
                  <li className="px-4 py-2 text-slate-400">No hay resultados</li>
                ) : (
                  filteredOptions.map((option) => {
                    const isSelected = isMulti
                      ? value?.some((val) => val.value === option.value)
                      : value?.value === option.value;

                    return (
                      <li
                        key={option.value}
                        className={`flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-red-50 ${
                          isSelected ? 'text-red-600' : 'text-slate-600'
                        }`}
                        onClick={() => handleSelect(option)}
                      >
                        <span>{option.label}</span>
                        {isSelected ? <Check className="h-4 w-4" /> : null}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          </div>
        ) : null}
      </label>
    );
  }
);

Select.displayName = 'Select';

export default Select;
