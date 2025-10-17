import { useEffect } from 'react';
import { X } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

const Modal = ({
  open,
  title,
  children,
  onClose,
  size = 'md',
  closeOnOverlay = true,
}) => {
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKey);
    }

    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`relative w-full rounded-2xl bg-white shadow-2xl ${SIZE_CLASSES[size] || SIZE_CLASSES.md}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
      </div>
      {closeOnOverlay ? (
        <div className="absolute inset-0 -z-10" onClick={onClose} />
      ) : null}
    </div>
  );
};

export default Modal;
