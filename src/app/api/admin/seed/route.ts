import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // ========== DEPARTMENTS ==========
    const departments = [
      { name: 'Khoa Nội', description: 'Internal Medicine Department' },
      { name: 'Khoa Ngoại', description: 'Surgery Department' },
      { name: 'Khoa Nhi', description: 'Pediatrics Department' },
      { name: 'Khoa Tim Mạch', description: 'Cardiology Department' },
    ];
    for (const d of departments) {
      await prisma.department.upsert({
        where: { name: d.name },
        update: {},
        create: d
      });
    }

    // ========== MEDICINES ==========
    const medicines = [
      { name: 'Amoxicillin 500mg', activeIngredient: 'Amoxicillin', unit: 'Viên', category: 'ANTIBIOTICS', price: 5000, inventory: 500 },
      { name: 'Paracetamol 500mg', activeIngredient: 'Paracetamol', unit: 'Viên', category: 'PAIN', price: 2000, inventory: 1000 },
      { name: 'Ibuprofen 400mg', activeIngredient: 'Ibuprofen', unit: 'Viên', category: 'PAIN', price: 3000, inventory: 800 },
      { name: 'Cetirizine 10mg', activeIngredient: 'Cetirizine', unit: 'Viên', category: 'ALLERGY', price: 4000, inventory: 400 },
      { name: 'Omeprazole 20mg', activeIngredient: 'Omeprazole', unit: 'Viên', category: 'DIGESTIVE', price: 7000, inventory: 300 },
      { name: 'Metformin 500mg', activeIngredient: 'Metformin', unit: 'Viên', category: 'DIABETES', price: 8000, inventory: 400 },
      { name: 'Vitamin C 1000mg', activeIngredient: 'Ascorbic acid', unit: 'Viên', category: 'VITAMIN', price: 3000, inventory: 800 },
      { name: 'Amlodipine 5mg', activeIngredient: 'Amlodipine', unit: 'Viên', category: 'HYPERTENSION', price: 8000, inventory: 300 },
    ];

    for (const m of medicines) {
      const existing = await prisma.medicine.findFirst({ where: { name: m.name } });
      if (!existing) {
        await prisma.medicine.create({ data: m });
      }
    }

    // ========== MEDICAL SUPPLIES ==========
    const supplies = [
      { name: 'Gauze Pad 4x4"', unit: 'Gói', category: 'BANDAGE', price: 5000, inventory: 500 },
      { name: 'Syringe 3ml', unit: 'Cái', category: 'NEEDLE', price: 1500, inventory: 2000 },
      { name: 'Latex Glove (M)', unit: 'Gói', category: 'GLOVE', price: 3000, inventory: 600 },
      { name: 'Cotton Ball', unit: 'Gói', category: 'COTTON', price: 2000, inventory: 800 },
      { name: 'Alcohol 70%', unit: 'Lọ', category: 'DISINFECTANT', price: 8000, inventory: 200 },
    ];

    for (const s of supplies) {
      const existing = await prisma.medicalSupply.findFirst({ where: { name: s.name } });
      if (!existing) {
        await prisma.medicalSupply.create({ data: s });
      }
    }

    // ========== ROOMS ==========
    const roomData = [
      { name: 'Phòng 101', type: 'NORMAL', floor: 1, bed: 'Giường A', ratePerDay: 150000 },
      { name: 'Phòng 102', type: 'NORMAL', floor: 1, bed: 'Giường B', ratePerDay: 150000 },
      { name: 'Phòng VIP 201', type: 'VIP', floor: 2, bed: 'Giường VIP A', ratePerDay: 400000 },
      { name: 'Phòng ICU 301', type: 'ICU', floor: 3, bed: 'ICU Bed 1', ratePerDay: 600000 },
    ];

    for (const r of roomData) {
      const existing = await prisma.room.findFirst({ where: { name: r.name } });
      if (!existing) {
        await prisma.room.create({
          data: { ...r, status: 'AVAILABLE', description: `${r.type} room` }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Seed dữ liệu thành công' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Lỗi seed dữ liệu' }, { status: 500 });
  }
}
