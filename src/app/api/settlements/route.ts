import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { groupId, paidToId, amount } = await request.json();
    const cookieStore = await cookies();
    const paidById = cookieStore.get('userId')?.value;

    if (!paidById) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!groupId || !paidToId || amount <= 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        paidById,
        paidToId,
        amount,
        date: new Date()
      }
    });

    return NextResponse.json({ success: true, settlement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
