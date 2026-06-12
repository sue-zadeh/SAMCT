-- server/data/seed-users.sql
-- Default password for all seeded users: 123Suezx@
-- Hash:
-- $2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'secretary1',
'Graeme',
'Norton',
'Graeme Norton',
'secretarysamct@gmail.com',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'CompanySecretary',
'',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'secretary1'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'financial.admin',
'Amanda',
'Needham',
'Amanda Needham',
'amanda.needham@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'FinancialAdministrator',
'',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'financial.admin'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'chairman',
'Reece',
'Prewett',
'Reece Prewett',
'reece.prewett@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'Chairman',
'',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'chairman'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'director.don',
'Don',
'Mansfield',
'Don Mansfield',
'don.mansfield@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'Director',
'',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'director.don'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'director.ray',
'Ray',
'Burgess',
'Ray Burgess',
'ray.burgess@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'Director',
'',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'director.ray'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'director.gary',
'Gary',
'Salmon',
'Gary Salmon',
'gary.salmon@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'Director',
'',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'director.gary'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'whitianga.manager',
'Gary',
'Salmon',
'Gary Salmon',
'whitianga.manager@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager',
'Whitianga',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'whitianga.manager'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'whitianga.assistant',
'Rob',
'Davis',
'Rob Davis',
'rob.davis@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager',
'Whitianga',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'whitianga.assistant'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'ngatea.manager',
'David',
'Craddock',
'David Craddock',
'ngatea.manager@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager',
'Ngatea',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'ngatea.manager'
);

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'ngatea.assistant',
'Graeme',
'Norton',
'Graeme Norton',
'graeme.norton@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager',
'Ngatea',
'',
true
WHERE NOT EXISTS (
  SELECT 1 FROM "Users" WHERE "UserName" = 'ngatea.assistant'
);