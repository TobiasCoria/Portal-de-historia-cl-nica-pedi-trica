ALTER TABLE "Perfil" ADD COLUMN "rol" "Rol" NOT NULL DEFAULT 'SECRETARIA';
UPDATE "Perfil" SET "rol" = 'DOCTORA' WHERE lower("email") = 'gritest@gmail.com';
ALTER TABLE "Perfil" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "Perfil" FROM anon, authenticated;
