export default function Home() {
  return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1>Welcome to SplitPro</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
        A premium shared expenses manager.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <a href="/groups" className="btn btn-primary">
          View Groups
        </a>
        <a href="/import" className="btn btn-secondary">
          Import Legacy Data
        </a>
      </div>
    </div>
  );
}
