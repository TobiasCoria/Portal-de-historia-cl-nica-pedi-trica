# Inicio de sesión con la identidad del portal

Rama `codex/inicio-sesion-unificado`.

- `app/login/page.tsx`: estructura con lateral de marca, encabezado y tarjeta de acceso; perfiles con descripción; contraseña visible/oculta, bloqueo de controles durante el envío y error asociado al campo. Se conserva Supabase Auth, perfiles, mensajes, límite de espera y recuperación.
- `app/globals.css`: estilos exclusivos `acceso-*`, con fondo cálido, azul oscuro, Fraunces y tarjetas del portal. Adaptación a escritorio, tablet y celular y respeto por movimiento reducido. Los estilos anteriores de recuperación de contraseña permanecen disponibles.
- `scripts/verificar-movimiento.cjs`: verifica mostrar/ocultar la contraseña y limpiarla al cambiar perfil, sin enviar credenciales.

Compilación y lint sin errores, 38 pruebas aprobadas y revisión visual en 1440, 768 y 390 px. También se probaron selección por teclado, animaciones, movimiento reducido y navegación a recuperación sin recarga completa. La compilación necesitó acceso a Google Fonts para las fuentes ya existentes.

Prueba manual:

1. Abrí `http://localhost:3000/login` y recargá con Ctrl + Shift + R.
2. Elegí un perfil, alterná mostrar/ocultar contraseña y cambiá de perfil: la contraseña debe quedar vacía.
3. Ingresá con tu cuenta y comprobá la llegada a Hoy. El ingreso real no se ejecutó automáticamente para no usar credenciales.
4. Revisá en celular y abrí Olvidé mi contraseña; no hace falta enviar un correo para comprobar la pantalla.

Sin cambios de base, SQL, variables ni servicios. Servidor local de producción en puerto 3000; no se publicó en Vercel. Pendiente la validación del acceso real con tu cuenta. No se consultaron ni modificaron datos clínicos para este cambio.
