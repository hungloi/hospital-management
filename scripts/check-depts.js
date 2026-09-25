const { Client } = require('pg');
const client = new Client({ connectionString: "postgres://postgres:123@localhost:5432/hospital_db" });
async function main() {
  await client.connect();
  // All departments
  const depts = await client.query(`SELECT id, name FROM "Department" ORDER BY name`);
  console.log("=== All Departments ===");
  depts.rows.forEach((d, i) => console.log(i+1, d.name));
  
  // Departments without any doctor
  const noDoctorDepts = await client.query(`
    SELECT d.id, d.name 
    FROM "Department" d
    LEFT JOIN "Doctor" doc ON d.id = doc."departmentId"
    WHERE doc."departmentId" IS NULL
    ORDER BY d.name
  `);
  console.log("\n=== Departments WITHOUT doctors ===");
  noDoctorDepts.rows.forEach((d) => console.log(d.name));

  // Count roles
  const roles = await client.query(`SELECT role, count(*) FROM "User" GROUP BY role ORDER BY role`);
  console.log("\n=== Roles ===");
  roles.rows.forEach(r => console.log(r.role, r.count));
  
  await client.end();
}
main().catch(console.error);
