const { Client } = require('pg');
const client = new Client({ connectionString: "postgres://postgres:123@localhost:5432/hospital_db" });
async function main() {
  await client.connect();

  // 1. Thêm role DIRECTOR riêng cho Trịnh Hưng Lợi - nhưng phải giữ quyền ADMIN để truy cập /admin
  // => Dùng ADMIN role nhưng ghi chức danh đầy đủ trong name
  // Thực ra user đang là ADMIN rồi - chỉ cần hiển thị đúng label DIRECTOR trong UI
  // => Sửa: thêm 1 cột mới "title" sẽ phức tạp, 
  // => Cách đơn giản: đổi role thành 'DIRECTOR' nhưng sửa /auth/redirect và /admin để DIRECTOR cũng có quyền vào /admin
  
  await client.query(`UPDATE "User" SET role = 'DIRECTOR', name = 'GS.TS.BS. Trịnh Hưng Lợi' WHERE email = 'director@bvhungloi.vn'`);
  console.log("✅ Updated director role to DIRECTOR");

  // 2. Assign HEAD_ROOM (Trưởng phòng) to admin departments
  // These 8 phong ban have STAFF users via Nurse table (seeded as admin staff)
  const adminDepts = [
    'Phòng Công nghệ thông tin',
    'Phòng Điều dưỡng',
    'Phòng Kế hoạch Tổng hợp',
    'Phòng Quản lý chất lượng & Chăm sóc khách hàng',
    'Phòng Tài chính - Kế toán',
    'Phòng Tổ chức Cán bộ',
    'Phòng Vật tư - Thiết bị y tế',
    'Trung tâm Đào tạo & Chỉ đạo tuyến'
  ];

  for (const deptName of adminDepts) {
    // Get first staff in this dept via Nurse table
    const staffRes = await client.query(`
      SELECT u.id, u.name, u.role FROM "User" u
      JOIN "Nurse" n ON u.id = n."userId"
      JOIN "Department" d ON n."departmentId" = d.id
      WHERE d.name = $1 AND u.role IN ('STAFF', 'ACCOUNTANT')
      ORDER BY u."createdAt"
      LIMIT 1
    `, [deptName]);
    
    if (staffRes.rows.length > 0) {
      const staff = staffRes.rows[0];
      // Determine prefix based on department
      let prefix = 'ThS.';
      if (deptName.includes('Kế toán')) prefix = 'CPA.';
      if (deptName.includes('CNTT') || deptName.includes('thông tin')) prefix = 'ThS.CNTT.';
      if (deptName.includes('Đào tạo')) prefix = 'TS.';
      
      const cleanName = staff.name.replace(/^(ThS\.|TS\.|BS\.|CNĐD\. Trưởng |ĐD\.|CNĐD\.|CPA\.|ThS\.CNTT\.)\s*/, '');
      const newName = `${prefix} ${cleanName}`;
      
      await client.query(`UPDATE "User" SET role = 'HEAD_DOCTOR', name = $1 WHERE id = $2`, [newName, staff.id]);
      console.log(`✅ ${deptName}: ${staff.name} → Trưởng phòng (${staff.role})`);
    } else {
      console.log(`⚠️ No staff found for: ${deptName}`);
    }
  }

  // Verify
  const roles = await client.query(`SELECT role, count(*) FROM "User" GROUP BY role ORDER BY role`);
  console.log("\n=== Updated Roles ===");
  roles.rows.forEach(r => console.log(r.role, ':', r.count));

  await client.end();
}
main().catch(console.error);
