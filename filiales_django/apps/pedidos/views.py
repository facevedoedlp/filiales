from __future__ import annotations

from apps.auditoria.models import Accion
from apps.core.mixins import FilialScopedQuerysetMixin
from apps.core.permissions import IsAdminAllAccess
from apps.core.services import dispatch_webhook, send_notification_email
from apps.core.viewsets import BaseModelViewSet
from apps.pedidos.models import Pedido, PedidoItem, Producto
from apps.pedidos.serializers import (
    PedidoItemSerializer,
    PedidoSerializer,
    ProductoSerializer,
)
from rest_framework import decorators, exceptions, response
from rest_framework.permissions import IsAuthenticated


class ProductoViewSet(BaseModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer
    filterset_fields = {"activo": ["exact"], "categoria": ["exact"], "sku": ["exact"]}
    search_fields = ["nombre", "sku", "categoria"]
    ordering_fields = ["nombre", "categoria", "sku", "created_at"]
    allow_filial_user_writes = False


class PedidoViewSet(FilialScopedQuerysetMixin, BaseModelViewSet):
    queryset = Pedido.objects.select_related("filial", "created_by")
    serializer_class = PedidoSerializer
    scope_field = "filial"
    filterset_fields = {
        "estado": ["exact"],
        "created_at": ["date", "date__gte", "date__lte"],
        "filial": ["exact"],
    }
    search_fields = ["observaciones", "filial__nombre"]
    ordering_fields = ["created_at", "estado"]

    def get_serializer_save_kwargs(self, *, action: str):
        kwargs = super().get_serializer_save_kwargs(action=action)
        if action == "create":
            kwargs["created_by"] = self.request.user
        return kwargs

    def _update_estado(
        self, pedido: Pedido, estado: str, evento: str, motivo: str | None = None
    ):
        pedido.estado = estado
        if motivo:
            pedido.observaciones = motivo
        pedido.save(update_fields=["estado", "observaciones", "updated_at"])
        if pedido.filial.contacto_email:
            send_notification_email(
                f"Pedido {estado.lower()}",
                f"El pedido {pedido.id} ha cambiado a estado {estado}. {motivo or ''}",
                [pedido.filial.contacto_email],
            )
        dispatch_webhook(
            "eventos",
            {
                "evento": evento,
                "pedido_id": pedido.id,
                "estado": estado,
                "motivo": motivo,
            },
        )

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="aprobar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def aprobar(self, request, pk=None):
        pedido = self.get_object()
        self._update_estado(pedido, Pedido.Estados.APROBADO, "pedido_aprobado")
        self.log_action(pedido, Accion.Tipos.APROBAR)
        return response.Response(self.get_serializer(pedido).data)

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="rechazar",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def rechazar(self, request, pk=None):
        pedido = self.get_object()
        motivo = request.data.get("motivo", "")
        self._update_estado(
            pedido, Pedido.Estados.RECHAZADO, "pedido_rechazado", motivo
        )
        self.log_action(pedido, Accion.Tipos.RECHAZAR, payload={"motivo": motivo})
        return response.Response(self.get_serializer(pedido).data)

    @decorators.action(
        detail=True,
        methods=["post"],
        url_path="marcar-entregado",
        permission_classes=[IsAuthenticated, IsAdminAllAccess],
    )
    def marcar_entregado(self, request, pk=None):
        pedido = self.get_object()
        self._update_estado(pedido, Pedido.Estados.ENTREGADO, "pedido_entregado")
        self.log_action(
            pedido, Accion.Tipos.ACTUALIZAR, payload={"accion": "entregado"}
        )
        return response.Response(self.get_serializer(pedido).data)


class PedidoItemViewSet(FilialScopedQuerysetMixin, BaseModelViewSet):
    queryset = PedidoItem.objects.select_related("pedido", "pedido__filial", "producto")
    serializer_class = PedidoItemSerializer
    scope_field = "pedido__filial"
    filterset_fields = {
        "pedido": ["exact"],
        "producto": ["exact"],
    }
    search_fields = ["producto__nombre", "pedido__filial__nombre"]
    ordering_fields = ["cantidad", "created_at"]

    def get_serializer_save_kwargs(self, *, action: str):
        kwargs = super().get_serializer_save_kwargs(action=action)
        if action == "create":
            pedido_id = self.request.data.get("pedido")
            if not pedido_id:
                raise exceptions.ValidationError("Debe indicar el pedido asociado.")
            try:
                pedido = Pedido.objects.get(pk=pedido_id)
            except Pedido.DoesNotExist as exc:
                raise exceptions.ValidationError("Pedido inválido") from exc
            perfil = getattr(self.request.user, "perfil", None)
            if (
                perfil
                and perfil.es_usuario_filial
                and perfil.filial_id != pedido.filial_id
            ):
                raise exceptions.ValidationError(
                    "No puede agregar items a pedidos de otra filial."
                )
        return kwargs
