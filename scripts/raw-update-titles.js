const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://postgres:123@localhost:5432/hospital_db"
});

async function main() {
  await client.connect();

  console.log("Updating Director to ADMIN but with nice name...");
  await client.query(`UPDATE "User" SET role = 'ADMIN', name = 'GS.TS.BS. Trịnh Hưng Lợi' WHERE email = 'director@bvhungloi.vn'`);
  
  // Pick 3 doctors to be DEPUTY_DIRECTOR
  const deputyRes = await client.query(`
    SELECT u.id, u.name FROM "User" u 
    JOIN "Doctor" d ON u.id = d."userId"
    WHERE u.role = 'DOCTOR'
    LIMIT 3
  `);
  for (const dep of deputyRes.rows) {
    const newName = `PGS.TS.BS. ${dep.name.replace(/^(BS\.|ThS\.BS\.|TS\.BS\.|BSCKI\.|BSCKII\.|PGS\.TS\.BS\.)\s*/, '')}`;
    await client.query(`UPDATE "User" SET role = 'DEPUTY_DIRECTOR', name = $1 WHERE id = $2`, [newName, dep.id]);
  }

  // Get all departments with doctors
  const deptsRes = await client.query(`
    SELECT d.id, d.name, array_agg(u.id) as doctor_ids
    FROM "Department" d
    JOIN "Doctor" doc ON d.id = doc."departmentId"
    JOIN "User" u ON doc."userId" = u.id
    WHERE u.role = 'DOCTOR'
    GROUP BY d.id, d.name
  `);

  console.log(`Found ${deptsRes.rows.length} departments with doctors to update...`);

  const headPrefixes = ['PGS.TS.BS.', 'TS.BS.', 'BSCKII.'];
  const deputyPrefixes = ['TS.BS.', 'BSCKII.', 'BSCKI.'];
  const regularPrefixes = ['ThS.BS.', 'BSCKI.', 'BS.', 'BS.'];

  for (const dept of deptsRes.rows) {
    let docIds = dept.doctor_ids;
    if (docIds.length < 3) continue; // skip if not enough doctors

    // Pick 1 head
    const headId = docIds[0];
    const headPrefix = headPrefixes[Math.floor(Math.random() * headPrefixes.length)];
    await client.query(`
      UPDATE "User" 
      SET role = 'HEAD_DOCTOR', 
          name = $1 || ' ' || regexp_replace(name, '^(BS\.|ThS\.BS\.|TS\.BS\.|BSCKI\.|BSCKII\.|PGS\.TS\.BS\.|GS\.TS\.BS\.)\s*', '')
      WHERE id = $2
    `, [headPrefix, headId]);

    // Pick 2 deputies
    for (let i = 1; i <= 2; i++) {
      const depId = docIds[i];
      const depPrefix = deputyPrefixes[Math.floor(Math.random() * deputyPrefixes.length)];
      await client.query(`
        UPDATE "User" 
        SET role = 'DEPUTY_HEAD', 
            name = $1 || ' ' || regexp_replace(name, '^(BS\.|ThS\.BS\.|TS\.BS\.|BSCKI\.|BSCKII\.|PGS\.TS\.BS\.|GS\.TS\.BS\.)\s*', '')
        WHERE id = $2
      `, [depPrefix, depId]);
    }

    // Update the rest
    for (let i = 3; i < docIds.length; i++) {
      const regId = docIds[i];
      const regPrefix = regularPrefixes[Math.floor(Math.random() * regularPrefixes.length)];
      await client.query(`
        UPDATE "User" 
        SET name = $1 || ' ' || regexp_replace(name, '^(BS\.|ThS\.BS\.|TS\.BS\.|BSCKI\.|BSCKII\.|PGS\.TS\.BS\.|GS\.TS\.BS\.)\s*', '')
        WHERE id = $2
      `, [regPrefix, regId]);
    }
  }

  // Update Nurses (Điều dưỡng)
  // Each dept has a HEAD_NURSE (Điều dưỡng trưởng)
  // Let's create HEAD_NURSE role or just keep it as NURSE but with "ĐD. Trưởng" name?
  // Wait, there is no HEAD_NURSE in roleLabel. Only `NURSE: '💉 Y tá/ĐD'`. 
  // Wait! Wait! Wait! `NURSE` role is fine. I can just prefix their names with `ĐD.` or `CNĐD.` or `ThS.ĐD.`
  const nurseDeptsRes = await client.query(`
    SELECT d.id, d.name, array_agg(u.id) as nurse_ids
    FROM "Department" d
    JOIN "Nurse" n ON d.id = n."departmentId"
    JOIN "User" u ON n."userId" = u.id
    WHERE u.role = 'NURSE'
    GROUP BY d.id, d.name
  `);

  console.log(`Found ${nurseDeptsRes.rows.length} departments with nurses to update...`);

  for (const dept of nurseDeptsRes.rows) {
    let nurseIds = dept.nurse_ids;
    if (nurseIds.length === 0) continue;

    const headNurseId = nurseIds[0];
    await client.query(`
      UPDATE "User" 
      SET name = 'CNĐD. Trưởng ' || regexp_replace(name, '^(ĐD\.|CNĐD\.|ThS\.ĐD\.|CNĐD\. Trưởng )\s*', '')
      WHERE id = $1
    `, [headNurseId]);

    const regNursePrefixes = ['ĐD.', 'ĐD.', 'CNĐD.', 'CNĐD.'];
    for (let i = 1; i < nurseIds.length; i++) {
      const regPrefix = regNursePrefixes[Math.floor(Math.random() * regNursePrefixes.length)];
      await client.query(`
        UPDATE "User" 
        SET name = $1 || ' ' || regexp_replace(name, '^(ĐD\.|CNĐD\.|ThS\.ĐD\.|CNĐD\. Trưởng )\s*', '')
        WHERE id = $2
      `, [regPrefix, nurseIds[i]]);
    }
  }

  console.log("Success!");
  await client.end();
}
main().catch(console.error);
