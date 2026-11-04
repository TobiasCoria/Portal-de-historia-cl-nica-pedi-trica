# Entrega — Rediseño y mejoras del portal

Implementado el 4 de noviembre de 2026, sin publicar en Vercel ni modificar main. Las ramas se encadenan en este orden:

1. codex/cu5-permisos: cuentas autorizadas y separación clínica/administrativa.
2. codex/historial-agenda: rectificaciones, concurrencia, validaciones, duración y ausencia.
3. codex/rediseno-consultorio: identidad, navegación, Hoy, listado, ficha y agenda adaptables.
4. codex/herramientas-consultorio: archivo, recuperación de acceso, consentimientos, PDFs y configuración profesional.
5. codex/datos-demo-validacion: ejemplos ficticios, pruebas, revisión visual y ajustes finales.

## Estado de la base

Con autorización explícita se aplicaron 20261104000400_cu5_roles y 20261104000500_historial_agenda a la base compartida. No hubo reset ni eliminación de filas. Se verificó RLS de ConsultaRevision y ausencia de privilegios SELECT/INSERT/UPDATE/DELETE para anon y authenticated.

Se cargaron exactamente cinco pacientes esDemo: Emilia Luna, Mateo Ríos, Sofía Vega, Benjamín Soler y Olivia Paz. Los apellidos incluyen (Demo), los DNI son DEMO-PORTAL-001 a 005 y no corresponden a documentos reales. Hay cinco consultas, diez vacunas ficticias y cinco turnos de demostración para el día de carga. No se adjuntaron archivos, no se simularon consentimientos legales y no se enviaron mensajes. El script es transaccional y no modifica registros existentes; una segunda ejecución no duplica los datos.

## Archivos y cambios

- prisma/: rol, versión de consulta, ConsultaRevision, matrícula, esDemo, duración y AUSENTE; dos migraciones revisadas.
- lib/: autorización por cuenta/rol, selección administrativa explícita, validación, fechas de Argentina, horarios, auditoría y generación PDF.
- app/: navegación y marca, login y recuperación, Hoy, listado paginado, agenda diaria/semanal, ficha por pestañas, formularios, historial, archivo recuperable, consentimiento, configuración, documentos, exportación y errores/carga/404.
- tests/: 21 pruebas con dependencias simuladas; sin datos reales ni acceso a la base compartida.
- scripts/: carga idempotente de demostración, verificación de base de solo lectura, capturas visuales con datos ficticios y muestra PDF.
- package.json/package-lock.json: pdf-lib 1.17.1 y comandos test/seed:demo. No se subieron versiones mayores. La herramienta temporal de navegador usa el runtime de Codex y no se agregó al proyecto.
- .gitignore: excluye artifacts/, que contiene únicamente capturas y PDFs ficticios de QA.

## Verificación

- npm run build: compila con Next 16.3.4 e incluye TypeScript.
- npm run lint: sin errores.
- npm test: 21 pruebas (sesión, roles, privacidad, ocultamiento, reversión de auditoría, consentimiento, login, concurrencia, snapshots, validaciones, superposición, zona horaria y PDFs extensos).
- scripts/verificar-ui.cjs: 24 capturas a 1440, 768 y 390 px, sin desborde horizontal. Login, selector de perfil y navegación a recuperación se probaron en el servidor real. Las páginas protegidas se renderizaron usando sus componentes reales con dependencias simuladas y datos ficticios; no se extrajeron sesiones ni contraseñas. Esto no reemplaza una prueba completa con la cuenta real.
- La muestra PDF se renderizó con Poppler y se revisaron todas sus páginas; se ajustaron el corte por palabras, la identificación repetida del paciente y los márgenes. La muestra no representa una atención real.
- scripts/verificar-base.cjs: confirma cinco pacientes, cinco consultas, diez vacunas y cinco turnos ficticios, además de RLS de ConsultaRevision, sin imprimir contenido clínico.

## Recorrido manual recomendado

1. Recargá http://localhost:3000 y entrá como doctora. La pantalla inicial debe ser Hoy.
2. En Pacientes, buscá Demo. Abrí una ficha, cambiá pestañas y probá el filtro de cobertura. Revisá en celular.
3. En Agenda, cambiá entre Día y Semana. Intentá reservar un horario ocupado; debe rechazarlo. Reprogramá un turno de demostración y probá Cancelar/Ausente.
4. Rectificá una consulta ficticia con motivo; abrí Historial. Abrila en dos pestañas y comprobá que la segunda edición con versión vieja se rechace.
5. Ocultá un registro ficticio, recuperalo en Archivo y revisá su auditoría. Recuperá primero el paciente o consulta si el contenedor estaba oculto.
6. Completá nombre y matrícula verdaderos en Consultorio antes de entregar PDFs. Descargá Historia y Carnet; verificá identidad, contenido y auditoría.
7. En una ficha ficticia sin consentimiento, completá tutor y vínculo y probá Registrar consentimiento. El texto sigue pendiente de aprobación legal.
8. Ingresá como secretaria: no debe ver alergias, vacunas, consultas, documentos clínicos, historial, archivo ni auditoría; probar también las URLs directas.
9. Para probar recuperación de contraseña, agregá los destinos /auth/callback de localhost y producción en Supabase / Authentication / URL Configuration. Abrí el enlace en el mismo navegador. El usuario realiza el cambio final; no se cambiaron contraseñas durante esta tarea.

## Pendientes y riesgos

No hay variables nuevas ni cambios de región o servicios externos. Falta completar la identidad profesional real y configurar/probar el correo de recuperación. Las capturas de pantallas protegidas son de fixtures; queda el recorrido real con doctora/secretaria, sin usar pacientes reales para pruebas.

La firma y el bloqueo de consultas no se implementaron: requieren la definición legal pendiente. Se conserva historial de rectificaciones; no es una firma digital. El consentimiento necesita aprobación del abogado. La auditoría registra metadatos, sin contenido clínico; los snapshots sí conservan el contenido anterior en la tabla protegida.

Los PDFs incluyen datos visibles, consultas actuales y vacunas. No incrustan archivos adjuntos ni versiones anteriores; estas se consultan en Historial. La fuente estándar representa caracteres ajenos a su repertorio con ?. Los archivos de Storage se conservan al ocultar; una URL firmada previa sigue vigente hasta expirar. Storage y base de datos no forman una única transacción.

Las mejoras de permisos e historial rigen en el código nuevo. La versión de producción seguirá con su comportamiento anterior hasta integrar y desplegar estas ramas; durante ese intervalo no conviene editar datos clínicos desde la versión anterior si se necesita el historial nuevo.
