'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function createArticle(data: FormData) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return { error: 'Unauthorized' };
  }

  const title = data.get('title') as string;
  const slug = data.get('slug') as string;
  const excerpt = data.get('excerpt') as string;
  const content = data.get('content') as string;
  const coverImage = data.get('coverImage') as string;
  const category = data.get('category') as string;
  
  if (!title || !slug || !content) return { error: 'Vui lòng điền các trường bắt buộc' };

  try {
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) return { error: 'Đường dẫn (slug) đã tồn tại, vui lòng chọn đường dẫn khác.' };

    await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        authorId: (session.user as any).id
      }
    });

    revalidatePath('/admin/articles');
    revalidatePath('/news');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: 'Không thể đăng bài viết' };
  }
}
