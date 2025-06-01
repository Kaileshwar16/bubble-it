
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReplyFormProps {
  parentId: string;
  onReplyAdded: () => void;
}

const ReplyForm: React.FC<ReplyFormProps> = ({ parentId, onReplyAdded }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{ 
          title: 'Reply', 
          content: content.trim(),
          parent_id: parentId
        }]);

      if (error) {
        console.error('Error adding reply:', error);
        toast({
          title: "Error",
          description: "Failed to add reply",
          variant: "destructive",
        });
        return;
      }

      setContent('');
      onReplyAdded();
      toast({
        title: "Success",
        description: "Reply added successfully",
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4 border-t border-indigo-500/20 pt-4">
      <div>
        <label htmlFor="reply-content" className="block text-sm font-medium text-indigo-200 mb-2">
          Add a reply
        </label>
        <textarea
          id="reply-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="w-full px-3 py-2 bg-slate-800/40 border border-indigo-500/20 rounded-lg text-white placeholder-indigo-400/50 focus:border-indigo-400/60 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 resize-none backdrop-blur-sm shadow-inner"
          maxLength={500}
          required
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          size="sm"
          className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 hover:from-indigo-400/90 hover:to-purple-400/90 shadow-lg shadow-indigo-500/20 backdrop-blur-sm"
        >
          {isSubmitting ? 'Adding...' : 'Reply'}
        </Button>
      </div>
    </form>
  );
};

export default ReplyForm;
