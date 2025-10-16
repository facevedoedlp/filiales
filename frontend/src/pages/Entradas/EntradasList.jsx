import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';

const EntradasList = () => {
  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'tipo', header: 'Tipo' },
    { key: 'estadoCarga', header: 'Estado' },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Pedidos de entradas</h2>
          <p className="text-sm text-slate-500">Gestión de protocolos y solicitudes</p>
        </div>
        <Button to="/entradas/nueva" as={Link}>
          Nuevo pedido
        </Button>
      </div>
      <Table columns={columns} data={[]} emptyMessage="Próximamente" />
    </section>
  );
};

export default EntradasList;
