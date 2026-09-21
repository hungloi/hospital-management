const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('=== Fetching departments ===');
  const depts = await prisma.department.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  console.log(JSON.stringify(depts, null, 2));
  
  console.log('\n=== Counting existing users by role ===');
  const users = await prisma.user.findMany({ select: { role: true, name: true }, orderBy: { role: 'asc' } });
  const roleCounts: Record<string, number> = {};
  users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] || 0) + 1; });
  console.log(JSON.stringify(roleCounts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
