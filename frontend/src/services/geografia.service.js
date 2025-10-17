import axios from 'axios';

const GEO_API_BASE = 'https://apis.datos.gob.ar/georef/api';

const cache = {
  provincias: null,
  localidades: {}
};

export const geografiaService = {
  getProvincias: async () => {
    try {
      if (cache.provincias) {
        return cache.provincias;
      }

      const response = await axios.get(`${GEO_API_BASE}/provincias`, {
        params: {
          campos: 'id,nombre',
          max: 24,
          orden: 'nombre'
        }
      });

      const provincias = response.data.provincias.map((provincia) => ({
        value: provincia.id,
        label: provincia.nombre,
        id: provincia.id,
        nombre: provincia.nombre
      }));

      cache.provincias = provincias;
      return provincias;
    } catch (error) {
      console.error('Error obteniendo provincias:', error);
      return [
        { value: '02', label: 'Buenos Aires', id: '02', nombre: 'Buenos Aires' },
        { value: '06', label: 'Ciudad Autónoma de Buenos Aires', id: '06', nombre: 'Ciudad Autónoma de Buenos Aires' },
        { value: '10', label: 'Catamarca', id: '10', nombre: 'Catamarca' },
        { value: '14', label: 'Córdoba', id: '14', nombre: 'Córdoba' },
        { value: '18', label: 'Corrientes', id: '18', nombre: 'Corrientes' },
        { value: '22', label: 'Chaco', id: '22', nombre: 'Chaco' },
        { value: '26', label: 'Chubut', id: '26', nombre: 'Chubut' },
        { value: '30', label: 'Entre Ríos', id: '30', nombre: 'Entre Ríos' },
        { value: '34', label: 'Formosa', id: '34', nombre: 'Formosa' },
        { value: '38', label: 'Jujuy', id: '38', nombre: 'Jujuy' },
        { value: '42', label: 'La Pampa', id: '42', nombre: 'La Pampa' },
        { value: '46', label: 'La Rioja', id: '46', nombre: 'La Rioja' },
        { value: '50', label: 'Mendoza', id: '50', nombre: 'Mendoza' },
        { value: '54', label: 'Misiones', id: '54', nombre: 'Misiones' },
        { value: '58', label: 'Neuquén', id: '58', nombre: 'Neuquén' },
        { value: '62', label: 'Río Negro', id: '62', nombre: 'Río Negro' },
        { value: '66', label: 'Salta', id: '66', nombre: 'Salta' },
        { value: '70', label: 'San Juan', id: '70', nombre: 'San Juan' },
        { value: '74', label: 'San Luis', id: '74', nombre: 'San Luis' },
        { value: '78', label: 'Santa Cruz', id: '78', nombre: 'Santa Cruz' },
        { value: '82', label: 'Santa Fe', id: '82', nombre: 'Santa Fe' },
        { value: '86', label: 'Santiago del Estero', id: '86', nombre: 'Santiago del Estero' },
        { value: '90', label: 'Tucumán', id: '90', nombre: 'Tucumán' },
        { value: '94', label: 'Tierra del Fuego', id: '94', nombre: 'Tierra del Fuego' }
      ];
    }
  },

  getLocalidades: async (provinciaId) => {
    try {
      const cacheKey = `prov_${provinciaId}`;
      if (cache.localidades[cacheKey]) {
        return cache.localidades[cacheKey];
      }

      const response = await axios.get(`${GEO_API_BASE}/localidades`, {
        params: {
          provincia: provinciaId,
          campos: 'id,nombre',
          max: 1000,
          orden: 'nombre'
        }
      });

      const localidades = response.data.localidades.map((localidad) => ({
        value: localidad.id,
        label: localidad.nombre,
        id: localidad.id,
        nombre: localidad.nombre
      }));

      cache.localidades[cacheKey] = localidades;
      return localidades;
    } catch (error) {
      console.error('Error obteniendo localidades:', error);
      return [];
    }
  },

  buscarLocalidades: async (texto, provinciaId = null) => {
    try {
      const params = {
        nombre: texto,
        campos: 'id,nombre,provincia.nombre',
        max: 50,
        orden: 'nombre'
      };

      if (provinciaId) {
        params.provincia = provinciaId;
      }

      const response = await axios.get(`${GEO_API_BASE}/localidades`, { params });

      return response.data.localidades.map((localidad) => ({
        value: localidad.id,
        label: provinciaId ? localidad.nombre : `${localidad.nombre} (${localidad.provincia.nombre})`,
        id: localidad.id,
        nombre: localidad.nombre
      }));
    } catch (error) {
      console.error('Error buscando localidades:', error);
      return [];
    }
  },

  clearCache: () => {
    cache.provincias = null;
    cache.localidades = {};
  }
};
