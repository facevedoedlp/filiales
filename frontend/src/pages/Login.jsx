import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import useAuth from '../hooks/useAuth.js';

const schema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const Login = () => {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    await login(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <h2 className="text-2xl font-semibold text-center text-primary">Club Estudiantes de La Plata</h2>
        <p className="mt-2 text-center text-sm text-slate-500">Gestión de Filiales</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Correo" type="email" {...register('correo')} error={errors.correo?.message} />
          <Input label="Contraseña" type="password" {...register('password')} error={errors.password?.message} />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
