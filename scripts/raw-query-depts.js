const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://postgres:123@localhost:5432/hospital_db"
});

async function main() {
  await client.connect();
  
  const res = await client.query(`
    SELECT u.id, u.email, u.role, d.name as dept_name
    FROM "User" u
    JOIN "Nurse" n ON u.id = n."userId"
    JOIN "Department" d ON n."departmentId" = d.id
    WHERE u.role = 'STAFF'
  `);
  
  let deptCounts = {};
  res.rows.forEach(r => {
    deptCounts[r.dept_name] = (deptCounts[r.dept_name] || 0) + 1;
  });
  console.log(deptCounts);

  await client.end();
}
main().catch(console.error);
