import Button from './Button';

export const Table = ({
  columns,
  data = [],
  emptyMessage = 'Sin registros disponibles',
  pagination,
  onRowClick,
}) => {
  const hasData = data.length > 0;
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? data.length ?? 10;
  const count = pagination?.count ?? data.length;
  const totalPages = Math.max(1, Math.ceil(count / (pageSize || 1)));
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600"
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white text-sm text-slate-600">
            {!hasData ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-slate-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id ?? index}
                  className={`transition hover:bg-slate-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {typeof column.cell === 'function' ? column.cell(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && hasData && (
        <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <span>
            Mostrando {(page - 1) * pageSize + 1} -
            {Math.min(page * pageSize, count)} de {count}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={!canGoBack}
              onClick={() => canGoBack && pagination.onPageChange?.(page - 1)}
            >
              Anterior
            </Button>
            <span className="text-xs font-semibold uppercase text-slate-500">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={!canGoForward}
              onClick={() => canGoForward && pagination.onPageChange?.(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
