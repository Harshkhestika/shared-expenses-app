import { prisma } from './prisma';

export async function getGroupBalances(groupId: string) {
  // 1. Get all expenses paid by each user
  const paidExpenses = await prisma.expense.groupBy({
    by: ['paidById'],
    where: { groupId },
    _sum: { convertedAmount: true },
  });

  // 2. Get all owed amounts from splits
  const owedSplits = await prisma.expenseSplit.groupBy({
    by: ['userId'],
    where: { expense: { groupId } },
    _sum: { amount: true },
  });

  // 3. Get all settlements
  const paidSettlements = await prisma.settlement.groupBy({
    by: ['paidById'],
    where: { groupId },
    _sum: { amount: true },
  });

  const receivedSettlements = await prisma.settlement.groupBy({
    by: ['paidToId'],
    where: { groupId },
    _sum: { amount: true },
  });

  const users = await prisma.user.findMany();
  const userMap = new Map(users.map(u => [u.id, u.name]));

  const balances: Record<string, { id: string, name: string, paid: number, owed: number, balance: number }> = {};
  users.forEach(u => {
    balances[u.id] = { id: u.id, name: u.name, paid: 0, owed: 0, balance: 0 };
  });

  paidExpenses.forEach(p => {
    if (balances[p.paidById]) balances[p.paidById].paid += p._sum.convertedAmount || 0;
  });

  owedSplits.forEach(s => {
    if (balances[s.userId]) balances[s.userId].owed += s._sum.amount || 0;
  });

  paidSettlements.forEach(s => {
    if (balances[s.paidById]) balances[s.paidById].paid += s._sum.amount || 0;
  });

  receivedSettlements.forEach(s => {
    if (balances[s.paidToId]) balances[s.paidToId].owed += s._sum.amount || 0; // if you receive a settlement, it's like you owed it, so it increases what you 'owed' overall to offset your paid amount
  });

  // Calculate final balances
  // Balance > 0 means the user is owed money
  // Balance < 0 means the user owes money
  Object.values(balances).forEach(b => {
    b.balance = b.paid - b.owed;
  });

  // Simplify debts (Who pays whom)
  const debtors = Object.values(balances).filter(b => b.balance < -0.01).sort((a, b) => a.balance - b.balance);
  const creditors = Object.values(balances).filter(b => b.balance > 0.01).sort((a, b) => b.balance - a.balance);

  const simplifiedDebts: { from: string, fromName: string, to: string, toName: string, amount: number }[] = [];

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    
    const amount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    simplifiedDebts.push({
      from: debtor.id,
      fromName: debtor.name,
      to: creditor.id,
      toName: creditor.name,
      amount: Math.round(amount * 100) / 100
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }

  // Restore balances for return view
  Object.values(balances).forEach(b => {
    b.balance = b.paid - b.owed;
  });

  return {
    balances: Object.values(balances).filter(b => Math.abs(b.balance) > 0.01 || b.paid > 0),
    simplifiedDebts
  };
}
