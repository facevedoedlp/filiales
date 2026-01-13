from __future__ import annotations

from apps.acciones.models import AccionImagen, AccionSolidaria
from apps.acciones.serializers import AccionSolidariaSerializer
from apps.core.mixins import FilialScopedQuerysetMixin
from apps.core.viewsets import BaseModelViewSet
from rest_framework import decorators, exceptions, response, status


class AccionSolidariaViewSet(FilialScopedQuerysetMixin, BaseModelViewSet):
    queryset = AccionSolidaria.objects.select_related("filial", "creado_por").prefetch_related(
        "imagenes"
    )
    serializer_class = AccionSolidariaSerializer
    scope_field = "filial"
    filterset_fields = {
        "filial": ["exact"],
        "estado": ["exact"],
        "fecha": ["exact", "gte", "lte"],
    }
    search_fields = ["nombre", "descripcion", "ubicacion", "filial__nombre"]
    ordering_fields = ["fecha", "created_at", "estado", "nombre"]
    allow_filial_user_writes = True

    def get_queryset(self):  # type: ignore[override]
        queryset = super().get_queryset()
        desde = self.request.query_params.get("desde")
        if desde:
            queryset = queryset.filter(fecha__gte=desde)
        return queryset

    def get_serializer_save_kwargs(self, *, action: str):
        kwargs = super().get_serializer_save_kwargs(action=action)
        if action == "create":
            kwargs["creado_por"] = self.request.user
        return kwargs

    @decorators.action(detail=True, methods=["post"], url_path="imagenes")
    def subir_imagen(self, request, pk=None):
        accion = self.get_object()
        imagen = request.FILES.get("imagen")
        if not imagen:
            raise exceptions.ValidationError("Debe adjuntar un archivo en 'imagen'.")

        accion_imagen = AccionImagen.objects.create(accion=accion, imagen=imagen)
        if not accion.imagen_principal:
            accion.imagen_principal = accion_imagen.imagen
            accion.save(update_fields=["imagen_principal", "updated_at"])
            accion_imagen.es_principal = True
            accion_imagen.save(update_fields=["es_principal"])

        serializer = self.get_serializer(accion)
        return response.Response(serializer.data, status=status.HTTP_200_OK)
