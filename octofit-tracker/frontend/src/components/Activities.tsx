import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export default function Activities() {
  const [activities, setActivities] = useState<Array<{ type: string; minutes?: number; points?: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ activities: typeof activities }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points." loading={loading} error={error} isEmpty={activities.length === 0} emptyText="No activities">
      <ul>{activities.map((activity, index) => <li key={index}>{activity.type} - {activity.minutes ?? 0} minutes ({activity.points ?? 0} points)</li>)}</ul>
    </CapabilityCard>
  );
}
