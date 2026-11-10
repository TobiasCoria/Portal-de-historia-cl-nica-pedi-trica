# Portal Pediatría

Portal web de pediatría. Mi aporte incluye frontend, backend y base de datos. El acceso público distingue perfiles de doctora y secretaria.

[Acceso público](https://portal-de-historia-cl-nica-pedi-tri.vercel.app/login)

## Stack verificado

El manifiesto declara Next.js, React, TypeScript, Prisma, Supabase, React Hook Form, Zod y Tailwind CSS. Las dependencias no demuestran por sí mismas que todos los flujos estén completos o probados.

## Estructura

- `app/`: aplicación Next.js.
- `lib/`: utilidades y lógica compartida.
- `prisma/`: esquema y recursos de persistencia.
- `public/`: recursos estáticos.
- `middleware.ts`: middleware de aplicación.

## Desarrollo

Instalar con `npm ci`. El script de postinstalación genera el cliente Prisma. Configurar variables privadas de acuerdo con el código y el entorno antes de ejecutar `npm run dev`. Scripts disponibles: `npm run lint`, `npm run build`, `npm start`. No se ejecutaron estos checks como parte de la revisión documental.

## Privacidad

No incluir historias clínicas, documentos, capturas de pacientes, credenciales ni copias de bases reales. Usar datos ficticios en demostraciones. La pantalla pública no habilita acceso a información clínica sin autorización.

## English

Pediatric web portal with doctor and secretary entry roles. My contribution covers frontend, backend and databases. The package manifest declares Next.js, React, TypeScript, Prisma and Supabase. Public presentation is restricted to non-sensitive screens; no patient records are included.
