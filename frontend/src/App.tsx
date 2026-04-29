import { useEffect, useState } from 'react';
import { fetchEstimates } from './api/estimateApi';
import { EstimateForm } from './components/EstimateForm';
import { EstimateList } from './components/EstimateList';
import type { Estimate } from './types/estimate';

export default function App() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadEstimates = async (): Promise<void> => {
    setLoading(true);

    try {
      const data = await fetchEstimates();
      setEstimates(data);
      setErrorMessage('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '見積一覧の取得に失敗しました';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadEstimates();
  }, []);

  return (
    <main className="page">
      <h1>見積アプリ</h1>
      <EstimateForm onCreated={loadEstimates} />
      <EstimateList
        estimates={estimates}
        onReload={loadEstimates}
        loading={loading}
        errorMessage={errorMessage}
      />
    </main>
  );
}