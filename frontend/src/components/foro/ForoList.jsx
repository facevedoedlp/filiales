import ForoTema from './ForoTema.jsx';

const ForoList = ({ temas }) => {
  if (!temas || temas.length === 0) {
    return <p className="text-sm text-slate-500">Aún no hay temas disponibles.</p>;
  }

  return (
    <div className="space-y-4">
      {temas.map((tema) => (
        <ForoTema key={tema.id} tema={tema} />
      ))}
    </div>
  );
};

export default ForoList;
