# Corrección de la espera del login

Rama: codex/corregir-espera-login.

Archivos: app/login/page.tsx y tests/seguridad.test.cjs.

El ingreso maneja excepciones de red, distingue credenciales inválidas de un email sin confirmar y libera el botón al terminar o agotar 20 segundos. No crea ni modifica perfiles al autenticar; esas escrituras requerían auditoría y podían fallar con las migraciones pendientes. La carga de avatar autenticada sigue pudiendo crear el perfil.

Prueba manual: recargá /login; elegí Doctora y usá la contraseña de gritest@gmail.com. Probá una contraseña incorrecta, una desconexión y una solicitud sin respuesta: debe mostrar un mensaje y volver a habilitar Ingresar. Con credenciales válidas debe navegar a /pacientes.

No hay SQL ni variables nuevas. Siguen pendientes las migraciones anteriores para usar las pantallas clínicas. El timeout no cancela la operación interna de Supabase; ante ese mensaje recargá antes de volver a intentar. No se verificó el ingreso real porque no se accedió a la contraseña ni a la sesión del navegador.

Verificación: build con TypeScript, lint y doce pruebas con dependencias simuladas, incluyendo éxito del login, falla de red y timeout.
