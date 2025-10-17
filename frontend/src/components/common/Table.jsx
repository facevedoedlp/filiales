import { useMemo, useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

const Table = ({ columns = [], data = [], loading = false, onRowClick, actions, emptyMessage }) => {
  const [sort, setSort] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    if (!sort.key) return data;

    return [...data].sort((a, b) => {
      const valueA = a[sort.key];
      const valueB = b[sort.key];

      if (valueA == null) return 1;
      if (valueB == null) return -1;

      if (typeof valueA === 'string') {
        return sort.direction === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      if (typeof valueA === 'number') {
        return sort.direction === 'asc' ? valueA - valueB : valueB - valueA;
      }

      return 0;
    });
  }, [data, sort]);

  const handleSort = (column) => {
    if (!column.sortable) return;
    setSort((previous) => {
      if (previous.key === column.accessor) {
        return {
          key: column.accessor,
          direction: previous.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key: column.accessor, direction: 'asc' };
    });
  };

  if (!loading && (!data || data.length === 0)) {
    return (
      <EmptyState
        title="Nada por aquí aún"
        description={emptyMessage || 'Todavía no registraste información en esta sección.'}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.accessor ?? column.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${column.headerClassName ?? ''}`}
              >
                <button
                  type="button"
                  onClick={() => handleSort(column)}
                  className={`flex items-center gap-2 text-slate-600 ${
                    column.sortable ? 'hover:text-red-600' : 'cursor-default'
                  }`}
                >
                  <span>{column.header}</span>
                  {column.sortable ? <ArrowUpDown className="h-4 w-4" /> : null}
                </button>
              </th>
            ))}
            {actions ? <th className="px-4 py-3" /> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8">
                <div className="space-y-3">
                  <div className="h-4 rounded bg-slate-200" />
                  <div className="h-4 rounded bg-slate-200" />
                  <div className="h-4 rounded bg-slate-200" />
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((row) => (
              <tr
                key={row.id || row.uuid || JSON.stringify(row)}
                className={`transition hover:bg-red-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td
                    key={column.accessor ?? column.key}
                    className={`px-4 py-3 text-sm text-slate-600 ${column.cellClassName ?? ''}`}
                  >
                    {column.render ? column.render(row) : row[column.accessor]}
                  </td>
                ))}
                {actions ? (
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">{actions(row)}</div>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
