import prisma from '../config/database.js';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

const parseDate = (value) => (value ? new Date(value) : null);

export const listFiliales = async ({
  esActiva,
  provinciaId,
  grupoId,
  search,
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
  orderBy = 'nombre',
  order = 'asc',
}) => {
  const where = {};
  if (typeof esActiva !== 'undefined') {
    where.esActiva = esActiva === 'true' || esActiva === true;
  }
  if (provinciaId) {
    where.provinciaId = Number(provinciaId);
  }
  if (grupoId) {
    where.grupoId = Number(grupoId);
  }
  if (search) {
    where.nombre = { contains: search, mode: 'insensitive' };
  }

  const pageNumber = Math.max(Number(page), 1);
  const take = Math.max(Number(limit), 1);
  const skip = (pageNumber - 1) * take;

  const [items, total] = await Promise.all([
    prisma.filial.findMany({
      where,
      skip,
      take,
      orderBy: { [orderBy]: order },
      include: {
        provincia: { select: { id: true, nombre: true } },
        pais: { select: { id: true, nombre: true } },
      },
    }),
    prisma.filial.count({ where }),
  ]);

  return {
    items,
    total,
    page: pageNumber,
    limit: take,
    totalPages: Math.max(Math.ceil(total / take), 1),
  };
};

export const getFilial = async (id) => {
  const filial = await prisma.filial.findUnique({
    where: { id },
    include: {
      integrantes: true,
      provincia: true,
      pais: true,
    },
  });

  if (!filial) {
    const error = new Error('Filial no encontrada');
    error.status = 404;
    throw error;
  }

  return filial;
};

export const createFilial = async (data) => {
  const payload = {
    ...data,
    fechaFundacion: parseDate(data.fechaFundacion),
    renovacionAutoridades: parseDate(data.renovacionAutoridades),
  };
  return prisma.filial.create({ data: payload });
};

export const updateFilial = async (id, data) => {
  const payload = {
    ...data,
    fechaFundacion: parseDate(data.fechaFundacion),
    renovacionAutoridades: parseDate(data.renovacionAutoridades),
  };
  return prisma.filial.update({
    where: { id },
    data: payload,
  });
};

export const deactivateFilial = async (id) => {
  return prisma.filial.update({
    where: { id },
    data: { esActiva: false },
  });
};

export const renewAuthorities = async (id, { renovacionAutoridades, esRenovada }) => {
  return prisma.filial.update({
    where: { id },
    data: {
      renovacionAutoridades: renovacionAutoridades ? new Date(renovacionAutoridades) : null,
      esRenovada,
    },
  });
};

export const getStatistics = async (id) => {
  const integrantesActivos = await prisma.integrante.count({
    where: { filialId: id, esActivo: true },
  });
  const acciones = await prisma.accion.count({ where: { filialId: id } });
  const pedidosEntradas = await prisma.entradaPedido.count({ where: { filialId: id } });

  return {
    integrantesActivos,
    acciones,
    pedidosEntradas,
  };
};
