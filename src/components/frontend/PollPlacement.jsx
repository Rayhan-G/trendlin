// src/components/frontend/PollPlacement.jsx
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const PollWidget = dynamic(() => import('./PollWidget'), { ssr: false });

export default function PollPlacement({ location, locationId, className = '' }) {
  const [pollId, setPollId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPollPlacement();
  }, [location, locationId]);

  const fetchPollPlacement = async () => {
    try {
      const res = await fetch(`/api/polls/placement?location=${location}&locationId=${locationId || ''}`);
      const data = await res.json();
      if (data.pollId) setPollId(data.pollId);
    } catch (error) {
      console.error('Error fetching poll placement:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !pollId) return null;

  return <PollWidget pollId={pollId} placement={location} className={className} />;
}