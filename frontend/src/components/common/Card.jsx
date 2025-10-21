export const Card = ({ title, description, actions, children }) => {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
      {(title || actions) && (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="flex-1 px-5 py-4 text-sm text-slate-600">{children}</div>
    </div>
  );
};

export default Card;
