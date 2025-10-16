import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

const AccionForm = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Nueva acción</h2>
        <p className="text-sm text-slate-500">Formulario referencial para futuros desarrollos</p>
      </div>
      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Input label="Descripción" placeholder="Descripción de la acción" />
        <Input label="Fecha" type="date" />
        <Button type="button">Guardar</Button>
      </form>
    </section>
  );
};

export default AccionForm;
