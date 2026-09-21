import { prisma } from './src/lib/prisma';

async function main() {
  const depts = [
    // Khoa Nội
    'Khoa Nội Tổng Hợp',
    'Khoa Tim Mạch',
    'Khoa Hô Hấp',
    'Khoa Tiêu Hóa',
    'Khoa Thần Kinh',
    'Khoa Nội Tiết',
    'Khoa Thận - Tiết Niệu',
    'Khoa Huyết Học',
    
    // Khoa Ngoại
    'Khoa Ngoại Tổng Hợp',
    'Khoa Chấn Thương Chỉnh Hình',
    'Khoa Phẫu Thuật Lồng Ngực',
    'Khoa Phẫu Thuật Mạch',
    'Khoa Tiêu Hóa - Gan Mật Tụy',
    'Khoa Tiết Niệu - Nam Khoa',
    
    // Khoa Phụ nữ - Nhi
    'Khoa Sản Phụ Khoa',
    'Khoa Nhi',
    'Khoa Nhi Hô Hấp',
    
    // Khoa Chuyên Ngành
    'Khoa Mắt',
    'Khoa Tai Mũi Họng',
    'Khoa Răng Hàm Mặt',
    'Khoa Da Liễu - Thẩm Mỹ',
    'Khoa Cơ Xương Khớp',
    'Khoa Phục Hồi Chức Năng',
    'Khoa Tâm Thần - Tâm Lý',
    
    // Khoa Cấp Cứu & Hồi Sức
    'Khoa Cấp Cứu',
    'Khoa Hồi Sức Tích Cực (ICU)',
    'Khoa Hồi Sức Tích Cực Nhi (PICU)',
    'Khoa Gây Mê Hồi Sức',
    
    // Khoa Chẩn Đoán
    'Khoa Chẩn Đoán Hình Ảnh',
    'Khoa Xét Nghiệm',
    'Khoa Siêu Âm Chẩn Đoán',
    'Khoa Điện Não',
    
    // Khoa Hỗ Trợ
    'Khoa Y Học Cổ Truyền',
    'Khoa Truyền Nhiễm',
    'Khoa Ung Bướu',
    'Khoa Pháp Y - Giám Định Tư Pháp',
    'Khoa Phòng Chống Bệnh Tật',
    
    // Phòng Ban Hành Chính
    'Phòng Quản Lý Chất Lượng',
    'Phòng Công Nghệ Thông Tin',
    'Phòng Kế Toán - Tài Chính',
    'Phòng Nhân Sự - Hành Chính',
    'Phòng Dược',
    'Phòng Dinh Dưỡng',
    'Phòng Vệ Sinh - Khám Chữa Bệnh',
    'Phòng Đào Tạo - Nghiên Cứu Khoa Học'
  ];

  console.log(`\n📋 Bắt đầu thêm ${depts.length} khoa/phòng ban...\n`);
  
  let added = 0;
  let skipped = 0;

  for (const name of depts) {
    try {
      const existing = await prisma.department.findFirst({ where: { name } });
      if (!existing) {
        await prisma.department.create({
          data: {
            name,
            description: name.includes('Phòng') ? `${name} - Bộ phận hành chính` : `Chuyên khoa ${name}`
          }
        });
        console.log('✓ ' + name);
        added++;
      } else {
        console.log('⊘ ' + name + ' (đã tồn tại)');
        skipped++;
      }
    } catch (error) {
      console.error('✗ Lỗi thêm ' + name, error);
    }
  }

  console.log(`\n✅ Hoàn tất: Đã thêm ${added} khoa/phòng, Bỏ qua ${skipped} (đã tồn tại)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
