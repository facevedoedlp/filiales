import Button from './Button.jsx';

const Pagination = ({ page = 1, totalPages = 1, total = 0, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (page > 1) {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600 md:flex-row">
      <p>
        Página <strong>{page}</strong> de <strong>{totalPages}</strong> —{' '}
        <span className="text-slate-500">{total} registros en total</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={page === 1}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={page === totalPages}
          className="disabled:cursor-not-allowed disabled:opacity-50"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
