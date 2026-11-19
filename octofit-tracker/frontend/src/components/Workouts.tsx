import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export default function Workouts() {
  const [suggestions, setSuggestions] = useState<Array<{ title: string; reason?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ suggestions: typeof suggestions }>('/api/workouts/suggestions/mona%40example.com')
      .then((data) => setSuggestions(data.suggestions))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns." loading={loading} error={error} isEmpty={suggestions.length === 0} emptyText="No workout suggestions">
      <ul>{suggestions.map((workout, index) => <li key={index}><strong>{workout.title}</strong>{workout.reason ? ` - ${workout.reason}` : ''}</li>)}</ul>
    </CapabilityCard>
  );
}
