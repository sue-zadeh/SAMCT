import { randomBytes } from 'node:crypto'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import bcrypt from 'bcryptjs'
import { database } from './e2e-database.mjs'
const connection = database()
await connection.connect()
try {
  // This command is deliberately destructive ONLY inside a validated disposable local _e2e database.
  await connection.query('TRUNCATE TABLE "AuthSessions", "MaintenanceRequests", "DocumentNotices", "PurchaseOrders", "VillageProperties", "ContactMessages", "Users" RESTART IDENTITY CASCADE')
  const password = 'Test-' + randomBytes(20).toString('hex')
  const passwordHash = await bcrypt.hash(password, 12)
  const definitions = [
    ['resident', 'Resident', 'Ngatea'], ['otherResident', 'Resident', 'Ngatea'], ['otherVillageResident', 'Resident', 'Whitianga'],
    ['manager', 'VillageManager', 'Ngatea'], ['otherManager', 'VillageManager', 'Whitianga'],
    ['admin', 'CompanySecretary', 'Ngatea'], ['financial', 'FinancialAdvisor', 'Ngatea'], ['chairman', 'Chairman', 'Ngatea'], ['genericAdmin', 'Admin', 'Ngatea'],
    ['lockout', 'Resident', 'Ngatea'], ['reset', 'Resident', 'Ngatea'], ['changePassword', 'Resident', 'Ngatea'],
    ['revoke', 'Resident', 'Ngatea'], ['inactive', 'Resident', 'Ngatea'],
  ]
  const users = {}
  for (const [key, role, village] of definitions) {
    const userName = `e2e.${key.toLowerCase()}`
    const email = `${key.toLowerCase()}@example.test`
    const result = await connection.query('INSERT INTO "Users" ("UserName","FirstName","LastName","FullName","Email","PasswordHash","Role","Village","ProfileImageUrl","IsActive","FailedLoginAttempts") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0) RETURNING "Id"',
      [userName, 'Test', key, `Test ${key}`, email, passwordHash, role, village, '', key !== 'inactive'])
    users[key] = { id: result.rows[0].Id, userName, email, role, village, password }
  }
  await mkdir('.playwright', { recursive: true })
  await writeFile('.playwright/users.json', JSON.stringify(users), { mode: 0o600 })
  const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP2cAAAAASUVORK5CYII=', 'base64')
  for (const folder of ['maintenance','documents','marketing','village-properties']) await mkdir(`.playwright/uploads/${folder}`, { recursive: true })
  await writeFile('.playwright/uploads/maintenance/ngatea.png', image)
  await writeFile('.playwright/uploads/maintenance/whitianga.png', image)
  await writeFile('.playwright/uploads/marketing/visible.png', image)
  await writeFile('.playwright/uploads/marketing/hidden.png', image)
  await writeFile('.playwright/uploads/documents/resident.pdf', '%PDF-1.4\nE2E fixture\n%%EOF')
  await writeFile('.playwright/uploads/documents/staff.pdf', '%PDF-1.4\nE2E fixture\n%%EOF')
  await writeFile('.playwright/uploads/village-properties/private.pdf', '%PDF-1.4\nE2E fixture\n%%EOF')
  for (const [key, village] of [['resident','Ngatea'],['otherResident','Ngatea'],['otherVillageResident','Whitianga']]) {
    await connection.query('INSERT INTO "MaintenanceRequests" ("Title","Description","UnitOrAddress","Priority","Status","Village","UserId","ManagerAnswer","IsReadByResident","IsReadByManager","ImageUrl1","ImageUrl2","CreatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,true,false,$9,$10,now())',
      [`${key} tap repair`, 'A leaking tap', 'Unit 1', 'Normal','Pending',village,users[key].id,'Staff response',key==='otherResident'?'':`/uploads/maintenance/${village.toLowerCase()}.png`,''])
  }
  for (const [title, visible, file] of [['Resident notice',true,'resident.pdf'],['Staff only',false,'staff.pdf']]) {
    await connection.query('INSERT INTO "DocumentNotices" ("Title","Type","Description","Village","FileUrl","FileName","IsVisibleToResidents","CreatedByUserId","CreatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,now())',
      [title,'Notice','A test notice','Ngatea',`/uploads/documents/${file}`,file,visible,users.manager.id])
  }
  for (const [village, visible, imageName] of [['Ngatea',true,'visible.png'],['Whitianga',false,'hidden.png']]) {
    await connection.query('INSERT INTO "VillageProperties" ("Village","UnitNumber","Address","ResidentCount","ResidentName","ResidentEmail","ResidentOccupation","VillageManagerName","Notes","DocumentUrl1","DocumentUrl2","IsVisibleOnMarketing","MarketingTitle","MarketingDescription","MarketingImageUrl1","MarketingImageUrl2","MarketingImageUrl3","MarketingImageUrl4","MarketingImageUrl5","CreatedAt") VALUES ($1,\'1\',\'Example address\',1,\'Private resident\',\'private@example.test\',\'Private occupation\',\'Private manager\',\'Private notes\',\'/uploads/village-properties/private.pdf\',\'\',$2,\'Published title\',\'Published description\',$3,\'\',\'\',\'\',\'\',now())', [village,visible,`/uploads/marketing/${imageName}`])
    await connection.query('INSERT INTO "PurchaseOrders" ("Village","UnitNumber","Title","Category","Supplier","EstimatedCost","Priority","Status","Notes","CreatedByUserName","CreatedAt") VALUES ($1,\'1\',\'Test order\',\'Maintenance\',\'Test supplier\',100,\'Normal\',\'Pending\',\'\',\'e2e.manager\',now())',[village])
  }
  console.log('Seeded isolated E2E accounts and records. Credentials stay in ignored .playwright/users.json.')
} finally { await connection.end() }
