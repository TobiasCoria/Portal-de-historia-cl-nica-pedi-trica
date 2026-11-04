# Guardado, historiales y continuidad de la atención

Rama: `codex/flujo-guardado-agenda`. Sin migraciones, SQL, variables nuevas ni servicios externos. No se modificaron datos de prueba ni registros reales para verificar los cambios.

## Cambios

- **Guardado:** Configuración confirma una nueva versión guardada sólo cuando el servidor acepta los datos. El aviso de cambios pendientes se limpia entonces y vuelve a activarse ante una edición nueva. Si falla, conserva el aviso y los valores del formulario. Los campos se bloquean durante el envío para evitar que se confundan ediciones posteriores con lo enviado. La confirmación visual desaparece cuando volvés a editar.
- **Historiales:** consultas, vacunas, documentos generales y turnos usan páginas de 12 registros en el servidor, total real y orden estable con ID como desempate. Filas y conteo se leen en paralelo. Una página que desapareció después de ocultar un registro cae en la última existente. Los permisos se evalúan antes de consultar; las vacunas y documentos siguen siendo exclusivos de la doctora.
- **Resumen:** lee solamente tres consultas y tres turnos pendientes. En el historial de consultas se muestran hasta tres adjuntos por encuentro y un acceso a todos; el detalle de documentos de la consulta también está paginado. Las descargas PDF conservan la historia completa.
- **Agenda:** la semana va de lunes a domingo. Los filtros y sus cantidades distinguen próximos, pendientes de resolver, atendidos, cancelados y ausentes con texto y color. Pasar la hora del turno no lo marca automáticamente ausente. Las vacunas se muestran en Todos. Los enlaces de fecha, período y pendientes conservan el filtro.
- **Consulta:** el formulario muestra la última consulta y permite abrir sus documentos. Al crear la consulta se mantiene la transacción de atención del turno y se abre un cierre con los datos guardados, subida de documentos, vuelta al resumen y acceso directo a la próxima cita. Si ya hay un turno futuro pendiente, lo avisa y ofrece revisarlo o reprogramarlo. Agendar una próxima cita no vincula el turno futuro como si ya hubiera sido atendido.

## Archivos

- Guardado: `app/components/cambios-pendientes.tsx`, `app/configuracion/formulario.tsx`.
- Historiales: `lib/paginacion.ts`, `app/components/paginacion.tsx`, `app/pacientes/[id]/page.tsx`.
- Agenda: `lib/fechas.ts`, `lib/estado-turno.ts`, `app/agenda/page.tsx`, `app/components/turno-fila.tsx`.
- Consulta: `app/components/paciente-contexto.tsx`, `app/pacientes/[id]/consultas/nueva/page.tsx`, `app/pacientes/[id]/consultas/actions.ts`, `app/pacientes/[id]/consultas/[consultaId]/cierre/page.tsx`, `lib/documentos.ts`.
- Estilo y verificación: `app/globals.css`, `tests/flujo.test.cjs`, `tests/rendimiento.test.cjs`, `scripts/verificar-ui.cjs`, `package.json`.

## Validación y límites

Build y lint sin errores. 38 pruebas aisladas cubren guardado aceptado/rechazado, reactivación del aviso, límites de lectura, corrección de página, semanas que cruzan mes/año, estado de turno vencido, enlace de cierre y bloqueo clínico de secretaria. Revisión visual de 36 capturas en 1440, 768 y 390 px sin desbordes. Las páginas protegidas se renderizan con fixtures ficticios; no equivale a recorrer el flujo con una sesión real. La prueba no crea consultas ni citas en la base compartida.

## Prueba manual

1. En Configuración, cambiá el nombre, guardá y salí: no debe aparecer el aviso. Volvé, editá sin guardar y salí: debe avisar. Ante una falla de red, deben conservarse los valores y el aviso.
2. En una ficha con más de 12 registros, recorré páginas de vacunas, documentos y turnos. Cambiar de sección debe comenzar en la primera página. Probar una página fuera de rango debe mostrar la última válida.
3. En Agenda, elegí un miércoles y Semana: debe abrir el lunes de esa semana hasta el domingo. Cambiá estado y período. Verificá que un pendiente vencido siga por resolver y no aparezca como ausente sin una acción explícita.
4. Con un paciente de demostración, registrá una consulta: debe abrir el cierre. Adjuntá un archivo de prueba si corresponde y comprobá su aparición. Desde ahí revisá el turno existente o agendá la próxima cita. Volvé a la ficha para comprobar el registro. Estas operaciones sí escriben datos, por eso quedan para una prueba consciente con tu cuenta.
5. Con secretaria, comprobá la agenda y los turnos; no debe poder abrir el cierre clínico ni ver vacunas, documentos o alergias. Repetí la navegación en celular.

Los cambios están disponibles en el servidor local, sin publicación en Vercel. El rendimiento final sigue dependiendo de la conexión y de la base compartida; no se afirma una reducción porcentual sin medirla con sesiones reales.
