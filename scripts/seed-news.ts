import { prisma } from '../src/lib/prisma';
import { MOCK_NEWS } from '../src/data/mockNews';

async function seedNews() {
  console.log('Seeding news...');
  
  // Get admin user to be the author
  let author = await prisma.user.findUnique({ where: { email: 'admin@hospital.com' } });
  if (!author) {
    author = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  }
  
  if (!author) {
    console.error('No admin user found to use as author');
    return;
  }

  for (const news of MOCK_NEWS) {
    const existing = await prisma.article.findUnique({ where: { slug: news.slug } });
    
    if (existing) {
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          title: news.title,
          excerpt: news.desc,
          content: news.content,
          coverImage: news.img,
          category: news.tag === 'Thông báo' ? 'ANNOUNCEMENT' : news.tag === 'Sức khỏe' ? 'MEDICAL' : 'NEWS',
        }
      });
      console.log(`Updated: ${news.title}`);
    } else {
      await prisma.article.create({
        data: {
          title: news.title,
          slug: news.slug,
          excerpt: news.desc,
          content: news.content,
          coverImage: news.img,
          category: news.tag === 'Thông báo' ? 'ANNOUNCEMENT' : news.tag === 'Sức khỏe' ? 'MEDICAL' : 'NEWS',
          authorId: author.id,
        }
      });
      console.log(`Created: ${news.title}`);
    }
  }
  
  console.log('Finished seeding news!');
}

seedNews()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
