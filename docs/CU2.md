# CU2 — Registros ocultos

Rama: codex/cu2-ocultar-registros. Base: main.

Archivos: schema y migración de Prisma; acciones y lecturas de pacientes, consultas, vacunas y turnos; documentos; autenticación, perfiles, agenda y sus componentes. Fraunces se aloja localmente con licencia OFL para resolver un error de next/font en Next 16.3.4.

La migración 20261104000100_cu2_ocultar agrega tres columnas anulables. SQL revisado: solo ALTER TABLE ADD COLUMN, sin borrar filas. No crea tablas; conserva las políticas existentes. Se generó con prisma migrate diff entre esquemas locales, en lugar de migrate dev --create-only, para no conectar ni modificar la base compartida ni una base sombra. No se aplicó.

Antes de ejecutar esta versión, revisá y aplicá la migración con tu procedimiento de despliegue (prisma migrate deploy). No hay variables nuevas. No despliegues el código con el esquema anterior.

Prueba manual con datos ficticios:
1. Creá una consulta, adjuntale un PDF y vinculala a un turno atendido. Ocultá la consulta: desaparece sin error de clave foránea. Verificá en SQL que consulta, documento y turno siguen existiendo y vinculados.
2. Intentá abrir su edición por URL y solicitar otra URL firmada del documento: debe rechazarse.
3. Ocultá una vacuna programada y un documento general: desaparecen de ficha, edición y agenda; sus filas y el archivo siguen existiendo.
4. Cancelá un turno: queda CANCELADO en la base y desaparece de pendientes.
5. Ocultá un paciente: no debe aparecer en búsqueda ni agenda ni abrirse por URL. Probá cruzar IDs de dos pacientes: no debe editar ni ocultar datos del otro.
6. Sin sesión, las acciones deben rechazar la operación. El login no permite subir fotos; después de ingresar, tocá el avatar del encabezado.

Riesgos: una URL firmada emitida antes de ocultar sigue vigente hasta su vencimiento de cinco minutos. Storage y Postgres no comparten transacción: una falla de base después de subir puede dejar un archivo sin ficha; se conserva para evitar borrar datos. Los chequeos manuales de base y roles requieren un entorno de prueba; no se usaron datos de pacientes.
