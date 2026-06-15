import { prisma } from '@/lib/prisma';
import { getGroupBalances } from '@/lib/balances';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const group = await prisma.group.findFirst();

  if (!group) {
    return (
      <div className="glass-panel text-center">
        <h2>No Groups Found</h2>
        <p className="text-muted">You haven't imported any data yet.</p>
        <Link href="/import" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Import</Link>
      </div>
    );
  }

  const { balances, simplifiedDebts } = await getGroupBalances(group.id);

  const expenses = await prisma.expense.findMany({
    where: { groupId: group.id },
    include: {
      paidBy: true,
      splits: {
        include: { user: true }
      }
    },
    orderBy: { date: 'desc' }
  });

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem' }}>{group.name}</h1>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Shared Expenses Dashboard</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="glass-panel">
          <h3>Aisha's View: "Who pays whom"</h3>
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Simplified debts calculation to minimize transactions.</p>
          {simplifiedDebts.length === 0 ? (
            <p>All settled up!</p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {simplifiedDebts.map((debt, i) => (
                <li key={i} style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <strong>{debt.fromName}</strong> owes <strong>{debt.toName}</strong>: <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>₹{debt.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-panel">
          <h3>Member Balances</h3>
          <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Net balance summary for each member.</p>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '0.5rem' }}>Name</th>
                <th style={{ padding: '0.5rem' }}>Paid</th>
                <th style={{ padding: '0.5rem' }}>Owed</th>
                <th style={{ padding: '0.5rem' }}>Net Balance</th>
              </tr>
            </thead>
            <tbody>
              {balances.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem' }}>{b.name}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--accent)' }}>₹{b.paid.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', color: 'var(--danger)' }}>₹{b.owed.toFixed(2)}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 'bold', color: b.balance > 0 ? 'var(--accent)' : (b.balance < 0 ? 'var(--danger)' : 'inherit') }}>
                    {b.balance > 0 ? '+' : ''}{b.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-panel">
        <h3>Rohan's View: "No magic numbers"</h3>
        <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Full transparency into every expense and how it was split.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {expenses.map(exp => (
            <div key={exp.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong>{exp.description}</strong>
                <span className="badge badge-warning">{exp.date.toLocaleDateString()}</span>
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                Paid by <strong>{exp.paidBy.name}</strong>: ₹{exp.convertedAmount.toFixed(2)} {exp.originalCurrency !== 'INR' && `(Original: ${exp.amount} ${exp.originalCurrency})`}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Splits: {exp.splits.map(s => `${s.user.name} (₹${s.amount.toFixed(2)})`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
