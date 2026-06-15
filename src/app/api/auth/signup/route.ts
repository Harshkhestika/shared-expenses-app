import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email: email.toLowerCase() }, { name: name.toLowerCase() }] }
    });

    if (existing) {
      return NextResponse.json({ error: "User with this name or email already exists" }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash: password // Raw for simplicity in this assignment
      }
    });

    cookies().set('userId', user.id, { path: '/' });
    cookies().set('userName', user.name, { path: '/' });

    return NextResponse.json({ success: true, user: { id: user.id, name: user.name } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
