import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';
import Loading from '../../components/common/Loading.jsx';
import { useFiliales } from '../../hooks/useFiliales.js';
import { formatDate, formatBoolean } from '../../utils/formatters.js';

const FilialList = () => {
  const [filters] = useState({ page: 1, limit: 10 });
  const { data, isLoading } = useFiliales(filters);

  const columns = [
    { key: 'nombre', header: 'Nombre' },
    {
      key: 'provincia',
      header: 'Provincia',
      render: (row) => row.provincia?.nombre ?? '—',
    },
    {
      key: 'pais',
      header: 'País',
      render: (row) => row.pais?.nombre ?? '—',
    },
    {
      key: 'esActiva',
      header: 'Activa',
      render: (row) => formatBoolean(row.esActiva),
    },
    {
      key: 'fechaFundacion',
      header: 'Fundación',
      render: (row) => formatDate(row.fechaFundacion),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      render: (row) => (
        <Link className="text-primary hover:underline" to={`/filiales/${row.id}`}>
          Ver detalle
        </Link>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Filiales</h2>
          <p className="text-sm text-slate-500">Administra las filiales registradas</p>
        </div>
        <Button as={Link} to="/filiales/nueva">
          Nueva filial
        </Button>
      </div>
      {isLoading ? <Loading /> : <Table columns={columns} data={data?.items ?? []} />}
    </section>
  );
};

export default FilialList;
