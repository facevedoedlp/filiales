import prisma from '../config/database.js';

export const createFilial = async (req, res) => {
  try {
    const data = req.body;

    if (!data.nombre || data.nombre.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la filial es requerido',
      });
    }

    const filialData = {
      nombre: data.nombre.trim(),
      paisId: data.paisId ? parseInt(data.paisId, 10) : null,
      provinciaId: data.provinciaId ? parseInt(data.provinciaId, 10) : null,
      departamentoId: data.departamentoId ? parseInt(data.departamentoId, 10) : null,
      localidadId: data.localidadId ? parseInt(data.localidadId, 10) : null,
      nombreLocalidad: data.nombreLocalidad || null,
      direccionSede: data.direccion || data.direccionSede || null,
      mailInstitucional: data.mailInstitucional || null,
      mailAlternativo: data.mailAlternativo || null,
      telefono: data.telefono || null,
      fechaFundacion: data.fechaFundacion ? new Date(data.fechaFundacion) : null,
      autoridades: data.autoridades || null,
      esActiva: data.esActiva !== undefined ? data.esActiva : true,
      esHabilitada: data.esHabilitada !== undefined ? data.esHabilitada : true,
      situacion: data.situacion || 'ACTIVA',
      grupoId: data.grupoId ? parseInt(data.grupoId, 10) : null,
      coordenadas: data.coordenadas || null,
      kmDesdeEstadio: data.kmDesdeEstadio ? parseFloat(data.kmDesdeEstadio) : null,
    };

    const filial = await prisma.filial.create({
      data: filialData,
      include: {
        pais: true,
        provincia: true,
        grupo: true,
      },
    });

    res.status(201).json({
      success: true,
      data: filial,
      message: 'Filial creada exitosamente',
    });
  } catch (error) {
    console.error('Error creando filial:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al crear la filial',
      error: error.message,
    });
  }
};

export const updateFilial = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const filialExistente = await prisma.filial.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!filialExistente) {
      return res.status(404).json({
        success: false,
        message: 'Filial no encontrada',
      });
    }

    const filialData = {};

    if (data.nombre !== undefined) filialData.nombre = data.nombre.trim();
    if (data.paisId !== undefined)
      filialData.paisId = data.paisId ? parseInt(data.paisId, 10) : null;
    if (data.provinciaId !== undefined)
      filialData.provinciaId = data.provinciaId ? parseInt(data.provinciaId, 10) : null;
    if (data.departamentoId !== undefined)
      filialData.departamentoId = data.departamentoId ? parseInt(data.departamentoId, 10) : null;
    if (data.localidadId !== undefined)
      filialData.localidadId = data.localidadId ? parseInt(data.localidadId, 10) : null;
    if (data.nombreLocalidad !== undefined)
      filialData.nombreLocalidad = data.nombreLocalidad || null;
    if (data.direccion !== undefined) filialData.direccionSede = data.direccion || null;
    if (data.direccionSede !== undefined)
      filialData.direccionSede = data.direccionSede || null;
    if (data.mailInstitucional !== undefined)
      filialData.mailInstitucional = data.mailInstitucional || null;
    if (data.mailAlternativo !== undefined)
      filialData.mailAlternativo = data.mailAlternativo || null;
    if (data.telefono !== undefined) filialData.telefono = data.telefono || null;
    if (data.fechaFundacion !== undefined)
      filialData.fechaFundacion = data.fechaFundacion ? new Date(data.fechaFundacion) : null;
    if (data.autoridades !== undefined) filialData.autoridades = data.autoridades || null;
    if (data.esActiva !== undefined) filialData.esActiva = data.esActiva;
    if (data.esHabilitada !== undefined) filialData.esHabilitada = data.esHabilitada;
    if (data.situacion !== undefined) filialData.situacion = data.situacion;
    if (data.grupoId !== undefined)
      filialData.grupoId = data.grupoId ? parseInt(data.grupoId, 10) : null;
    if (data.coordenadas !== undefined) filialData.coordenadas = data.coordenadas || null;
    if (data.kmDesdeEstadio !== undefined)
      filialData.kmDesdeEstadio = data.kmDesdeEstadio ? parseFloat(data.kmDesdeEstadio) : null;

    const filial = await prisma.filial.update({
      where: { id: parseInt(id, 10) },
      data: filialData,
      include: {
        pais: true,
        provincia: true,
        grupo: true,
      },
    });

    res.json({
      success: true,
      data: filial,
      message: 'Filial actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando filial:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error al actualizar la filial',
      error: error.message,
    });
  }
};
