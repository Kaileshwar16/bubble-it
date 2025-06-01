import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (title: string, content: string) => Promise<void>;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(title.trim(), content.trim());
      setTitle('');
      setContent('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-20">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="rounded-full w-16 h-16 bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-400/90 hover:to-purple-400/90 shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-400/35 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-indigo-400/20"
          >
            <Plus className="h-8 w-8 drop-shadow-lg" />
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-slate-900/85 backdrop-blur-xl border-indigo-500/20 text-white max-w-md shadow-2xl shadow-indigo-500/15">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Share Your Confession
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-indigo-200 mb-2">
                Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your confession a title..."
                className="w-full px-3 py-2 bg-slate-800/40 border border-indigo-500/20 rounded-lg text-white placeholder-indigo-400/50 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 backdrop-blur-sm shadow-inner"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-indigo-200 mb-2">
                Your Confession
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts anonymously..."
                rows={4}
                className="w-full px-3 py-2 bg-slate-800/40 border border-indigo-500/20 rounded-lg text-white placeholder-indigo-400/50 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none backdrop-blur-sm shadow-inner"
                maxLength={1000}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-indigo-600/40 text-indigo-200 hover:bg-slate-800/40 backdrop-blur-sm"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !title.trim() || !content.trim()}
                className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-400/90 hover:to-purple-400/90 shadow-lg shadow-indigo-500/20 backdrop-blur-sm"
              >
                {isSubmitting ? 'Sharing...' : 'Share Anonymously'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentForm;
