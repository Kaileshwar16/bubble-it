import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import FloatingBubbles from '../components/FloatingBubbles';
import CommentForm from '../components/CommentForm';

export interface Comment {
  id: string;
  title: string;
  content: string;
  created_at: string;
  parent_id: string | null;
}

const Index: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [confessionCount, setConfessionCount] = useState<number | null>(null);
  const [bubbleLimit, setBubbleLimit] = useState(25);
  const { toast } = useToast();

  const fetchTopLevelComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .is('parent_id', null) // ✅ Only parent comments
        .order('created_at', { ascending: false })
        .limit(100); 

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
        return;
      }

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (title: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ title, content }])
        .select()
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add comment",
          variant: "destructive",
        });
        return;
      }

      setComments(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Your confession has been shared anonymously",
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const fetchConfessionCount = async () => {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true });

    if (!error) setConfessionCount(count ?? 0);
  };

  useEffect(() => {
    fetchTopLevelComments();
    fetchConfessionCount();
  }, []);

  useEffect(() => {
    const updateBubbleLimit = () => {
      setBubbleLimit(window.innerWidth < 768 ? 10 : 25); // ✅ Adjust based on screen
    };

    updateBubbleLimit();
    window.addEventListener('resize', updateBubbleLimit);
    return () => window.removeEventListener('resize', updateBubbleLimit);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-900/50 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-500/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366F1' fill-opacity='0.05'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='37' cy='17' r='1'/%3E%3Ccircle cx='17' cy='37' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-indigo-400/10 to-purple-500/10 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-purple-500/8 to-pink-400/8 rounded-full blur-2xl animate-pulse delay-1000"></div>

      {/* Header */}
      <div className="relative z-10 text-center pt-8 pb-4">
        <div className="flex justify-end mb-4 px-8">
          <Link to="/comments">
            <Button variant="outline" className="bg-indigo-500/15 border-indigo-400/30 text-indigo-200 hover:bg-indigo-400/20 hover:border-indigo-300/40 backdrop-blur-md shadow-lg shadow-indigo-500/15 transition-all duration-300">
              <MessageSquare className="w-4 h-4 mr-2" />
              View All Comments
            </Button>
          </Link>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent mb-2 drop-shadow-lg">
          SRM Confessions
        </h1>
        <p className="text-indigo-200/70 text-lg drop-shadow-sm">
          {confessionCount !== null
            ? `${confessionCount} confessions shared`
            : 'Loading confessions count...'}
        </p>
        <p className="text-indigo-200/70 text-lg drop-shadow-sm">Share your thoughts anonymously in floating bubbles</p>
      </div>

      {/* Comment Form */}
      <CommentForm onSubmit={addComment} />

      {/* Floating Bubbles */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400/60 shadow-lg shadow-indigo-400/30"></div>
        </div>
      ) : (
        <FloatingBubbles comments={comments.slice(0, bubbleLimit)} />
      )}
    </div>
  );
};

export default Index;
