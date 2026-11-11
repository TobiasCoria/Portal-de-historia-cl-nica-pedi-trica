# Fondo verde y publicación

Rama `codex/fondo-verde-publicacion`. Se integró el README remoto antes de publicar, conservando los cambios locales del portal.

- `app/globals.css`: degradados verdes suaves y detalles botánicos en el fondo general, ingreso y recuperación. Se adaptan al celular, no se animan ni se superponen como capas sobre los controles. Se omiten al imprimir.
- `public/fondo-botanico.svg`: hojas y pequeños puntos vectoriales, sin fuentes ni imágenes externas.
- `proxy.ts`: el dibujo decorativo es público para mostrarse también antes de ingresar. No se habilitan nuevas rutas de datos.
- `tests/rendimiento.test.cjs`: verifica que el dibujo se sirva sin una consulta de autenticación, además del ingreso público.

Validación: build, lint, 38 pruebas y revisión visual de escritorio, tablet y celular con datos ficticios. No se modificaron variables ni se ejecutaron SQL o migraciones. Las migraciones previas de esta serie ya fueron aplicadas con autorización a la base compartida; no se ejecutan nuevamente para publicar el fondo.

La publicación de `main` incluye los cambios locales acumulados: permisos, auditoría, historial, agenda, rediseño, búsqueda, perfil, documentos, PDFs e ingreso con la cuenta actual de la doctora. Se conserva el historial Git y no se fuerza el push.

Para probar: abrir el ingreso en Vercel y recargar con Ctrl + Shift + R; revisar las hojas y tonos verdes en escritorio y celular; ingresar con cada cuenta y comprobar las secciones permitidas. Las pruebas automáticas no ingresan con contraseñas reales. Verificar el estado del despliegue después del push antes de darlo por publicado.
