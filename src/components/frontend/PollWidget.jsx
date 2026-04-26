// src/components/frontend/PollWidget.jsx
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import { BarChart3, Share2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function PollWidget({ pollId, placement = 'embed', className = '' }) {
  const [poll, setPoll] = useState(null);
  const [options, setOptions] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchPoll();
    checkAuth();
  }, [pollId]);

  const checkAuth = async () => {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    if (data.authenticated) setUser(data.user);
  };

  const fetchPoll = async () => {
    setLoading(true);
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();
      
      if (pollError) throw pollError;
      setPoll(pollData);
      
      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('order_position', { ascending: true });
      
      if (optionsError) throw optionsError;
      setOptions(optionsData);
      
      // Check if user has already voted
      if (user) {
        const { data: voteData } = await supabase
          .from('poll_votes')
          .select('option_id')
          .eq('poll_id', pollId)
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (voteData) {
          setHasVoted(true);
          setUserVote(voteData.option_id);
          if (pollData.show_results_immediately) setShowResults(true);
        }
      }
      
      if (pollData.show_results_immediately) setShowResults(true);
      
      // Track view
      await supabase.from('poll_analytics').insert({
        poll_id: pollId,
        event_type: 'view',
        page_url: window.location.href,
        device_info: { userAgent: navigator.userAgent }
      });
      
    } catch (error) {
      console.error('Error fetching poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (selectedOptions.length === 0) {
      toast.error('Please select an option');
      return;
    }
    
    if (poll.require_login_to_vote && !user) {
      toast.error('Please sign in to vote');
      return;
    }
    
    setVoting(true);
    
    try {
      const votesToInsert = selectedOptions.map(optId => ({
        poll_id: pollId,
        option_id: optId,
        user_id: user?.id || null,
        ip_address: null,
        user_agent: navigator.userAgent,
        device_info: { platform: navigator.platform }
      }));
      
      const { error } = await supabase.from('poll_votes').insert(votesToInsert);
      if (error) throw error;
      
      setHasVoted(true);
      setUserVote(selectedOptions[0]);
      if (poll.show_results_immediately) setShowResults(true);
      
      // Refresh poll data
      await fetchPoll();
      toast.success('Vote submitted successfully!');
      
      // Track vote event
      await supabase.from('poll_analytics').insert({
        poll_id: pollId,
        event_type: 'vote',
        user_id: user?.id
      });
      
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to submit vote');
    } finally {
      setVoting(false);
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: poll.title, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied!');
    }
    
    await supabase.from('polls').update({ share_count: (poll.share_count || 0) + 1 }).eq('id', pollId);
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  if (!poll) return null;

  const totalVotes = poll.total_votes || 0;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{poll.title}</h3>
            {poll.description && <p className="text-gray-500 mt-1 text-sm">{poll.description}</p>}
          </div>
          <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full transition">
            <Share2 size={18} className="text-gray-500" />
          </button>
        </div>
        
        {/* Options */}
        {!hasVoted || !showResults ? (
          <div className="space-y-3">
            {options.map((option) => (
              <label key={option.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 cursor-pointer transition">
                <input
                  type={poll.allow_multiple_votes ? 'checkbox' : 'radio'}
                  name={`poll-${poll.id}`}
                  value={option.id}
                  onChange={(e) => {
                    if (poll.allow_multiple_votes) {
                      if (e.target.checked) {
                        setSelectedOptions([...selectedOptions, option.id]);
                      } else {
                        setSelectedOptions(selectedOptions.filter(id => id !== option.id));
                      }
                    } else {
                      setSelectedOptions([option.id]);
                    }
                  }}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <div className="flex-1">
                  {option.image_url && (
                    <img src={option.image_url} alt={option.text} className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}
                  <span className="text-gray-800">{option.text}</span>
                </div>
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {options.map((option) => {
              const percentage = totalVotes > 0 ? (option.vote_count / totalVotes) * 100 : 0;
              const isUserVote = userVote === option.id;
              
              return (
                <div key={option.id} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {option.text}
                      {isUserVote && <CheckCircle size={14} className="text-green-500" />}
                    </span>
                    <span className="text-sm text-gray-500">{percentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-10 bg-gray-100 rounded-lg overflow-hidden">
                    <div 
                      className={`h-full flex items-center px-3 text-sm font-medium transition-all duration-500 ${
                        isUserVote ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {option.vote_count.toLocaleString()} votes
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="text-center text-xs text-gray-400 mt-2">{totalVotes.toLocaleString()} total votes</div>
          </div>
        )}
        
        {/* Actions */}
        {!hasVoted && (
          <button
            onClick={handleVote}
            disabled={voting || selectedOptions.length === 0}
            className="w-full mt-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {voting ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Submit Vote'}
          </button>
        )}
        
        {hasVoted && !poll.show_results_immediately && (
          <button
            onClick={() => setShowResults(true)}
            className="w-full mt-4 py-3 border border-purple-600 text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition"
          >
            <BarChart3 size={16} className="inline mr-2" /> View Results
          </button>
        )}
      </div>
    </div>
  );
}