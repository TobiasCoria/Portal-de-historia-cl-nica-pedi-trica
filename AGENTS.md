<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

Uso: guardarlo como AGENTS.md en la raíz del repo (si ya existe uno con notas de Next.js, pegar esto debajo) o pegarlo al iniciar la tarea.
- Español rioplatense (voseo) en textos de la interfaz, commits y explicaciones.
- Una tarea = una rama = commits chicos. Antes de darla por terminada: npm run build sin errores (incluye el chequeo de tipos) y una lista corta de pasos para probarla a mano.
- No tocar archivos .env*, no imprimir valores de variables de entorno y no pedirme secretos. Si hace falta una variable nueva, decime el nombre y cómo cargarla en Vercel (el valor va sin comillas).
- No correr nunca prisma migrate reset, prisma db push --force-reset ni nada que borre datos. Hoy desarrollo y producción comparten la misma base de Supabase. Los cambios de schema se hacen con prisma migrate dev --create-only, se revisa el SQL, se le agrega el SQL de RLS de la sección 6 y recién después se aplica.
- No subir versiones mayores. Fijadas: Next 16.3.4, Prisma 6.19.x (no pasar a Prisma 7 ni 8, cambian la configuración), zod 3 (zod 4 rompe los tipos con @hookform/resolvers).
- No cambiar la región de los datos ni sumar servicios externos sin consultarme: hay una decisión legal pendiente (sección 9).
- Al terminar cada tarea: resumen con archivos tocados, pasos manuales para mí (SQL, variables, etc.) y riesgos.
- En la shell, citar las rutas con corchetes: "app/pacientes/[id]/page.tsx".
Portal web de historia clínica para una pediatra de Rosario, Santa Fe, Argentina. Lo usan la doctora y su secretaria. Carga manual de pacientes, sin migración. La responsable de los datos es la doctora. Yo (Tobias, TC Studio) soy el desarrollador.
- Next.js 16.3.4 (App Router, Turbopack, TypeScript). params y searchParams son Promises. middleware.ts funciona pero está deprecado (migrar a proxy.ts).
- Prisma 6.19.3 sobre Postgres de Supabase. Runtime por el pooler (6543, pgbouncer=true), migraciones por la conexión directa (5432, DIRECT_URL).
- Supabase Auth (email y contraseña). Storage: bucket privado documentos y bucket público avatares.
- react-hook-form + zod 3, Tailwind v4, lucide-react. Fuentes Geist y Fraunces.
- Deploy en Vercel desde main. Funciones en iad1, base en us-west-2.
- Variables de entorno (nombres exactos): DATABASE_URL, DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. Las NEXT_PUBLIC_ se graban en el build: si cambian, hay que redeployar. Un nombre mal escrito en Vercel ya nos rompió el login una vez.
- Comandos: npm run dev, npm run build, npx prisma migrate dev --create-only, npx prisma generate. El postinstall corre prisma generate.
- app/login: selector de perfil estilo Netflix (Doctora y Secretaria) y contraseña.
- app/pacientes: listado y búsqueda. nuevo es un wizard de 5 pasos. [id] es la ficha. Dentro de [id]: editar, consultas/nueva y consultas/[consultaId]/editar, vacunas/nueva y vacunas/[vacunaId]/editar, turnos/nuevo y turnos/[turnoId]/editar.
- app/agenda: vacunas y turnos pendientes de los próximos 30 días, con vencidos y menores a 24 h destacados, y buscador rápido para agendar. Usa export const dynamic = 'force-dynamic'.
- app/components: nav, avatar-uploader, logout-button, volver, documentos, confirmar-eliminar, animated-background.
- app/pacientes/schema.ts: validación zod compartida entre alta y edición.
- lib/: prisma.ts, auth.ts (requireUser), perfiles.ts, perfiles-data.ts, perfiles-config.ts, documentos.ts, agenda.ts, errores.ts, supabase/{client,server,admin}.ts.
- Cada carpeta de ruta dinámica tiene su actions.ts con las Server Actions de esa entidad.
- Paciente: datos filiatorios, tutor, contacto, antecedentes, alergias, datos al nacer, cobertura, eliminadoEn. DNI único.
- Consulta: motivo, diagnóstico, tratamiento, peso, talla, observaciones. creadoPorId opcional.
- VacunaAplicada: nombre libre (sin catálogo, a propósito), dosis, fechaAplicada, fechaProgramada.
- Turno: fecha y hora, motivo, estado (PENDIENTE, ATENDIDO, CANCELADO), consultaId único opcional. Atender un turno crea la consulta y lo deja ATENDIDO vinculado.
- Documento: pacienteId, consultaId opcional, url (path en el bucket), nombre, tipo.
- Perfil: email, nombre, color, avatarUrl.
- Usuario y LogAuditoria: existen pero no se usan.
- Login con selección de perfil. La foto de perfil se cambia ya logueado, tocando el avatar del encabezado.
- Pacientes: alta con wizard, edición, listado con búsqueda por nombre, apellido o DNI, borrado lógico con confirmación.
- Consultas, vacunas y turnos: crear, editar y eliminar o cancelar. Vacunas con opción de programar la próxima dosis.
- Documentos por paciente y por consulta: PDF, JPG o PNG hasta 10 MB, con URL firmada de 5 minutos.
- Agenda combinada con alertas, y aviso en /pacientes cuando hay pendientes urgentes.
- Errores traducidos a lenguaje común solo en alta y edición de paciente (por ejemplo DNI duplicado).
- Confirmación antes de eliminar o cancelar, y botón Volver en las subpantallas.
- Design system en globals.css: 
  - Clases .btn, .btn-primary, .btn-outline, .btn-link, .btn-link-danger, .action-btn, .action-btn-danger, .card, .card-alerta-roja, .card-alerta-amarilla, .input.
  - Paleta: azul #3e6fa8, rosa #D6497B (alergias), rojo #c4433a (vencido), ámbar #c99a2e (urgente). Texto #1c2521 y #5b6b64, bordes #e3e7e2.
  - Títulos en Fraunces, íconos de lucide-react, fondo blanco con formas difuminadas en movimiento lento.
  - Mantener esta línea visual en todo lo nuevo.
