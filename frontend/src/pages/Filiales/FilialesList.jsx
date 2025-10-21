import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import { FilialCard } from '../../components/filiales/FilialCard';
import { FilialForm } from '../../components/filiales/FilialForm';
import { useFiliales } from '../../hooks/useFiliales';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const FilialesList = () => {
  const [filters, setFilters] = useState({ search: '' });
  const [selectedFilial, setSelectedFilial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { filiales, isLoading, createFilial, updateFilial, deleteFilial } = useFiliales(filters);

  const handleSubmit = (data) => {
    if (selectedFilial) {
      updateFilial({ id: selectedFilial.id, data });
    } else {
      createFilial(data);
    }
    setIsModalOpen(false);
    setSelectedFilial(null);
  };

  const handleDelete = (id) => {
    if (confirm('¿Desea eliminar la filial?')) {
      deleteFilial(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Filiales</h1>
          <p className="text-sm text-slate-500">Gestiona todas las filiales registradas en el sistema.</p>
        </div>
        {user?.rol === ROLES.ADMIN && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            Nueva filial
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o ciudad"
          className="flex-1 border-none text-sm focus:outline-none"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          filiales.map((filial) => (
            <FilialCard
              key={filial.id}
              filial={filial}
              onEdit={(f) => {
                setSelectedFilial(f);
                setIsModalOpen(true);
              }}
              onDelete={user?.rol === ROLES.ADMIN ? handleDelete : undefined}
            />
          ))
        )}
        {!isLoading && filiales.length === 0 && (
          <p className="col-span-full text-sm text-slate-500">No se encontraron filiales.</p>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedFilial(null);
        }}
        title={selectedFilial ? 'Editar filial' : 'Nueva filial'}
      >
        <FilialForm defaultValues={selectedFilial || {}} onSubmit={handleSubmit} />
      </Modal>
    </div>
  );
};

export default FilialesList;
