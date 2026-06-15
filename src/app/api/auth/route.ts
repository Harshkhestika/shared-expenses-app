import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    // Simplified login for assignment: just find user by name (case insensitive in app logic)
    const users = await prisma.user.findMany();
    const user = users.find(u => u.name.toLowerCase() === name.toLowerCase());

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, { path: '/' });
    cookieStore.set('userName', user.name, { path: '/' });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
