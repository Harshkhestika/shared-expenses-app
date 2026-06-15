import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json();
    const groupId = params.id;

    const existing = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (existing) {
      if (existing.leftAt) {
        await prisma.groupMembership.update({
          where: { id: existing.id },
          data: { leftAt: null }
        });
      }
      return NextResponse.json({ success: true });
    }

    const membership = await prisma.groupMembership.create({
      data: {
        groupId,
        userId,
        joinedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, membership });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json();
    const groupId = params.id;

    const existing = await prisma.groupMembership.findUnique({
      where: { groupId_userId: { groupId, userId } }
    });

    if (existing) {
      await prisma.groupMembership.update({
        where: { id: existing.id },
        data: { leftAt: new Date() } // Mark as left
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
