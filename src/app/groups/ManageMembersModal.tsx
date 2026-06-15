"use client";
import { useState } from 'react';

export default function ManageMembersModal({ groupId, memberships, allUsers }: { groupId: string, memberships: any[], allUsers: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Active members have no leftAt date
  const activeMembers = memberships.filter(m => !m.leftAt);
  const activeMemberIds = activeMembers.map(m => m.userId);
  
  const availableUsers = allUsers.filter(u => !activeMemberIds.includes(u.id));

  const [selectedUserId, setSelectedUserId] = useState(availableUsers[0]?.id || '');

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUserId })
      });
      if (res.ok) window.location.reload();
      else alert('Error adding member');
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member? They will not be billed for future expenses.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) window.location.reload();
      else alert('Error removing member');
    } catch (err) {
      alert('Network error');
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>Manage Members</button>
      
      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>Manage Group Members</h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Active Members</h4>
              <ul style={{ listStyle: 'none' }}>
                {activeMembers.map(m => (
                  <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span>{m.user.name}</span>
                    <button 
                      onClick={() => handleRemoveMember(m.userId)} 
                      disabled={loading}
                      style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Add New Member</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select className="input-field" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                  {availableUsers.length === 0 && <option value="" disabled>No more users available</option>}
                  {availableUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <button className="btn btn-primary" onClick={handleAddMember} disabled={loading || availableUsers.length === 0}>Add</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
