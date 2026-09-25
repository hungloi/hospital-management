const { Client } = require('pg');
const client = new Client({
  connectionString: "postgres://postgres:123@localhost:5432/hospital_db"
});

async function main() {
  await client.connect();
  
  console.log('Updating Director name...');
  await client.query(`UPDATE "User" SET name = 'GS.TS.BS. Trịnh Hưng Lợi' WHERE email = 'director@bvhungloi.vn'`);

  console.log('Creating articles...');
  const res = await client.query(`SELECT id FROM "User" WHERE email = 'director@bvhungloi.vn'`);
  const directorId = res.rows[0].id;

  await client.query(`DELETE FROM "Article"`);
  
  const articles = [
    {
      id: 'a1',
      title: 'Bệnh viện Đa khoa Hưng Lợi: Hành trình 25 năm chăm sóc sức khỏe toàn diện',
      slug: 'hanh-trinh-25-nam-cham-soc-suc-khoe',
      excerpt: 'Kỷ niệm 25 năm thành lập, Bệnh viện Đa khoa Hưng Lợi tự hào mang đến dịch vụ y tế chất lượng cao, với cơ sở vật chất hiện đại và đội ngũ chuyên gia hàng đầu.',
      content: '<p>Được thành lập từ năm 1999, Bệnh viện Đa khoa Hưng Lợi đã không ngừng vươn lên trở thành một trong những cơ sở y tế hàng đầu tại TP.HCM. Với phương châm "Chăm sóc sức khỏe toàn diện", chúng tôi tự hào mang đến các dịch vụ y tế đẳng cấp quốc tế.</p><h2>Cơ sở vật chất hiện đại</h2><p>Bệnh viện được trang bị hơn 3.000 giường bệnh đa dạng từ phòng tiêu chuẩn đến phòng VIP, cùng hệ thống máy móc xét nghiệm và chẩn đoán hình ảnh tiên tiến nhất.</p><h2>Đội ngũ chuyên gia</h2><p>Dưới sự dẫn dắt của Giám đốc, GS.TS.BS. Trịnh Hưng Lợi, cùng hơn 1.200 bác sĩ, chuyên gia y tế giàu kinh nghiệm, bệnh viện luôn đảm bảo chất lượng điều trị cao nhất cho bệnh nhân.</p>',
      category: 'NEWS',
      authorId: directorId,
      coverImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'a2',
      title: 'GS.TS.BS Trịnh Hưng Lợi: Người thuyền trưởng tận tâm của Bệnh viện Hưng Lợi',
      slug: 'gs-ts-bs-trinh-hung-loi-nguoi-thuyen-truong',
      excerpt: 'Chân dung GS.TS.BS Trịnh Hưng Lợi - vị Giám đốc đã cống hiến hơn 30 năm cho ngành y, đưa Bệnh viện Hưng Lợi vươn tầm khu vực.',
      content: '<p>Trải qua nhiều cương vị lãnh đạo và chuyên môn, GS.TS.BS Trịnh Hưng Lợi luôn tâm niệm: "Người thầy thuốc phải coi nỗi đau của người bệnh như nỗi đau của chính mình".</p><h2>Định hướng phát triển</h2><p>Trên cương vị Giám đốc Bệnh viện Đa khoa Hưng Lợi, GS.TS.BS Trịnh Hưng Lợi đã chỉ đạo xây dựng 50 chuyên khoa mũi nhọn, áp dụng các kỹ thuật phẫu thuật nội soi, can thiệp tim mạch phức tạp. Sự quyết đoán và tầm nhìn của ông đã giúp bệnh viện liên tục đạt danh hiệu Bệnh viện xuất sắc tuyến Trung ương.</p><p>Các vị trí Trưởng/Phó khoa tại bệnh viện hiện nay đều được tuyển chọn kỹ lưỡng, quy tụ nhiều chuyên gia có học hàm học vị cao, góp phần tạo nên một tập thể Y Bác sĩ vững mạnh.</p>',
      category: 'MEDICAL',
      authorId: directorId,
      coverImage: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=800&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'a3',
      title: 'Hệ thống Đặt lịch khám trực tuyến mới: Tiện lợi, Nhanh chóng',
      slug: 'he-thong-dat-lich-kham-truc-tuyen',
      excerpt: 'Bệnh viện Hưng Lợi chính thức ra mắt hệ thống đặt lịch khám trực tuyến mới, giúp người bệnh chủ động thời gian và giảm thiểu chờ đợi.',
      content: '<p>Nhằm nâng cao chất lượng dịch vụ và trải nghiệm của người bệnh, Bệnh viện Đa khoa Hưng Lợi giới thiệu tính năng Đặt lịch khám trực tuyến trên website.</p><p>Người bệnh giờ đây có thể dễ dàng chọn chuyên khoa, chọn bác sĩ và thời gian khám mong muốn. Các thông tin về phòng dịch vụ, phòng VIP cũng được cập nhật đầy đủ để bệnh nhân nội trú có thể đăng ký sử dụng.</p>',
      category: 'ANNOUNCEMENT',
      authorId: directorId,
      coverImage: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=800&auto=format&fit=crop',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  for (const a of articles) {
    await client.query(`
      INSERT INTO "Article" (id, title, slug, excerpt, content, category, "authorId", "coverImage", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [a.id, a.title, a.slug, a.excerpt, a.content, a.category, a.authorId, a.coverImage, a.createdAt, a.updatedAt]);
  }
  
  console.log('Success');
  await client.end();
}

main().catch(console.error);
