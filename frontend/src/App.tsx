import { useEffect, useState } from 'react';
import { getHealth } from './api/health';

export default function App() {
  const [status, setStatus] = useState<string>('loading...');

  useEffect(() => {
    getHealth().then((res) => {
      setStatus(res.status);
    });
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Estimate App Home</h1>
      <p>API Status: {status}</p>
    </div>
  );
}