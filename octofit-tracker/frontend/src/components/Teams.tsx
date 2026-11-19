import { useEffect, useState } from 'react';
import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export default function Teams() {
  const [teams, setTeams] = useState<Array<{ name: string; mascot?: string; members?: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    getJson<{ teams: typeof teams }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoading(false));
  }, []);
  return (
    <CapabilityCard title="Teams" description="Manage teams and members." loading={loading} error={error} isEmpty={teams.length === 0} emptyText="No teams">
      <ul>{teams.map((team, index) => <li key={index}>{team.name}{team.mascot ? ` - ${team.mascot}` : ''}</li>)}</ul>
    </CapabilityCard>
  );
}
