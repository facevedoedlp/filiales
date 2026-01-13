import { useMemo, useState } from 'react';
import { MapPin, Phone, Mail, Building } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import EmptyState from '../../components/common/EmptyState';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { useAuth } from '../../hooks/useAuth';
import { useFiliales } from '../../hooks/useFiliales';
import { ROLES } from '../../utils/constants';
import { FilialForm } from '../../components/filiales/FilialForm';

const FilialesList = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedFilial, setSelectedFilial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filters = useMemo(
    () => ({
      page,
      search: search.trim() || undefined,
    }),
    [page, search]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    createFilial,
    updateFilial,
    desactivarFilial,
    activarFilial,
    pagination,
  } = useFiliales(filters);

  const filiales = data?.resultados || data?.results || [];
  const total = pagination.count;
  const pageSize = filters.page_size ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSubmit = async (values) => {
    if (selectedFilial) {
      await updateFilial({ id: selectedFilial.id, data: values });
    } else {
      await createFilial(values);
    }
    setIsModalOpen(false);
    setSelectedFilial(null);
  };

  const handleToggle = async (filial) => {
    const isActive = filial.activa !== false;
    const message = isActive
      ? 'Deseas desactivar esta filial?'
      : 'Deseas activar esta filial?';
    const confirmed = window.confirm(message);
    if (!confirmed) return;
    if (isActive) {
      await desactivarFilial(filial.id);
    } else {
      await activarFilial(filial.id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFilial(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        title="No pudimos cargar las filiales"
        description={error?.message || 'Revisa tu conexion e intenta nuevamente.'}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Filiales</h1>
          <p className="text-sm text-slate-500">
            Consulta y gestiona las filiales registradas en el sistema.
          </p>
        </div>
        {user?.rol === ROLES.ADMIN && (
          <Button onClick={() => setIsModalOpen(true)}>Nueva filial</Button>
        )}
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Buscar"
          placeholder="Nombre, ciudad o pais"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
        />
      </div>

      {filiales.length === 0 ? (
        <EmptyState
          title="No encontramos filiales"
          description="Prueba modificando los filtros o creando una nueva filial."
          action={
            user?.rol === ROLES.ADMIN ? (
              <Button onClick={() => setIsModalOpen(true)}>Registrar filial</Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filiales.map((filial) => (
            <Card key={filial.id}>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      #{filial.codigo || filial.id}
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900">{filial.nombre}</h2>
                    <p className="text-sm text-slate-500">
                      {filial.ciudad && `${filial.ciudad}, ${filial.pais}`}
                    </p>
                  </div>
                  <Badge variant={filial.activa === false ? 'warning' : 'default'}>
                    {filial.activa === false ? 'Inactiva' : 'Activa'}
                  </Badge>
                </div>

                {filial.direccion && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-[#c41230]" />
                    {filial.direccion}
                  </p>
                )}

                {filial.contacto_telefono && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Phone className="h-4 w-4 text-[#c41230]" />
                    {filial.contacto_telefono}
                  </p>
                )}

                {filial.contacto_email && (
                  <p className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 text-[#c41230]" />
                    {filial.contacto_email}
                  </p>
                )}

                <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-[#c41230]" />
                    Integrantes: {filial.total_integrantes ?? filial.integrantes ?? 0}
                  </p>
                  {filial.presidente && (
                    <p className="mt-1 text-xs text-slate-500">
                      Presidente: {filial.presidente}
                    </p>
                  )}
                </div>

                {user?.rol === ROLES.ADMIN && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedFilial(filial);
                        setIsModalOpen(true);
                      }}
                    >
                      Editar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(filial)}>
                      {filial.activa === false ? 'Activar' : 'Desactivar'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {filiales.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <span>
            Pagina {page} de {totalPages} · {total} filiales
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={selectedFilial ? 'Editar filial' : 'Nueva filial'}
      >
        <FilialForm defaultValues={selectedFilial || {}} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
};

export default FilialesList;
