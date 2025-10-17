// backend/src/services/auditoria.service.js
import prisma from '../config/database.js';
import { toSnakeCase } from '../utils/case.utils.js';

const serializeDatos = (datos) => {
  if (!datos) {
    return null;
  }

  try {
    return toSnakeCase(JSON.parse(JSON.stringify(datos)));
  } catch (error) {
    console.error('No se pudo serializar datos de auditoría', error);
    return null;
  }
};

export const registrarAuditoria = async ({
  req,
  operacion,
  tabla,
  registroId,
  filialId,
  datos,
}) => {
  try {
    await prisma.auditoriaRegistro.create({
      data: {
        usuarioId: req.user?.user_id ?? null,
        rol: req.user?.rol ?? null,
        operacion,
        tabla,
        registroId: registroId ?? null,
        filialId: filialId ?? null,
        datos: serializeDatos(datos),
      },
    });
  } catch (error) {
    console.error('Error registrando auditoría', error);
  }
};
