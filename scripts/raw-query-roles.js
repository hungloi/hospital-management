const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://postgres:123@localhost:5432/hospital_db"
});

async function main() {
  await client.connect();
  
  // Show all roles used in the DB
  const res = await client.query(`SELECT DISTINCT role FROM "User"`);
  console.log(res.rows);

  await client.end();
}
main().catch(console.error);
