import { prisma } from '../src/lib/prisma';
async function main() {
  // Check Room model structure
  const room = await (prisma as any).room?.findFirst();
  console.log('Room sample:', JSON.stringify(room, null, 2));
  
  const count = await (prisma as any).room?.count();
  console.log('Room count:', count);
  
  // Get schema info
  const depts = await prisma.department.findMany({ 
    include: { rooms: true }, 
    take: 3 
  });
  console.log('Dept with rooms:', JSON.stringify(depts.map((d: any) => ({ name: d.name, roomCount: d.rooms?.length })), null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
