# Búsqueda en vivo y perfil visible

Implementado en la rama `codex/busqueda-perfil`.

- El directorio filtra por nombre, apellido o DNI después de 250 ms sin escribir. Combina palabras, permite DNI con puntos y conserva cobertura y paginación.
- Cancela solicitudes anteriores e ignora respuestas atrasadas. Conserva las filas mientras consulta y ofrece reintentar ante fallas.
- La ruta de búsqueda exige sesión y devuelve únicamente campos administrativos, sin caché compartida. No envía alergias, consultas ni vacunas al directorio.
- El encabezado muestra nombre, rol y foto en escritorio y celular. Mi perfil abre el cambio de foto, datos de la cuenta y cierre de sesión. La edición profesional sigue reservada a la doctora.
- Se conserva la acción existente de subida, limitada al usuario autenticado. No se modificaron esquema, datos clínicos, variables ni servicios.

## Archivos principales

`app/pacientes/directorio.tsx`, `app/pacientes/page.tsx`, `app/api/pacientes/route.ts`, `lib/listado-pacientes.ts`, `lib/pacientes-tipos.ts`; `app/components/nav.tsx`, `menu-perfil.tsx`, `avatar-uploader.tsx`, `logout-button.tsx`; `app/globals.css`; pruebas en `tests/busqueda-perfil.test.cjs` y comando en `package.json`.

## Verificación

Build y ESLint sin errores; 30 pruebas aisladas aprobadas. Revisión visual de 24 capturas en 1440, 768 y 390 px, sin desbordes. Las pantallas protegidas se revisaron con datos ficticios y dependencias simuladas; no sustituye la prueba con cada cuenta real. No se subió una foto real ni se alteraron cuentas para probar.

Para probar manualmente:

1. Entrá a `/pacientes`; escribí parte de un nombre, nombre y apellido juntos y un DNI. Borrá rápidamente y cambiá cobertura. El listado debe actualizarse sin pulsar Buscar.
2. Probá una búsqueda sin coincidencias, limpiá filtros y usá la paginación cuando haya más de 12 resultados.
3. Abrí Mi perfil desde arriba. Elegí un JPG o PNG propio y comprobá la foto en el encabezado después de guardar; probá cerrar con Escape y haciendo clic afuera.
4. Repetí con secretaria y en celular. La secretaria conserva solamente sus permisos administrativos.

Sin SQL ni variables nuevas. Riesgos pendientes de comprobación manual: latencia de la base compartida y subida real de la foto con cada cuenta. El servidor local ejecuta el build; no se publicó en Vercel.

## Revisión profesional: siguientes prioridades

1. **Guardado confiable:** el componente `CambiosPendientes` marca cualquier edición pero no limpia esa marca al guardar sin abandonar la pantalla. Coordinarlo con el éxito del formulario y unificar confirmaciones y errores; evitar avisos falsos de pérdida de cambios.
2. **Historiales extensos:** vacunas, documentos y turnos por paciente todavía se leen completos. Agregar paginación y filtros por fecha, y limitar los turnos del resumen para sostener la velocidad con años de uso. Medir tiempos por pantalla antes de nuevos cambios de rendimiento.
3. **Agenda operativa:** semana de lunes a domingo y una vista clara de próximos turnos, cancelados y ausentes. Validar con la secretaria si necesita registrar llegada o sala de espera antes de agregar estados.
4. **Flujo de consulta:** reforzar el resumen previo y la navegación entre consulta, documentos y próxima cita, reduciendo cambios de pantalla. Definir con la doctora qué información debe quedar siempre visible, respetando los permisos existentes.
5. **Validación con ambas cuentas:** probar ingreso, vencimiento de sesión, guardados, PDFs y foto en celular real y conexiones lentas; unificar recuperación de errores y evitar botones que queden esperando indefinidamente.

Estas recomendaciones se documentan para elegir la siguiente etapa; no se agregaron funciones clínicas ni nuevos estados automáticamente.
