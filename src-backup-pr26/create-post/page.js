import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Save, Calendar, Send, Eye, Loader2 } from 'lucide-react';

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 min-h-[500px] animate-pulse">
      <div className="h-full bg-gray-100 rounded-lg"></div>
    </div>
  ),
});

export default function CreatePost() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSaveDraft = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Draft saved successfully');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Post published successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    toast.success('Preview mode');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Buttons */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl p-6 mb-8 sticky top-4 z-50 border border-white/20"
        >
          <div className="flex flex-wrap gap-3 justify-end">
            <button
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Draft
            </button>
            <button
              onClick={() => toast.info('Schedule feature coming soon')}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold hover:shadow-xl transition-all"
            >
              <Calendar className="w-5 h-5" />
              Schedule
            </button>
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-xl transition-all"
            >
              <Eye className="w-5 h-5" />
              Preview
            </button>
            <button
              onClick={handlePublish}
              disabled={isLoading}
              className="flex items-center gap-2 px-8 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:shadow-2xl transition-all disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Publish
            </button>
          </div>
        </motion.div>

        {/* Title Input */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a captivating title..."
            className="w-full text-5xl md:text-6xl lg:text-7xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-gray-300 text-center"
          />
        </motion.div>

        {/* Editor */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <Editor content={content} onChange={setContent} />
        </motion.div>
      </div>
    </div>
  );
}