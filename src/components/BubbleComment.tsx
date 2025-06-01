
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import type { Comment } from '../pages/Index';
import ReplyForm from './ReplyForm';

interface BubblePosition {
  x: number;
  y: number;
  scale: number;
  vx: number;
  vy: number;
  radius: number;
}

interface BubbleCommentProps {
  comment: Comment;
  position: BubblePosition;
  onClick: () => void;
  animationDelay: number;
}

const BubbleComment: React.FC<BubbleCommentProps> = ({ 
  comment, 
  position, 
  onClick,
  animationDelay 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replies, setReplies] = useState<Comment[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleBubbleClick = () => {
    setIsOpen(true);
    onClick();
  };

  const fetchReplies = async () => {
    if (!isOpen) return;
    
    setLoadingReplies(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        return;
      }

      setReplies(data || []);
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReplies();
    }
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const bubbleStyle = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: `translate(-50%, -50%) scale(${position.scale})`,
    transition: 'none'
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div
          className="absolute cursor-pointer group"
          style={bubbleStyle}
          onClick={handleBubbleClick}
        >
          <div className="relative">
            {/* Glow effects */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-xl group-hover:blur-2xl group-hover:from-indigo-300/25 group-hover:to-purple-300/25 transition-all duration-500"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/15 to-pink-400/15 blur-2xl group-hover:blur-3xl animate-pulse"></div>
            
            {/* Main bubble */}
            <div className="relative bg-gradient-to-br from-indigo-400/30 to-purple-500/30 backdrop-blur-md border border-indigo-300/20 rounded-full p-6 min-w-[120px] max-w-[200px] group-hover:scale-110 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-400/25 group-hover:border-indigo-200/30">
              <div className="absolute top-2 left-2 w-6 h-6 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm"></div>
              
              <p className="text-white text-sm font-medium text-center truncate drop-shadow-md relative z-10">
                {comment.title}
              </p>
              
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-indigo-400/80 to-purple-400/80 rounded-full animate-pulse shadow-lg shadow-indigo-400/30"></div>
              <div className="absolute top-1 right-3 w-1 h-1 bg-purple-300/80 rounded-full animate-ping opacity-60"></div>
            </div>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="bg-slate-900/90 backdrop-blur-xl border-indigo-500/20 text-white max-w-2xl shadow-2xl shadow-indigo-500/15 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-300 to-purple-400 bg-clip-text text-transparent">
            {comment.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-slate-800/50 rounded-lg p-4 border border-indigo-500/15 backdrop-blur-sm shadow-inner">
            <p className="text-indigo-50 leading-relaxed whitespace-pre-wrap drop-shadow-sm">
              {comment.content}
            </p>
          </div>
          
          <div className="flex justify-between items-center text-sm text-indigo-300/70">
            <span>Anonymous confession</span>
            <span>{formatDate(comment.created_at)}</span>
          </div>

          {/* Replies Section */}
          <div className="border-t border-indigo-500/20 pt-4">
            <h3 className="text-lg font-semibold text-indigo-200 mb-3">
              Replies ({replies.length})
            </h3>
            
            {loadingReplies ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400/60"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-slate-700/30 rounded-lg p-3 border border-indigo-500/10">
                    <p className="text-indigo-100 text-sm leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>
                    <div className="text-xs text-indigo-300/60 mt-2">
                      {formatDate(reply.created_at)}
                    </div>
                  </div>
                ))}
                {replies.length === 0 && (
                  <p className="text-indigo-300/60 text-center py-4">
                    No replies yet. Be the first to comment!
                  </p>
                )}
              </div>
            )}

            {/* Reply Form */}
            <ReplyForm 
              parentId={comment.id} 
              onReplyAdded={fetchReplies}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BubbleComment;
