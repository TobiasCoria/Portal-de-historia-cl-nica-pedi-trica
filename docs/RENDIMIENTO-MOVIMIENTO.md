# Rendimiento y movimiento

Rama: codex/rendimiento-movimiento, sobre codex/datos-demo-validacion.

## Rendimiento

- lib/auth.ts, lib/perfiles-data.ts y app/pacientes/lecturas.ts usan React cache para deduplicar lecturas durante un render. No hay caché persistente de historias ni sesiones compartidas entre usuarios. Las lecturas y acciones sensibles siguen verificando getUser y el rol.
- proxy.ts omite llamadas de autenticación en las cuatro rutas públicas. En rutas protegidas usa getClaims para verificar firma y vencimiento. Con firma asimétrica el SDK reutiliza JWKS; con firma simétrica puede seguir consultando Supabase. Esto no sustituye la validación de usuario de las lecturas/acciones.
- La ficha carga solo la pestaña solicitada. Datos no consulta consultas, vacunas, documentos ni turnos; Resumen obtiene tres consultas sin adjuntos y los turnos. Los contadores de pestañas aparecen al abrir su sección.
- Listado inicia conteo, filas y navegación en paralelo. Conserva la corrección para números de página fuera de rango.
- Hoy y Agenda paralelizan las lecturas independientes y el encabezado. Hoy no consulta vacunas de calendario que no muestra; el resumen obtiene como máximo cuatro registros de cada tipo y cuenta los pendientes por separado.
- Búsqueda, filtros y selección de fecha usan next/form para navegar sin recargar el documento completo.
- El servidor local queda ejecutando npm run start sobre el build optimizado, en lugar de compilar cada ruta con next dev. No hubo despliegue en Vercel.

## Movimiento y respuesta

- app/components/enlace.tsx extiende los enlaces internos con useLinkStatus: indicador y mensaje accesible mientras navegan. La barra superior es indeterminada, no simula porcentajes de carga.
- app/components/feedback-movimiento.tsx agrega una respuesta breve de pulsación a botones, enlaces, menús y controles equivalentes, con mouse, tacto y teclado. Los controles deshabilitados no generan ondas. El efecto se limpia y no intercepta eventos.
- globals.css define hover, presión, foco, entradas cortas de contenido y paneles, diálogos, mensajes, indicadores y skeletons. Se priorizan transform y opacity, sin animar anchos o alturas ni bloquear acciones.
- Los formularios informan aria-busy, y las descargas PDF se marcan como descargas, sin tratarlas como una navegación.
- prefers-reduced-motion desactiva desplazamientos, ondas y animaciones. La información de carga y el foco siguen disponibles.

## Validación

npm run build y npm run lint pasaron. npm test ejecuta 27 pruebas. Las seis nuevas comprueban consultas por pestaña, paralelismo del listado, ausencia de una lectura no utilizada, límites y total de pendientes, rutas públicas sin llamadas a Supabase y rechazo de claims inválidos con conservación de cookies.

scripts/verificar-movimiento.cjs se ejecutó contra el servidor de producción local: hover, pulsación y limpieza, teclado, navegación a recuperación sin nueva petición de documento, y movimiento reducido. No se ingresaron contraseñas ni se enviaron correos. scripts/verificar-ui.cjs pasó 24 capturas de escritorio, tablet y celular con datos ficticios; las pantallas protegidas usan dependencias simuladas.

No se midió un porcentaje de mejora entre pantallas autenticadas reales: falta el recorrido del usuario con sus cuentas. Las pruebas verifican la reducción del trabajo, los límites de lectura y la experiencia de interacción. La conexión remota a Supabase sigue influyendo en el tiempo total.

## Pasos manuales

1. Recargá localhost:3000 con Ctrl+Shift+R. Ingresá y recorré Hoy, Pacientes, Agenda y las pestañas de una ficha.
2. Probá búsqueda, cobertura y cambio de fecha; deberían navegar sin una recarga completa.
3. Probá hover y clic, y luego teclado con Tab/Enter/Espacio. Revisá el indicador al abrir un enlace y los estados de guardado.
4. En la configuración de accesibilidad del navegador o sistema, activá movimiento reducido: no deben verse ondas ni desplazamientos y todas las acciones deben seguir funcionando.
5. Verificá permisos con secretaria, sobre todo al cambiar pestañas o intentar abrir URLs clínicas.

No hay SQL, variables nuevas, cambios de región ni dependencias adicionales. No se modificó .env ni se alteraron registros. Riesgos: el primer acceso puede esperar a establecer la conexión con Supabase; el modo producción local requiere volver a compilar para ver futuros cambios de código. Para desarrollo, detener start y volver a npm run dev. Las ramas siguen sin integrarse en main ni publicarse.
