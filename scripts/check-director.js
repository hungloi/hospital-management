const { Client } = require('pg');
const client = new Client({ connectionString: "postgres://postgres:123@localhost:5432/hospital_db" });
async function main() {
  await client.connect();
  const res = await client.query(`SELECT id, email, name, role FROM "User" WHERE email = 'director@bvhungloi.vn'`);
  console.log(res.rows);
  await client.end();
}
main().catch(console.error);
