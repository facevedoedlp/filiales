export const required = (message = 'Este campo es obligatorio') => ({
  required: { value: true, message },
});

export const minLength = (length, message) => ({
  minLength: { value: length, message: message || `Debe tener al menos ${length} caracteres` },
});

export const maxLength = (length, message) => ({
  maxLength: { value: length, message: message || `Debe tener máximo ${length} caracteres` },
});

export const email = (message = 'Correo inválido') => ({
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message,
  },
});

export const positiveNumber = (message = 'Debe ser un número positivo') => ({
  min: {
    value: 0,
    message,
  },
});

export const composeValidators = (...validators) => {
  return validators.reduce((acc, validator) => ({ ...acc, ...validator }), {});
};
