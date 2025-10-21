import { useState } from 'react';
import Spinner from '../../components/common/Spinner';
import { IntegranteTable } from '../../components/integrantes/IntegranteTable';
import { useIntegrantes } from '../../hooks/useIntegrantes';
import { useFiliales } from '../../hooks/useFiliales';
import Select from '../../components/common/Select';
import { ESTADOS_INTEGRANTE, ROLES } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import IntegranteForm from '../../components/integrantes/IntegranteForm';

const IntegrantesList = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({});
  const [selectedIntegrante, setSelectedIntegrante] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { integrantes, isLoading, createIntegrante, updateIntegrante, changeEstado } = useIntegrantes(filters);
  const { filiales } = useFiliales();

  const filialesOptions = filiales?.map((filial) => ({ value: filial.id, label: filial.nombre })) || [];

  const handleSubmit = (data) => {
    if (selectedIntegrante) {
      updateIntegrante({ id: selectedIntegrante.id, data });
    } else {
      createIntegrante(data);
    }
    setIsModalOpen(false);
    setSelectedIntegrante(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Integrantes</h1>
          <p className="text-sm text-slate-500">Gestiona los integrantes según tu rol y permisos.</p>
        </div>
        {user?.rol !== ROLES.INTEGRANTE && (
          <Button onClick={() => setIsModalOpen(true)}>Nuevo integrante</Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Filial"
          options={filialesOptions}
          value={filters.filial || ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, filial: event.target.value || undefined }))}
        />
        <Select
          label="Estado"
          options={ESTADOS_INTEGRANTE}
          value={filters.estado || ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, estado: event.target.value || undefined }))}
        />
        <Select
          label="Rol"
          options={Object.values(ROLES).map((role) => ({ value: role, label: role }))}
          value={filters.rol || ''}
          onChange={(event) => setFilters((prev) => ({ ...prev, rol: event.target.value || undefined }))}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <IntegranteTable
          integrantes={integrantes}
          onSelect={(integrante) => {
            setSelectedIntegrante(integrante);
            setIsModalOpen(true);
          }}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedIntegrante(null);
        }}
        title={selectedIntegrante ? 'Editar integrante' : 'Nuevo integrante'}
      >
        <IntegranteForm
          defaultValues={selectedIntegrante || { filial: user?.filial_id }}
          filialesOptions={filialesOptions}
          onSubmit={handleSubmit}
        />
        {selectedIntegrante && (
          <div className="mt-4 border-t border-slate-200 pt-4">
            <Button
              variant="ghost"
              onClick={() =>
                changeEstado({
                  id: selectedIntegrante.id,
                  data: { estado: selectedIntegrante.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO' },
                })
              }
            >
              Cambiar a {selectedIntegrante.estado === 'ACTIVO' ? 'inactivo' : 'activo'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IntegrantesList;
