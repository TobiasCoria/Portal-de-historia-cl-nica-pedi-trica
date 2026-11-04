# CU1 — Consentimiento del tutor

Rama: codex/cu1-consentimiento. Depende de codex/cu4-auditoria.

Archivos: prisma/schema.prisma y migración 20261104000300_cu1_consentimiento; lib/consentimiento.ts; schema, acciones, wizard, ficha y formulario de edición de pacientes; tests/seguridad.test.cjs.

La migración agrega tutorVinculo, consentimientoAt y consentimientoPor como columnas anulables, sin cambiar filas anteriores. Se generó comparando esquemas locales con prisma migrate diff para evitar conexiones a la base compartida. SQL revisado, no aplicado. No crea tablas ni cambia RLS existente. Aplicá las migraciones pendientes antes del código. No hay variables nuevas.

El alta exige nombre, DNI, vínculo del tutor y checkbox. El servidor valida todo nuevamente, toma la fecha actual y el email de la sesión; no acepta una fecha o responsable enviados por el navegador. La edición de datos no permite modificar esas dos evidencias. El evento ALTA de auditoría incluye sus nombres de campo, sin sus valores.

El texto único está en lib/consentimiento.ts y tiene TODO(abogado). Pedile al abogado que lo revise y apruebe antes de usarlo con pacientes reales. Este checkbox registra la declaración del operador, no representa una firma digital ni resuelve la decisión de transferencia internacional.

Prueba manual con datos ficticios:
1. Intentá guardar sin checkbox: debe mostrar el error sin crear paciente. También debe rechazar una llamada directa a crearPaciente sin consentimiento booleano verdadero.
2. Completá tutor y vínculo, marcá el checkbox y guardá: verificá fecha y cuenta en la ficha y en SQL. En /auditoria debe aparecer ALTA sin datos clínicos.
3. Adjuntá la copia firmada usando Documentos. Subirla y abrirla debe quedar auditado.
4. Editá datos del paciente: el consentimiento original no cambia. Abrí un paciente anterior: muestra Sin consentimiento registrado; no se inventa una aceptación.

Verificación: npm run build con TypeScript y nueve pruebas automatizadas pasaron. Las pruebas agregadas cubren rechazo sin consentimiento, intento de falsificar fecha/cuenta y edición que intenta reescribirlos. No se aplicaron migraciones ni se usaron datos reales.

Riesgos: las fichas anteriores necesitan un procedimiento de regularización futuro; no se añadió aceptación retroactiva. Si cambia el tutor, el consentimiento original permanece como evidencia histórica; registrá el cambio y adjuntá la nueva documentación firmada.
