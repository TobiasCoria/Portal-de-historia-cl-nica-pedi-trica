# Redirección del inicio

Rama: codex/redireccion-inicio. Depende de codex/migrar-proxy.

Archivos: app/page.tsx. La raíz redirige a /agenda, la pantalla operativa disponible; no implementa CU11 ni crea una pantalla Hoy. Cuando se implemente CU11, se puede actualizar el destino. Se usa redirect de Next según la documentación local.

No hay SQL ni variables nuevas.

Prueba manual:
1. Con sesión, abrí /: debe terminar en /agenda y mostrar pendientes.
2. Sin sesión, abrí /: proxy debe enviarte a /login sin bucle.
3. Verificá que ya no aparece la página de ejemplo de Next.

Verificación: npm run build con TypeScript, npm run lint y las pruebas de seguridad. Riesgo: las migraciones previas deben estar aplicadas antes de ejecutar el conjunto de ramas.
