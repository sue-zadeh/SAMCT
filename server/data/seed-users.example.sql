-- Synthetic local-development accounts only. Never run this against production.
-- Usage:
--   psql "$DATABASE_URL" -v seed_password="$SAMCT_SEED_PASSWORD" \
--     -f server/data/seed-users.example.sql

\if :{?seed_password}
\else
  \echo 'Pass -v seed_password=...; no users were created.'
  \quit
\endif

CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "Users"
  ("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash",
   "Role", "Village", "ProfileImageUrl", "IsActive", "TokenVersion")
VALUES
  ('demo.admin', 'Demo', 'Admin', 'Demo Admin', 'admin@example.invalid',
   crypt(:'seed_password', gen_salt('bf', 12)), 'CompanySecretary', 'Ngatea', '', true, 0),
  ('demo.manager', 'Demo', 'Manager', 'Demo Manager', 'manager@example.invalid',
   crypt(:'seed_password', gen_salt('bf', 12)), 'VillageManager', 'Ngatea', '', true, 0),
  ('demo.resident', 'Demo', 'Resident', 'Demo Resident', 'resident@example.invalid',
   crypt(:'seed_password', gen_salt('bf', 12)), 'Resident', 'Ngatea', '', true, 0)
ON CONFLICT DO NOTHING;
