import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Array<{ teamName: string; totalPoints: number; rank: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ leaderboard: typeof leaderboard }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals." loading={loading} error={error} isEmpty={leaderboard.length === 0} emptyText="No leaderboard rankings">
      <ol>{leaderboard.map((entry) => <li key={entry.teamName}>{entry.teamName}: {entry.totalPoints} points</li>)}</ol>
    </CapabilityCard>
  );
}
