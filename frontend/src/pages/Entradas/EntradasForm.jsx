import Button from '../../components/common/Button.jsx';
import Input from '../../components/common/Input.jsx';

const EntradasForm = () => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Nuevo pedido de entradas</h2>
        <p className="text-sm text-slate-500">Completa la información para solicitar nuevas entradas</p>
      </div>
      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <Input label="Nombre" placeholder="Nombre del solicitante" />
        <Input label="Tipo" placeholder="Tipo de pedido" />
        <Button type="button">Guardar</Button>
      </form>
    </section>
  );
};

export default EntradasForm;
