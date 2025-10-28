# Contrato de API y scoping por filial

## Autenticación y alcance
- Todos los JWT incluyen los campos `user_id`, `rol` y `filial_id`.
- El middleware de autenticación expone el usuario normalizado en `req.user` y el alcance de filial en `req.scope`.
- El middleware `scopeFilial` aporta:
  - `req.scope.isGlobalAdmin`: `true` si el usuario tiene rol `ADMIN_GLOBAL`.
  - `req.scope.resolveFilialId(requested)`: resuelve el `filial_id` efectivo usando el del token salvo que el usuario sea `ADMIN_GLOBAL`.
  - `req.scope.filialId`: identifica la filial forzada para usuarios que no son `ADMIN_GLOBAL`.
- Toda operación debe validar que el registro pertenece al `filial_id` resuelto antes de leer o mutar datos.

## Convenciones de nombres
- Todos los parámetros de entrada y filtros de la API se expresan en `snake_case` (`filial_id`, `es_activo`, `busqueda`, etc.).
- El backend acepta aliases camelCase de manera temporal pero siempre normaliza internamente a `snake_case`.
- Las respuestas JSON expuestas desde el backend utilizan `snake_case` en sus claves.

## Alcance por filial
- Usuarios no `ADMIN_GLOBAL` sólo pueden listar y operar datos vinculados a su `filial_id`.
- Usuarios `ADMIN_GLOBAL` pueden consultar cualquier filial y pueden especificar `filial_id` explícitamente en los endpoints para limitar resultados.
- En creaciones y actualizaciones el `filial_id` del registro se determina con `resolveFilialId`, ignorando valores arbitrarios enviados por clientes no autorizados.

## Auditoría
- Cada mutación persistente genera un registro en `auditoria_registros` con: usuario, rol, operación, tabla, identificador del registro, `filial_id` y payload relevante.

## Front-end
- Todos los hooks y componentes envían filtros y payloads en `snake_case`.
- El listado de integrantes incorpora el `filial_id` dentro del `queryKey` de React Query para garantizar un `refetch` consistente.
- Usuarios no `ADMIN_GLOBAL` no pueden cambiar la filial en los formularios ni en los listados: se fuerza el valor derivado del JWT.

## Base de datos
- La tabla `integrantes` exige `filialId` no nulo y cuenta con índices por `filialId` y `(filialId, esActivo)`.
- Se agrega la tabla `auditoria_registros` para registrar mutaciones junto a la filial asociada.
- El enum `Rol` incorpora el valor `ADMIN_GLOBAL`.
