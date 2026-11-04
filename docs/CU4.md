# CU4 — Auditoría

Rama: codex/cu4-auditoria. Depende de codex/cu2-ocultar-registros.

Archivos: prisma/schema.prisma y migración 20261104000200_cu4_auditoria; lib/auditoria.ts y lib/auth.ts; acciones de pacientes, consultas, vacunas, turnos, documentos y perfiles; app/auditoria/page.tsx, navegación y tests/seguridad.test.cjs.

La migración conserva las filas de LogAuditoria, renombra creadoEn a fecha y guarda el usuarioId anterior en usuarioIdLegado. Recupera el email desde Usuario. Para eventos históricos sin entidad conocida usa LEGADO y el id del propio evento. Elimina las claves foráneas, sin borrar Usuario, Paciente ni registros. Activa RLS y revoca permisos públicos explícitamente. SQL preparado y revisado localmente, sin conectarse ni aplicarse a Supabase.

Aplicá las migraciones pendientes antes de desplegar. No hay variables nuevas. La autorización de /auditoria usa el email de sesión validado contra el perfil DOCTORA de lib/perfiles-config.ts, sin implementar todavía CU5.

Prueba manual con datos ficticios:
1. Como doctora, creá y editá paciente, consulta, vacuna y turno; ocultá registros y cancelá el turno. Abrí /auditoria: debe aparecer cada operación con cuenta, fecha, entidad, ID y pacienteId.
2. Registrá una vacuna con próxima dosis: deben aparecer dos altas. Atendé un turno: deben aparecer alta de consulta y atención de turno, dentro de una misma transacción.
3. Subí y abrí un documento: SUBIDA y APERTURA. Verificá en SQL que detalle contiene solo nombres de campos; no debe contener diagnóstico, motivo, nombre del archivo ni otros valores.
4. Como secretaria, abrí /auditoria directamente: debe responder 404 sin leer los logs. El enlace tampoco aparece. Sin sesión se redirige al login.
5. Recorré más de 50 eventos usando Ver anteriores. Los eventos de pacientes ocultos siguen presentes.

Verificación: npm run build con TypeScript pasó. node --test tests/seguridad.test.cjs pasó (sesión, pertenencia, ocultamiento, reversión ante falla de auditoría, URL firmada y acceso de secretaria). Son pruebas con dependencias simuladas: falta confirmar el SQL y los flujos completos en una base aislada.

Riesgos: los detalles históricos se conservan por integridad pero no se envían a la vista. No se registra el contenido clínico ni se envía a terceros. La auditoría no es una firma ni implementa CU3/CU8. Storage y Postgres no son una única transacción; los archivos se conservan si falla el registro posterior.
