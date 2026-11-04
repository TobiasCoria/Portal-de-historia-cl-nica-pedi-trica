# Herramientas del consultorio

Se completan Archivo (recuperación auditada), configuración profesional (nombre y matrícula), regularización de consentimientos previos sin reemplazar evidencia, recuperación de contraseña por email, exportación de historia y carnet en PDF y filtros de auditoría.

Los PDF usan pdf-lib 1.17.1 dentro del servidor, sin servicios externos. Incluyen datos visibles, consultas actuales con indicación de rectificación y vacunas, profesional y matrícula si fueron cargados. Exigen DOCTORA y registran EXPORTACION antes de devolver el archivo. No incluyen archivos adjuntos ni versiones anteriores; estas siguen disponibles en Historial. Los caracteres que la fuente estándar no puede representar se muestran como ?. No se inventa matrícula ni se genera firma.

Recuperación: agregar en Supabase Authentication / URL Configuration los destinos http://localhost:3000/auth/callback y el callback del dominio de producción. Mantener la plantilla de recuperación compatible con code/PKCE. No se enviaron correos de prueba ni se cambiaron contraseñas. No hay variables nuevas.

Pruebas manuales: recuperar un paciente oculto y luego sus registros; verificar evento RESTAURACION. Registrar consentimiento en una ficha antigua con tutor completo; comprobar que no admite reemplazar la evidencia existente. Completar nombre/matrícula, descargar ambos PDF y revisar acentos, saltos de página y auditoría. Filtrar auditoría por fecha, entidad y acción. Probar enlace de recuperación válido, vencido y usado.

Build con TypeScript y lint sin errores. Riesgos: correo de recuperación depende de la configuración del proyecto y de abrir el enlace en el mismo navegador que inició el proceso; los PDF son copias informativas y no una firma digital. Falta la revisión legal del consentimiento y el mecanismo de firma.
