"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email && password) {
      // Dummy check since this is a simplified assignment, we check name instead of email
      // We will extract the name from the email prefix (e.g. "aisha@example.com" -> "Aisha")
      const name = email.split('@')[0];
      
      const res = await fetch('/api/auth', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        router.push('/groups');
        router.refresh();
      } else {
        setError('User not found in the database. (Try aisha@example.com, rohan@...)');
      }
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', marginTop: '4rem' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Sign In</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input 
            type="email" 
            className="input-field" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input 
            type="password" 
            className="input-field" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          Login
        </button>
        {error && <div style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  );
}
