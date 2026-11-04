# Rediseño del consultorio

Archivos: globals.css, navegación, identidad gráfica vectorial, login, Hoy, listado de pacientes, agenda por día/semana, ficha por pestañas, documentos y formularios. La identidad mantiene azul y Fraunces, con fondo marfil, paneles blancos y navegación azul profundo. No se inventan nombre ni matrícula.

Hoy muestra turnos del día, atendidos, pendientes y accesos a atención. Listado paginado y búsqueda acotada con debounce. La ficha prioriza resumen clínico para doctora y datos administrativos para secretaria. La navegación se adapta a celular. Los formularios tienen contexto del paciente, etiquetas asociadas y aviso al salir con cambios. Se agregan estados de carga, errores, 404 y diálogos de confirmación con foco y teclado. Los documentos se abren desde una ruta autenticada y auditada sin depender de popups después de una espera.

Prueba manual: revisar /login, /hoy, /pacientes, /agenda y ficha en 1440, 768 y 390 px; teclado y Escape en diálogos; cambiar pestañas de ficha; navegar fechas; filtrar y paginar. Verificar que la secretaria no reciba información clínica. Las funciones enlazadas de Archivo, PDF, recuperación y configuración se completan en la rama siguiente.

No se agregan servicios externos ni variables de entorno. Build y TypeScript pasaron; la prueba real con sesión corresponde al usuario. Las migraciones de las etapas previas siguen pendientes de aplicación conjunta.
