export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('es-AR');
};

export const formatBoolean = (value) => (value ? 'Sí' : 'No');
