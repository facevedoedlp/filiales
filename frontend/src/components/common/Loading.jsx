const Loading = ({ message = 'Cargando...' }) => (
  <div className="flex items-center justify-center py-20 text-sm text-slate-500">
    <svg className="mr-2 h-5 w-5 animate-spin text-primary" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    {message}
  </div>
);

export default Loading;
