import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Comment } from './Index';

const Comments: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      console.log('Fetching all comments...');
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
        return;
      }

      console.log('Comments fetched:', data);
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 relative overflow-hidden">
      {/* Soft background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-purple-900/50 to-slate-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-500/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="bg-indigo-500/15 border-indigo-400/30 text-indigo-200 hover:bg-indigo-400/20 backdrop-blur-md shadow-lg shadow-indigo-500/15">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Bubbles
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            All Confessions
          </h1>
        </div>

        {/* Comments Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-400/60 shadow-lg shadow-indigo-400/30"></div>
          </div>
        ) : (
          <div className="bg-slate-800/30 backdrop-blur-xl border border-indigo-500/20 rounded-xl overflow-hidden shadow-2xl shadow-indigo-500/10">
            <Table>
              <TableHeader>
                <TableRow className="border-indigo-500/20 hover:bg-indigo-500/5 bg-gradient-to-r from-indigo-900/20 to-purple-900/20">
                  <TableHead className="text-indigo-200 font-semibold">Title</TableHead>
                  <TableHead className="text-indigo-200 font-semibold">Content</TableHead>
                  <TableHead className="text-indigo-200 font-semibold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-indigo-300/60 py-8">
                      No confessions yet. Be the first to share!
                    </TableCell>
                  </TableRow>
                ) : (
                  comments.map((comment) => (
                    <TableRow key={comment.id} className="border-indigo-500/15 hover:bg-gradient-to-r hover:from-indigo-500/5 hover:to-purple-500/5 transition-all duration-300 backdrop-blur-sm">
                      <TableCell className="text-white font-medium max-w-xs">
                        <div className="truncate drop-shadow-sm" title={comment.title}>
                          {comment.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-indigo-100/80 max-w-md">
                        <div className="line-clamp-3 drop-shadow-sm" title={comment.content}>
                          {comment.content}
                        </div>
                      </TableCell>
                      <TableCell className="text-indigo-300/70 whitespace-nowrap">
                        {formatDate(comment.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Stats */}
        {!loading && comments.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-indigo-300/70">
              Total confessions: <span className="text-indigo-400 font-semibold">{comments.length}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
