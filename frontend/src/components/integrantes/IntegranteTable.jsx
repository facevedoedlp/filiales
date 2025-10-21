import { Badge } from '../common/Badge';
import Table from '../common/Table';
import { formatDate } from '../../utils/formatters';
import { ROLES_LABELS } from '../../utils/constants';

export const IntegranteTable = ({ integrantes, onSelect }) => {
  const columns = [
    {
      key: 'nombre',
      header: 'Nombre',
      cell: (row) => (
        <button className="text-left font-semibold text-red-600" onClick={() => onSelect?.(row)}>
          {row.nombre}
        </button>
      ),
    },
    {
      key: 'rol',
      header: 'Rol',
      cell: (row) => <span>{ROLES_LABELS[row.rol] || row.rol}</span>,
    },
    {
      key: 'filial_nombre',
      header: 'Filial',
    },
    {
      key: 'estado',
      header: 'Estado',
      cell: (row) => (
        <Badge variant={row.estado === 'ACTIVO' ? 'success' : 'warning'}>
          {row.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'fecha_ingreso',
      header: 'Ingreso',
      cell: (row) => formatDate(row.fecha_ingreso),
    },
  ];

  return <Table columns={columns} data={integrantes} />;
};

export default IntegranteTable;
