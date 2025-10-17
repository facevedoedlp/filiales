import { useEffect, useState } from 'react';
import { X, Search } from 'lucide-react';

const SearchBar = ({ placeholder = 'Buscar...', onSearch, delay = 300, className = '' }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch?.(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay, onSearch]);

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div className={`relative flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 ${className}`}>
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        className="ml-2 w-full border-none bg-transparent text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-full p-1 text-slate-400 transition hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
};

export default SearchBar;
