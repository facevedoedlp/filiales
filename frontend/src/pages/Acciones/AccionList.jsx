import { Link } from 'react-router-dom';
import Button from '../../components/common/Button.jsx';
import Table from '../../components/common/Table.jsx';

const AccionList = () => {
  const columns = [
    { key: 'descripcion', header: 'Descripción' },
    { key: 'fechaRealizacion', header: 'Fecha' },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Acciones</h2>
          <p className="text-sm text-slate-500">Próximamente podrás gestionar tus acciones</p>
        </div>
        <Button to="/acciones/nueva" as={Link}>
          Nueva acción
        </Button>
      </div>
      <Table columns={columns} data={[]} emptyMessage="Próximamente" />
    </section>
  );
};

export default AccionList;
