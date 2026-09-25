const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://postgres:123@localhost:5432/hospital_db"
});

async function main() {
  await client.connect();
  
  // Update all admins to STAFF except director
  await client.query(`UPDATE "User" SET role = 'STAFF' WHERE role = 'ADMIN' AND email != 'director@bvhungloi.vn'`);
  
  // Also we can update specific departments if we can join, but we can just use Prisma for this part since it's easier to find users by department if we do it properly, wait we don't have adapter configured. Let's just use raw query.
  
  console.log('Update successful');

  await client.end();
}
main().catch(console.error);
