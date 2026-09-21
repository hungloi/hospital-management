'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function createUser(data: FormData) {
  const name = data.get('name') as string;
  const email = data.get('email') as string;
  const password = data.get('password') as string;
  const role = data.get('role') as string;
  const phone = data.get('phone') as string;

  if (!name || !email || !password || !role) {
    return { error: 'Vui lòng điền đầy đủ các trường bắt buộc' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'Email này đã được sử dụng' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
      },
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return { error: 'Lỗi khi tạo người dùng' };
  }
}

export async function createDepartment(data: FormData) {
  const name = data.get('name') as string;
  const description = data.get('description') as string;
  const floor = data.get('floor') as string;

  if (!name) {
    return { error: 'Vui lòng nhập tên khoa' };
  }

  try {
    await prisma.department.create({
      data: { name, description, floor },
    });
    revalidatePath('/admin/departments');
    return { success: true };
  } catch (error) {
    return { error: 'Lỗi khi tạo khoa (Có thể tên khoa đã tồn tại)' };
  }
}

export async function createDoctor(data: FormData) {
  const userId = data.get('userId') as string;
  const departmentId = data.get('departmentId') as string;
  const specialty = data.get('specialty') as string;
  const bio = data.get('bio') as string;
  const licenseNo = data.get('licenseNo') as string;

  if (!userId || !specialty || !departmentId) {
    return { error: 'Vui lòng chọn Bác sĩ, Khoa và nhập Chuyên khoa' };
  }

  try {
    await prisma.doctor.create({
      data: {
        userId,
        departmentId,
        specialty,
        bio,
        licenseNo,
      },
    });
    revalidatePath('/admin/doctors');
    revalidatePath('/admin/departments');
    return { success: true };
  } catch (error) {
    return { error: 'Lỗi khi tạo hồ sơ bác sĩ (Có thể User này đã là bác sĩ)' };
  }
}

export async function createMedicine(data: FormData) {
  const name = data.get('name') as string;
  const activeIngredient = data.get('activeIngredient') as string;
  const unit = data.get('unit') as string;
  const description = data.get('description') as string;

  if (!name || !unit) {
    return { error: 'Vui lòng nhập Tên thuốc và Đơn vị' };
  }

  try {
    await prisma.medicine.create({
      data: { name, activeIngredient, unit, description },
    });
    revalidatePath('/admin/medicines');
    return { success: true };
  } catch (error) {
    return { error: 'Lỗi khi thêm thuốc' };
  }
}

export async function updateUserAction(id: string, data: FormData) {
  const name = data.get('name') as string;
  const role = data.get('role') as string;
  const phone = data.get('phone') as string;
  const password = data.get('password') as string;

  try {
    const updateData: any = { name, role, phone };
    
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
      where: { id },
      data: updateData
    });

    revalidatePath(`/admin/users/${id}`);
    revalidatePath(`/admin/users`);
    return { success: true };
  } catch (error) {
    return { error: 'Lỗi khi cập nhật người dùng' };
  }
}
