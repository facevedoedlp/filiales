import Table from '../common/Table';
import { formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';

export const EntradaTable = ({ entradas, onSelect }) => {
  const columns = [
    {
      key: 'evento',
      header: 'Evento',
      cell: (row) => (
        <button className="text-left font-semibold text-red-600" onClick={() => onSelect?.(row)}>
          {row.evento}
        </button>
      ),
    },
    {
      key: 'fecha_evento',
      header: 'Fecha',
      cell: (row) => formatDate(row.fecha_evento),
    },
    {
      key: 'cantidad',
      header: 'Cantidad',
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={row.estado === 'APROBADA' ? 'success' : row.estado === 'RECHAZADA' ? 'warning' : 'info'}>
          {row.estado}
        </Badge>
      ),
    },
    {
      key: 'filial_nombre',
      header: 'Filial',
    },
  ];

  return <Table columns={columns} data={entradas} />;
};

export default EntradaTable;
