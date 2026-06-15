"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Dummy login module for the requirement
    if (email && password) {
      document.cookie = `auth=true; path=/`;
      router.push('/');
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
      </form>
    </div>
  );
}
