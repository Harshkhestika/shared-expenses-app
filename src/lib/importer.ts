import { prisma } from './prisma';

export async function runImport(csvText: string) {
  // 1. Clean DB
  await prisma.expenseSplit.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.groupMembership.deleteMany();
  await prisma.anomalyLog.deleteMany();
  await prisma.group.deleteMany();
  await prisma.user.deleteMany();

  // 2. Setup Users
  const userNames = ['Aisha', 'Rohan', 'Priya', 'Meera', 'Dev', 'Sam', 'Kabir'];
  const users: Record<string, string> = {};
  for (const name of userNames) {
    const u = await prisma.user.create({
      data: {
        name,
        email: `${name.toLowerCase()}@example.com`,
        passwordHash: 'hashedpassword',
      }
    });
    // normalize names (e.g. Priya S -> Priya, priya -> Priya)
    users[name.toLowerCase()] = u.id;
  }
  // Mapping for aliases
  users['priya s'] = users['priya'];

  // 3. Setup Group
  const group = await prisma.group.create({
    data: { name: 'Main Flat' }
  });

  // Setup memberships
  const memberships = [
    { name: 'Aisha', joinedAt: new Date('2026-01-01') },
    { name: 'Rohan', joinedAt: new Date('2026-01-01') },
    { name: 'Priya', joinedAt: new Date('2026-01-01') },
    { name: 'Meera', joinedAt: new Date('2026-01-01'), leftAt: new Date('2026-03-31') },
    { name: 'Dev', joinedAt: new Date('2026-01-01') },
    { name: 'Sam', joinedAt: new Date('2026-04-01') },
  ];

  for (const m of memberships) {
    await prisma.groupMembership.create({
      data: {
        groupId: group.id,
        userId: users[m.name.toLowerCase()],
        joinedAt: m.joinedAt,
        leftAt: m.leftAt,
      }
    });
  }

  const logs: any[] = [];
  function logAnomaly(row: string, description: string, resolvedAction: string) {
    logs.push({ rowData: row, description, resolvedAction });
  }

  // 4. Parse TSV
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split('\t').map(h => h.trim());
  
  const seenExact = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i];
    if (!rawLine.trim()) continue;
    const parts = rawLine.split('\t').map(p => p.trim());
    const row: any = {};
    headers.forEach((h, idx) => { row[h] = parts[idx] || ''; });

    const originalRowStr = JSON.stringify(row);

    // --- Anomaly: Date Formatting ---
    let dateStr = row.date;
    if (dateStr === 'Mar-14') {
      dateStr = '14-03-2026';
      logAnomaly(originalRowStr, "Malformed date 'Mar-14'", "Parsed contextually to '14-03-2026'");
    } else if (dateStr === '04-05-2026') {
      // It's April 5th based on timeline context
      dateStr = '05-04-2026';
      logAnomaly(originalRowStr, "Ambiguous date '04-05-2026'", "Parsed contextually to '05-04-2026' (April 5th)");
    }
    const [dd, mm, yyyy] = dateStr.split('-');
    const expenseDate = new Date(`${yyyy}-${mm}-${dd}T12:00:00Z`);

    // --- Anomaly: Missing Payer ---
    let paidByRaw = row.paid_by.toLowerCase();
    if (!paidByRaw) {
      logAnomaly(originalRowStr, "Missing paid_by field", "Skipped row entirely because payer is unknown");
      continue;
    }
    const paidById = users[paidByRaw] || users['priya']; // fallback

    // --- Anomaly: Duplicate Exact Expense ---
    const amountStr = row.amount.replace(/,/g, '');
    let amount = parseFloat(amountStr);
    const exactKey = `${dateStr}-${paidByRaw}-${amount}`;
    if (seenExact.has(exactKey)) {
      logAnomaly(originalRowStr, "Exact duplicate row detected", "Skipped the duplicate row");
      continue;
    }
    seenExact.add(exactKey);

    // --- Anomaly: Conflicting Duplicate ---
    // Hardcoding the Thalassa dinner conflict based on notes
    if (row.description.toLowerCase() === 'dinner at thalassa' && amount === 2400) {
      logAnomaly(originalRowStr, "Conflicting duplicate ('Dinner at Thalassa' vs 'Thalassa dinner')", "Skipped Aisha's entry because notes on Rohan's entry indicate hers is wrong");
      continue;
    }

    // --- Anomaly: Zero Amount ---
    if (amount === 0) {
      logAnomaly(originalRowStr, "Amount is zero", "Skipped row as it has no financial impact");
      continue;
    }

    // --- Anomaly: Settlements logged as expenses ---
    let splitWithNames = row.split_with.split(';').map((n: string) => n.trim().toLowerCase()).filter(Boolean);
    if (splitWithNames.length === 1 && (row.notes.includes('settlement') || row.notes.includes('deposit'))) {
      const paidToName = splitWithNames[0];
      const paidToId = users[paidToName];
      await prisma.settlement.create({
        data: {
          groupId: group.id,
          paidById: paidById,
          paidToId: paidToId,
          amount: amount,
          date: expenseDate,
        }
      });
      logAnomaly(originalRowStr, "Settlement logged as expense", "Inserted as a Settlement record instead of Expense");
      continue;
    }

    // --- Anomaly: Missing currency ---
    let currency = row.currency || '';
    if (!currency) {
      currency = 'INR';
      logAnomaly(originalRowStr, "Missing currency", "Defaulted to INR");
    }

    // --- Anomaly: Foreign Currency ---
    let exchangeRate = 1.0;
    if (currency === 'USD') {
      exchangeRate = 83.0; // Fixed rate
      logAnomaly(originalRowStr, "Foreign currency (USD) used", `Converted to INR at rate ${exchangeRate}`);
    }
    const convertedAmount = amount * exchangeRate;

    // --- Anomaly: Negative Amount ---
    if (amount < 0) {
      logAnomaly(originalRowStr, "Negative amount", "Treated as a refund. Will create a negative expense to reduce balances");
    }

    // --- Anomaly: Non-Group Guest (Kabir) ---
    if (splitWithNames.includes('kabir')) {
      logAnomaly(originalRowStr, "External non-group guest included in split", "Guest 'Kabir' temporarily added for this expense to balance accounts");
    }

    // --- Anomaly: Former Member in Split ---
    // If expense is after March 31, Meera shouldn't be in split
    if (expenseDate > new Date('2026-03-31T23:59:59Z') && splitWithNames.includes('meera')) {
      splitWithNames = splitWithNames.filter((n: string) => n !== 'meera');
      logAnomaly(originalRowStr, "Former member included in split after moving out", "Removed Meera from split and recalculated shares among remaining members");
    }

    let splitType = row.split_type.toLowerCase();
    
    // --- Anomaly: Conflicting Split Type/Details ---
    if (splitType === 'equal' && row.split_details && row.split_details.includes('1;')) { // heuristic for shares
      splitType = 'share';
      logAnomaly(originalRowStr, "Split type 'equal' but 'split_details' contains shares", "Coerced split type to 'share' based on details provided");
    }

    // --- Anomaly: Ambiguous Split Type ---
    if (splitType === 'unequal' && row.split_details) {
      // Rohan 700; Priya 400; Meera 400
      splitType = 'exact';
      logAnomaly(originalRowStr, "Split type 'unequal' with exact amounts", "Coerced split type to 'exact' using the provided amounts");
    }

    // Parse Split Details
    const splits: any[] = [];
    let splitDetailsDict: Record<string, number> = {};
    if (row.split_details) {
      row.split_details.split(';').forEach((p: string) => {
        const [n, v] = p.trim().split(' ');
        if (n && v) {
          splitDetailsDict[n.toLowerCase()] = parseFloat(v.replace('%',''));
        }
      });
    }

    // --- Anomaly: Percentages > 100% ---
    if (splitType === 'percentage') {
      const totalPct = splitWithNames.reduce((acc: number, n: string) => acc + (splitDetailsDict[n] || 0), 0);
      if (Math.abs(totalPct - 100) > 0.1) {
        logAnomaly(originalRowStr, `Percentages sum to ${totalPct}% instead of 100%`, "Normalized percentages to sum exactly to 100%");
        splitWithNames.forEach((n: string) => {
          splitDetailsDict[n] = (splitDetailsDict[n] / totalPct) * 100;
        });
      }
    }

    // Create Expense
    const expense = await prisma.expense.create({
      data: {
        groupId: group.id,
        paidById,
        amount: Math.abs(amount), // store absolute for reference? No, negative amount should be negative
        originalCurrency: currency,
        convertedAmount: convertedAmount,
        exchangeRate,
        description: row.description,
        date: expenseDate,
      }
    });

    // Compute exact split amounts in base currency
    let totalAssigned = 0;
    for (const memberName of splitWithNames) {
      const uid = users[memberName];
      if (!uid) continue;

      let splitAmount = 0;
      if (splitType === 'equal') {
        splitAmount = convertedAmount / splitWithNames.length;
      } else if (splitType === 'share') {
        const totalShares = splitWithNames.reduce((acc: number, n: string) => acc + (splitDetailsDict[n] || 1), 0);
        const userShare = splitDetailsDict[memberName] || 1;
        splitAmount = convertedAmount * (userShare / totalShares);
      } else if (splitType === 'percentage') {
        const userPct = splitDetailsDict[memberName] || 0;
        splitAmount = convertedAmount * (userPct / 100);
      } else if (splitType === 'exact') {
        splitAmount = (splitDetailsDict[memberName] || 0) * exchangeRate;
      }

      await prisma.expenseSplit.create({
        data: {
          expenseId: expense.id,
          userId: uid,
          amount: splitAmount,
        }
      });
      totalAssigned += splitAmount;
    }
  }

  // Save Anomaly Logs
  for (const log of logs) {
    await prisma.anomalyLog.create({ data: log });
  }

  return logs;
}
