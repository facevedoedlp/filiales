// backend/src/utils/case.utils.js
const isObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date);

const snakeToCamelKey = (key) =>
  key.replace(/([-_][a-z])/gi, (group) => group.slice(-1).toUpperCase());

const camelToSnakeKey = (key) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();

export const toCamelCase = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => toCamelCase(item));
  }

  if (isObject(value)) {
    return Object.keys(value).reduce((acc, key) => {
      const safeKey = key === '__proto__' ? key : snakeToCamelKey(key);
      acc[safeKey] = toCamelCase(value[key]);
      return acc;
    }, {});
  }

  return value;
};

export const toSnakeCase = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => toSnakeCase(item));
  }

  if (isObject(value)) {
    return Object.keys(value).reduce((acc, key) => {
      const safeKey = key === '__proto__' ? key : camelToSnakeKey(key);
      acc[safeKey] = toSnakeCase(value[key]);
      return acc;
    }, {});
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
};

export const pickDefined = (obj = {}) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== null && value !== undefined && value !== '')
  );
