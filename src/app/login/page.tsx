"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSignUp) {
      if (name && email && password) {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });
        if (res.ok) {
          router.push('/groups');
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.error || 'Signup failed.');
        }
      }
    } else {
      if (email && password) {
        const userName = email.split('@')[0];
        const res = await fetch('/api/auth', {
          method: 'POST',
          body: JSON.stringify({ name: userName })
        });
        if (res.ok) {
          router.push('/groups');
          router.refresh();
        } else {
          setError('User not found. Try aisha@example.com or sign up!');
        }
      }
    }
  };

  return (
    <div className="glass-panel" style={{ maxWidth: '400px', margin: '0 auto', marginTop: '4rem' }}>
      <div style={{ display: 'flex', marginBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setIsSignUp(false)}
          style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', color: !isSignUp ? 'var(--primary)' : 'var(--text-muted)', borderBottom: !isSignUp ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Login
        </button>
        <button 
          onClick={() => setIsSignUp(true)}
          style={{ flex: 1, padding: '1rem', background: 'none', border: 'none', color: isSignUp ? 'var(--primary)' : 'var(--text-muted)', borderBottom: isSignUp ? '2px solid var(--primary)' : 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Sign Up
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" className="input-field" required={isSignUp} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        )}
        <div className="input-group">
          <label>Email</label>
          <input type="email" className="input-field" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" className="input-field" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        
        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
          {isSignUp ? 'Create Account' : 'Login'}
        </button>
        
        {error && <div style={{ marginTop: '1rem', color: 'var(--danger)', fontSize: '0.9rem', textAlign: 'center' }}>{error}</div>}
      </form>
    </div>
  );
}
