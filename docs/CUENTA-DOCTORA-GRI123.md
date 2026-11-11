# Nueva cuenta de la doctora

Se actualizó `lib/perfiles-config.ts` para usar `gri123@gmail.com` con rol DOCTORA. Esta configuración se comparte entre el selector de ingreso, la autorización en el servidor y la recuperación de contraseña. El email anterior deja de estar autorizado como doctora.

Sin cambios de contraseña, SQL, variables, esquema ni datos clínicos. Las auditorías previas conservan el email que actuó en su momento. Los datos personales de Perfil asociados al email anterior (foto, nombre profesional, matrícula) no se trasladan automáticamente a una cuenta diferente; pueden configurarse desde Mi perfil y Consultorio al ingresar.

Prueba manual: recargá `/login` con Ctrl + Shift + R, elegí Doctora y comprobá que aparezca el nuevo email. Ingresá con la contraseña que configuraste al recrear el usuario. Debe abrir Hoy y permitir las secciones clínicas. La autenticación real queda pendiente de esa prueba con tu cuenta; no se solicitaron ni utilizaron contraseñas.

Validación: compilación, lint y pruebas existentes. Cambio local en `codex/cuenta-doctora-gri123`; para publicarlo en Vercel hace falta desplegar esta versión.
