import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';

const IntegranteList = () => {
  const columns = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'dni', header: 'DNI' },
    { key: 'telefono', header: 'Teléfono' },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Integrantes</h2>
          <p className="text-sm text-slate-500">Gestiona los integrantes de cada filial</p>
        </div>
        <Button to="/integrantes/nuevo" as={Link}>
          Nuevo integrante
        </Button>
      </div>
      <Table columns={columns} data={[]} emptyMessage="Próximamente" />
    </section>
  );
};

export default IntegranteList;
