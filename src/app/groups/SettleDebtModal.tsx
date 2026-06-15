"use client";
import { useState } from 'react';

export default function SettleDebtModal({ groupId, users }: { groupId: string, users: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [paidToId, setPaidToId] = useState(users[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          paidToId,
          amount: parseFloat(amount)
        })
      });
      if (res.ok) {
        setIsOpen(false);
        window.location.reload();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error creating settlement');
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>Record Settlement</button>
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Record Settlement</h2>
            <p className="text-muted" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>Record a payment you made to someone else.</p>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Paid To</label>
                <select className="input-field" value={paidToId} onChange={e => setPaidToId(e.target.value)} required>
                  <option value="" disabled>Select member...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label>Amount Paid (INR)</label>
                <input type="number" step="0.01" required className="input-field" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Record Payment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
