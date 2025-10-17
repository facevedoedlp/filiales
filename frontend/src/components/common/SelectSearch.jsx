import Select from 'react-select';

const SelectSearch = ({
  label,
  value,
  onChange,
  options = [],
  isLoading = false,
  placeholder = 'Seleccionar...',
  error,
  disabled = false,
  isSearchable = true,
  required = false,
}) => {
  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: error
        ? '#ef4444'
        : state.isFocused
        ? '#dc2626'
        : '#e2e8f0',
      boxShadow: state.isFocused ? '0 0 0 1px #dc2626' : 'none',
      '&:hover': {
        borderColor: error ? '#ef4444' : '#dc2626',
      },
      backgroundColor: disabled ? '#f8fafc' : 'white',
      cursor: disabled ? 'not-allowed' : 'default',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? '#dc2626'
        : state.isFocused
        ? '#fee2e2'
        : 'white',
      color: state.isSelected ? 'white' : '#0f172a',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: '#dc2626',
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999,
    }),
    placeholder: (base) => ({
      ...base,
      color: '#94a3b8',
    }),
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}
      <Select
        value={value}
        onChange={onChange}
        options={options}
        isLoading={isLoading}
        isDisabled={disabled}
        isSearchable={isSearchable}
        placeholder={placeholder}
        noOptionsMessage={() => 'No hay opciones disponibles'}
        loadingMessage={() => 'Cargando...'}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        isClearable
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default SelectSearch;
