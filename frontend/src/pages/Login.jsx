import { useForm } from 'react-hook-form';
import { Navigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import { composeValidators, required } from '../utils/validators';

const Login = () => {
  const { login, user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (values) => {
    login(values);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-slate-100 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-2xl font-semibold text-red-600">Sistema de Filiales</h1>
        <p className="mt-2 text-sm text-slate-500">Ingrese sus credenciales para continuar.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <Input
            label="Usuario"
            placeholder="usuario"
            error={errors.username?.message}
            {...register('username', composeValidators(required()))}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', composeValidators(required()))}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Ingresar
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
