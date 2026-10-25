import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useProject } from '../../context/ProjectContext';
import { useToast } from '../../context/ToastContext';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { Send, AtSign, MessageSquare } from 'lucide-react';

const CommentSection = ({ ticketId }) => {
  const { users } = useProject();
  const { addToast } = useToast();

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/comments?ticket=${ticketId}`);
      setComments(res.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId) {
      fetchComments();
    }
  }, [ticketId]);

  const handleTextChange = (e) => {
    const val = e.target.value;
    setContent(val);

    // Detect if last character typed is @ or actively typing mention
    const lastAtIndex = val.lastIndexOf('@');
    if (lastAtIndex !== -1 && lastAtIndex >= val.length - 15) {
      const query = val.slice(lastAtIndex + 1);
      if (!query.includes(' ')) {
        setMentionFilter(query);
        setShowMentionMenu(true);
        return;
      }
    }
    setShowMentionMenu(false);
  };

  const handleSelectMention = (user) => {
    const lastAtIndex = content.lastIndexOf('@');
    const prefix = content.slice(0, lastAtIndex);
    const newContent = `${prefix}@${user.email} `;
    setContent(newContent);
    setShowMentionMenu(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSubmitting(true);
      await axiosClient.post('/comments', {
        ticketId,
        content
      });

      addToast('Comment added! Email & @mention notifications sent.', 'success');
      setContent('');
      await fetchComments();
    } catch (err) {
      addToast('Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMentionUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(mentionFilter.toLowerCase()) ||
      u.email.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4 mt-6 border-t border-slate-200 pt-6">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
        <MessageSquare className="w-4 h-4 text-blue-600" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment Input Box */}
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
        <div className="relative">
          <textarea
            rows={3}
            value={content}
            onChange={handleTextChange}
            placeholder="Write a comment... (Type '@' to mention team members)"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white transition-colors"
          />

          {/* @Mention Autocomplete Popover */}
          {showMentionMenu && filteredMentionUsers.length > 0 && (
            <div className="absolute left-0 bottom-full mb-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-30 max-h-48 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center gap-1">
                <AtSign className="w-3 h-3 text-blue-500" /> Mention Team Member
              </div>
              {filteredMentionUsers.map((u) => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleSelectMention(u)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 flex items-center gap-2 transition-colors"
                >
                  <Avatar user={u} size="xs" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-slate-800 truncate">{u.name}</span>
                    <span className="text-[10px] text-slate-400 truncate">{u.email}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <AtSign className="w-3 h-3 text-blue-500" /> Type @ to notify colleagues via email
          </span>
          <Button variant="primary" size="sm" icon={Send} isLoading={submitting} type="submit">
            Comment
          </Button>
        </div>
      </form>

      {/* Comment List */}
      <div className="flex flex-col gap-3 mt-2">
        {comments.map((c) => (
          <div key={c._id} className="flex gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <Avatar user={c.author} size="sm" />
            <div className="flex flex-col flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{c.author?.name}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-700 mt-1 whitespace-pre-wrap leading-relaxed">
                {c.content}
              </p>
            </div>
          </div>
        ))}

        {comments.length === 0 && !loading && (
          <p className="text-xs text-slate-400 italic text-center py-2">No comments yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
