"use client";
import { useState } from 'react';

export default function AddExpenseModal({ groupId, users }: { groupId: string, users: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [splitDetails, setSplitDetails] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Default to everyone equally if no details explicitly set for equal
    let finalDetails = { ...splitDetails };
    if (splitType === 'equal' && Object.keys(finalDetails).length === 0) {
      users.forEach(u => finalDetails[u.id] = 1);
    }

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId,
          description,
          amount: parseFloat(amount),
          splitType,
          splitDetails: finalDetails
        })
      });
      if (res.ok) {
        setIsOpen(false);
        window.location.reload(); // simple reload to update data
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (err) {
      alert('Error creating expense');
    }
    setLoading(false);
  };

  const handleSplitChange = (userId: string, val: string) => {
    const num = parseFloat(val) || 0;
    setSplitDetails(prev => ({ ...prev, [userId]: num }));
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setIsOpen(true)}>+ Add Expense</button>
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Manual Expense</h2>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Description</label>
                <input type="text" required className="input-field" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Amount (INR)</label>
                <input type="number" step="0.01" required className="input-field" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div className="input-group">
                <label>Split Type</label>
                <select className="input-field" value={splitType} onChange={e => setSplitType(e.target.value)}>
                  <option value="equal">Equal</option>
                  <option value="exact">Exact Amounts</option>
                  <option value="percentage">Percentage</option>
                  <option value="share">Shares</option>
                </select>
              </div>

              {splitType !== 'equal' && (
                <div style={{ marginBottom: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Split Details</label>
                  {users.map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span>{u.name}</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        className="input-field" 
                        style={{ width: '100px', padding: '0.5rem' }} 
                        placeholder={splitType === 'percentage' ? '%' : splitType === 'share' ? 'shares' : '₹'}
                        onChange={e => handleSplitChange(u.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
