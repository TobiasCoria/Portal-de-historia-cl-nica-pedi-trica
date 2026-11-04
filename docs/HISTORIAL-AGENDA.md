# Historial, validación y agenda

Archivos: schema y migración 20261104000500_historial_agenda; acciones de consultas y turnos, formulario de rectificación, lib/fechas.ts, lib/horarios.ts, validaciones y formularios.

La consulta conserva su versión anterior, actor, fecha y motivo obligatorio. La edición compara la versión y falla si cambió. Los datos administrativos comparan actualizadoEn para evitar pisar cambios. La agenda usa hora de Argentina y duración explícita, rechaza superposiciones y permite AUSENTE. Los formularios manejan errores y liberan sus botones. Se normalizan campos numéricos vacíos y sexo sin especificar. Las vacunas necesitan una fecha aplicada o programada.

SQL revisado sin eliminación de filas: columnas nuevas, enum AUSENTE, tabla ConsultaRevision con FK restrictiva, índice único por versión y RLS con permisos públicos revocados. Preparado localmente sin base sombra ni acceso a datos clínicos. Aplicar junto con la migración anterior antes de usar. No se implementa firma ni bloqueo legal.

Pruebas manuales: abrir consulta en dos pestañas, rectificar en una e intentar guardar la otra; revisar snapshot y motivo en Historial. Agendar en un horario ocupado y comprobar rechazo. Guardar sin fechas de vacuna y con fecha de nacimiento futura: debe rechazarse. Probar formularios ante desconexión. No hay variables nuevas.
