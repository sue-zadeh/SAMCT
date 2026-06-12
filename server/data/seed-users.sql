INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'secretary1', 'Graeme', 'Norton', 'Graeme Norton', 'secretarysamct@gmail.com',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'CompanySecretary', '', '', true
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "UserName" = 'secretary1');

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'financial.admin', 'Amanda', 'Needham', 'Amanda Needham', 'amanda.needham@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'FinancialAdministrator', '', '', true
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "UserName" = 'financial.admin');

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'whitianga.manager', 'Gary', 'Salmon', 'Gary Salmon', 'whitianga.manager@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager', 'Whitianga', '', true
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "UserName" = 'whitianga.manager');

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'ngatea.manager', 'David', 'Craddock', 'David Craddock', 'ngatea.manager@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager', 'Ngatea', '', true
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "UserName" = 'ngatea.manager');

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'whitianga.assistant', 'Rob', 'Davis', 'Rob Davis', 'rob.davis@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager', 'Whitianga', '', true
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "UserName" = 'whitianga.assistant');

INSERT INTO "Users"
("UserName", "FirstName", "LastName", "FullName", "Email", "PasswordHash", "Role", "Village", "ProfileImageUrl", "IsActive")
SELECT
'ngatea.assistant', 'Graeme', 'Norton', 'Graeme Norton', 'graeme.norton@samct.co.nz',
'$2a$11$6R8yin0ON4bCQyasBNvKTeWb4a.rXaa4r21GA/Dx3cfRU6XtUzDHe',
'VillageManager', 'Ngatea', '', true
WHERE NOT EXISTS (SELECT 1 FROM "Users" WHERE "UserName" = 'ngatea.assistant');