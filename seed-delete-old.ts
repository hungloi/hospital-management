const { PrismaClient } = require('./src/generated/prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🗑️  Bắt đầu xóa dữ liệu cũ...\n');
  
  // Xóa tất cả User
  const deletedUsers = await prisma.user.deleteMany({});
  console.log(`✓ Đã xóa ${deletedUsers.count} User cũ`);
  
  // Xóa tất cả Doctor
  const deletedDoctors = await prisma.doctor.deleteMany({});
  console.log(`✓ Đã xóa ${deletedDoctors.count} Doctor cũ`);
  
  console.log('\n✅ Dữ liệu cũ đã được xóa sạch!');
}

main()
  .catch(e => {
    console.error('Lỗi:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
