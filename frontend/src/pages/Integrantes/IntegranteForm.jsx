import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

const IntegranteForm = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Nuevo integrante</h2>
        <p className="text-sm text-slate-500">Formulario básico a completar en futuras iteraciones</p>
      </div>
      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Input label="Nombre" placeholder="Nombre completo" />
        <Input label="DNI" placeholder="Documento" />
        <Input label="Teléfono" placeholder="Teléfono" />
        <Button type="button">Guardar</Button>
      </form>
    </section>
  );
};

export default IntegranteForm;
