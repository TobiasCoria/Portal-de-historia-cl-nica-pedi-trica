# CU5 — Permisos

La secretaria no ve alergias ni vacunas (decisión confirmada), consultas, documentos o historial clínico. Las consultas administrativas seleccionan columnas explícitas; los campos clínicos no se leen para la secretaria. Las acciones clínicas y rutas directas exigen DOCTORA. Las cuentas ajenas a la configuración reciben 404. El rol se agrega a Perfil, pero la autorización usa la configuración del servidor y nunca un parámetro del cliente.

Archivos: lib/auth.ts, lib/paciente-administrativo.ts, lib/registros.ts, acciones y lecturas clínicas, formularios de pacientes y agenda; migración 20261104000400_cu5_roles. El SQL solo agrega una columna, actualiza el rol del perfil configurado y conserva RLS. Preparado localmente para no usar base sombra sobre la base compartida.

Prueba manual: ingresá con secretaria, abrí listado, ficha y edición; no deben llegar campos clínicos. Probá URLs y acciones clínicas directas: deben rechazarse. Con doctora deben funcionar. Las cuentas no configuradas no ingresan. No hay variables nuevas. Falta aplicar la migración antes de usar esta versión.
