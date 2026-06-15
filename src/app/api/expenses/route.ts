import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { groupId, description, amount, splitType, splitDetails } = await request.json();
    const cookieStore = await cookies();
    const paidById = cookieStore.get('userId')?.value;

    if (!paidById) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Validate inputs
    if (!groupId || !description || amount <= 0 || !splitType || !splitDetails || Object.keys(splitDetails).length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        groupId,
        paidById,
        amount,
        originalCurrency: 'INR',
        convertedAmount: amount,
        description,
        date: new Date()
      }
    });

    const userIds = Object.keys(splitDetails);
    
    // Normalize splits to exact amounts
    let exactSplits: Record<string, number> = {};
    if (splitType === 'equal') {
      const splitAmount = amount / userIds.length;
      userIds.forEach(uid => exactSplits[uid] = splitAmount);
    } else if (splitType === 'exact') {
      let total = 0;
      userIds.forEach(uid => {
        exactSplits[uid] = splitDetails[uid];
        total += splitDetails[uid];
      });
      if (Math.abs(total - amount) > 0.01) {
        throw new Error("Exact splits do not sum to total amount");
      }
    } else if (splitType === 'percentage') {
      let totalPct = 0;
      userIds.forEach(uid => totalPct += splitDetails[uid]);
      userIds.forEach(uid => {
        const normalizedPct = splitDetails[uid] / totalPct;
        exactSplits[uid] = amount * normalizedPct;
      });
    } else if (splitType === 'share') {
      let totalShares = 0;
      userIds.forEach(uid => totalShares += splitDetails[uid]);
      userIds.forEach(uid => {
        exactSplits[uid] = amount * (splitDetails[uid] / totalShares);
      });
    }

    // Insert splits
    const splitsToCreate = userIds.map(userId => ({
      expenseId: expense.id,
      userId,
      amount: exactSplits[userId]
    }));

    await prisma.expenseSplit.createMany({
      data: splitsToCreate
    });

    return NextResponse.json({ success: true, expense });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
