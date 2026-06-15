"use client";
import { useState } from 'react';

export default function ImportPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/import', { method: 'POST', body: JSON.stringify({}) });
      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="glass-panel">
      <h2>Import Legacy CSV</h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        Click below to ingest <code>expenses_export.csv</code>. The system will detect anomalies and enforce policies automatically.
      </p>

      <button className="btn btn-primary" onClick={handleImport} disabled={loading}>
        {loading ? 'Importing...' : 'Run Import Process'}
      </button>

      {error && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', borderRadius: 'var(--radius-md)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {logs && (
        <div style={{ marginTop: '3rem' }} className="animate-fade-in">
          <h3>Import Report (Anomaly Log)</h3>
          <p style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
            Found {logs.length} anomalies during ingestion.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Description</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Action Taken</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Raw Data Segment</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--warning)' }}>{log.description}</td>
                    <td style={{ padding: '1rem', color: 'var(--accent)' }}>{log.resolvedAction}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.rowData}>
                      {log.rowData}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
