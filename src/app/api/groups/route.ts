import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const group = await prisma.group.create({
      data: { name }
    });

    await prisma.groupMembership.create({
      data: {
        groupId: group.id,
        userId: userId,
        joinedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const groups = await prisma.group.findMany({ include: { memberships: { include: { user: true } } } });
  return NextResponse.json(groups);
}
