export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-10 w-10 border-4',
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-[#c41230] border-t-transparent ${sizes[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Cargando...</span>
    </span>
  );
};

export default Spinner;
