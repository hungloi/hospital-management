import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const lowStock = searchParams.get('lowStock');

    const where: any = {};
    if (category) where.category = category;
    if (status) where.status = status;
    if (lowStock === 'true') {
      where.inventory = { lte: 0 };
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: {
        batches: true,
      },
      orderBy: { name: 'asc' },
    });

    if (lowStock === 'true') {
      const filtered = medicines.filter((medicine) => medicine.inventory <= medicine.minStock);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(medicines);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medicines' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const medicine = await prisma.medicine.create({
      data: {
        name: data.name,
        activeIngredient: data.activeIngredient,
        unit: data.unit || 'Viên',
        category: data.category || 'GENERAL',
        description: data.description,
        inventory: data.inventory || 0,
        price: data.price || 0,
        costPrice: data.costPrice || 0,
        minStock: data.minStock || 10,
        maxStock: data.maxStock || 100,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(medicine, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medicine' }, { status: 500 });
  }
}
