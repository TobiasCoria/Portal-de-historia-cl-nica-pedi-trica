# Migración a proxy.ts

Rama: codex/migrar-proxy. Depende de codex/cu1-consentimiento.

Archivos: middleware.ts se renombra a proxy.ts; la función exportada pasa a llamarse proxy. Se conserva el matcher y la renovación de cookies; las cookies renovadas también se copian a la respuesta de redirección al login. La excepción pública se limita a /login.

No hay SQL ni variables nuevas. Guía consultada: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md.

Prueba manual:
1. Sin sesión, abrí /pacientes y /agenda: deben redirigir a /login. /login debe cargar sin bucle.
2. Ingresá y navegá entre agenda, pacientes y ficha. La sesión debe conservarse.
3. Cerrá sesión: una ruta protegida vuelve al login. Probá también una cookie vencida.
4. Los recursos de /_next/static y /_next/image mantienen la exclusión del matcher.

Verificación: npm run build con TypeScript. Riesgo: la renovación de sesión depende de Supabase; falta la prueba con cuenta de prueba en entorno aislado. Las acciones mantienen requireUser como barrera independiente.