Estado verificado
- RLS activado en todas las tablas y permisos de anon y authenticated revocados. Probado: la API pública de Supabase devuelve permission denied. Prisma sigue andando porque conecta con el rol del servidor.
- Todas las Server Actions llaman await requireUser() al inicio (lib/auth.ts).
- Las subidas validan tipo y tamaño en el servidor. Los avatares se suben solo con sesión. El login ya no tiene acciones que escriban datos.
Reglas
1. Toda Server Action nueva empieza con await requireUser(). Cuando exista el rol (CU5), con requireRole.
2. Un archivo con 'use server' expone como endpoint público todas sus funciones exportadas. Los helpers y lecturas internas van en archivos sin 'use server'.
3. createAdminClient() (service role) solo dentro de acciones con sesión validada. Nunca en /login.
4. No confiar en IDs ni rutas que manda el navegador: verificar pertenencia y sacar los paths de storage desde la base.
5. Validar con zod en el servidor lo que llega del cliente. Hoy no se hace en pacientes, consultas, vacunas ni turnos: es una mejora pendiente.
6. Toda tabla nueva necesita, en la misma migración:
sql
```sql
ALTER TABLE "NombreTabla" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "NombreTabla" FROM anon, authenticated;
```
7. No loguear datos de pacientes ni mandarlos a servicios externos.
8. Las páginas que leen la base y no usan cookies ni searchParams llevan export const dynamic = 'force-dynamic'.
- Hay delete real en consultas, vacunas, documentos y turnos. Eliminar una consulta con documentos o turno vinculado falla por clave foránea.
- Editar una consulta pisa el dato sin historial. LogAuditoria no se usa.
- No hay roles: doctora y secretaria ven todo.
- listarPacientes devuelve filas completas al componente cliente del buscador de turnos. Debería devolver solo id, nombre, apellido y DNI.
- Las páginas leen la base directamente y dependen del middleware como única barrera.
- La raíz / muestra la página por defecto de Next.js.
- Errores amigables solo en pacientes. No se probó en celular.
- Los emails de prueba están en lib/perfiles-config.ts.
Fase 1: antes de cargar datos reales
- CU2. "Eliminar" = ocultar. Agregar eliminadoEn a Consulta, VacunaAplicada y Documento. Ninguna acción hace delete. Todas las consultas filtran lo oculto. El archivo en Storage se conserva. Los turnos se cancelan por estado. Aceptación: no queda ningún delete en el código, la ficha no muestra lo oculto, el dato sigue en la base y se arregla el error de clave foránea.
- CU4. Auditoría. Rediseñar LogAuditoria con usuarioEmail, accion, entidad, entidadId, pacienteId y fecha, sin clave foránea a Usuario. Helper registrarAuditoria() en un archivo sin 'use server'. Registrar altas, ediciones, bajas, subidas y abrir documentos. En el detalle van solo ids y nombres de campos, nunca contenido clínico. Vista /auditoria solo para la doctora.
- CU1. Consentimiento. Campos tutorVinculo, consentimientoAt y consentimientoPor. Checkbox obligatorio en el alta. El texto legal va en una sola constante con TODO(abogado). Se puede subir la copia firmada como documento.
Fase 2
- CU5. Roles. Agregar rol a Perfil (el enum Rol ya existe) tomado de la config. Helper requireRole. La secretaria ve listado, datos filiatorios, cobertura, turnos y agenda. No ve diagnóstico, tratamiento, observaciones clínicas ni documentos clínicos. Alergias y vacunas: ver la decisión abierta. Se aplica en el servidor, con queries distintas según el rol, no ocultando botones. Aceptación: una acción clínica pedida como secretaria es rechazada.
- CU3. Editar con historial. Modelo ConsultaRevision con snapshot, quién, cuándo y motivo del cambio obligatorio. La consulta muestra "Rectificada" y enlaza al historial.
- CU8. Firmar la consulta. firmadaEn, firmadaPor y matrícula (en Perfil). Una consulta firmada se bloquea y solo se corrige con anexos. No implementar el bloqueo hasta que se confirme la variante legal.
Fase 3
- CU11. "Hoy" y agenda por día. Turnos del día por hora, con alergias a la vista y botón Atender. Vista de día y semana. Aviso de superposición, estado AUSENTE, reprogramar. La raíz / redirige a esta pantalla.
- CU12. Exportar historia en PDF. Datos, alergias, consultas y vacunas, con nombre y matrícula. Sin servicios externos. Queda registrado en la auditoría.
- CU15. Celular. Tablas a tarjetas, botones táctiles. Probar listado, búsqueda, agenda y agendar turno en pantalla chica.
- CU6 (lista de coberturas), CU7 (copiar datos para certificados), CU13 (carnet de vacunación en PDF), CU14 (curvas de crecimiento: solo graficar, sin interpretar), CU16 (errores amigables en todas las acciones y páginas 404 y 500), CU17 (vincular hermanos por DNI del tutor).
- No empezar sin mi confirmación: CU18 (recordatorios a padres) y CU19 (diagnóstico codificado).
Infraestructura (me ocupo yo)
- Proyecto de Supabase separado para producción, con plan pago y backups.
- Rotar credenciales, 2FA para la doctora, cuentas a nombre de la doctora.
- Repo privado.
No es asesoramiento. Lo confirma un abogado. Algunos puntos no están verificados.
- Ley 25.326: los datos de salud son sensibles. Hay que registrar la base ante la AAIP (a confirmar).
- Transferencia internacional: EE.UU. no figura entre los países adecuados de la AAIP. Opciones: región europea, cláusulas modelo (Disp. 60-E/2016 y Res. 198/2023) o consentimiento de los padres. Hoy los datos están en EE.UU. No tomes esta decisión por tu cuenta.
- Ley 26.529: el paciente accede a su historia. Conservación mínima de 10 años. Por eso no se borra nada.
- Ley 27.706 y Decreto 393/2023: la historia clínica electrónica debe ser inalterable y perdurable, con firma digital o electrónica del responsable. La implementación es progresiva. No hay confirmación de que se exijan SNOMED CT o HL7 FHIR a un consultorio privado.
- Consentimiento de los padres, confidencialidad de la secretaria, contrato de servicio.
1. Región o mecanismo legal para los datos en el exterior.
2. Si la secretaria ve alergias y vacunas.
3. Edición con historial o consulta firmada y bloqueada con anexos.
4. Qué curvas de crecimiento usa la doctora.
5. Si emite certificados por la plataforma del Colegio de Médicos y si tiene firma digital.
6. Qué coberturas atiende, además de IAPOS.
Hacer CU2, CU4 y CU1, en ese orden y en ramas separadas. Después middleware.ts a proxy.ts y la redirección de /. Para cada una, seguir las reglas de la sección 0.
