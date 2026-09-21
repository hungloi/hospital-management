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

    const supplies = await prisma.medicalSupply.findMany({
      where,
      include: {
        batches: true,
      },
      orderBy: { name: 'asc' },
    });

    if (lowStock === 'true') {
      const filtered = supplies.filter((supply) => supply.inventory <= supply.minStock);
      return NextResponse.json(filtered);
    }

    return NextResponse.json(supplies);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch medical supplies' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const supply = await prisma.medicalSupply.create({
      data: {
        name: data.name,
        unit: data.unit || 'Cái',
        category: data.category || 'GENERAL',
        description: data.description,
        inventory: data.inventory || 0,
        price: data.price || 0,
        costPrice: data.costPrice || 0,
        minStock: data.minStock || 20,
        maxStock: data.maxStock || 200,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json(supply, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create medical supply' }, { status: 500 });
  }
}
