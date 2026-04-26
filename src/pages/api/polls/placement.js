// pages/api/polls/placement.js
export default async function handler(req, res) {
  const { location, locationId } = req.query;
  
  const { data, error } = await supabase
    .from('poll_placements')
    .select('poll_id')
    .eq('placement_type', location)
    .eq('is_active', true);
  
  if (locationId) {
    const { data: locationData } = await supabase
      .from('poll_placements')
      .select('poll_id')
      .eq('location_id', locationId)
      .eq('is_active', true);
    
    if (locationData?.length) {
      return res.json({ pollId: locationData[0].poll_id });
    }
  }
  
  const activePlacement = data?.find(p => !p.location_id);
  res.json({ pollId: activePlacement?.poll_id || null });
}