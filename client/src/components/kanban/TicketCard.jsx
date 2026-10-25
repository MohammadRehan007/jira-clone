import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { TypeBadge, PriorityBadge } from '../common/Badge';
import Avatar from '../common/Avatar';
import { MessageSquare, Calendar, Paperclip } from 'lucide-react';

const TicketCard = ({ ticket, index, onClick }) => {
  return (
    <Draggable draggableId={ticket._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(ticket)}
          className={`ticket-card bg-white rounded-lg p-3.5 border border-slate-200 shadow-xs mb-2.5 cursor-pointer select-none transition-all ${
            snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 scale-102 rotate-1 z-50' : 'hover:border-blue-400'
          }`}
        >
          {/* Top Row: Type & Key */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TypeBadge type={ticket.type} />
              <span className="text-xs font-bold text-slate-500 hover:text-blue-600">
                {ticket.ticketKey}
              </span>
            </div>
            <PriorityBadge priority={ticket.priority} />
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug mb-3">
            {ticket.title}
          </h4>

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {ticket.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer: Story points & Assignee */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              {ticket.storyPoints && (
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-[11px] font-bold text-slate-700">
                  {ticket.storyPoints}
                </span>
              )}
              {ticket.dueDate && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(ticket.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
              )}
              {ticket.attachments?.length > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400" title={`${ticket.attachments.length} attachment(s)`}>
                  <Paperclip className="w-3 h-3 text-slate-500" />
                  {ticket.attachments.length}
                </span>
              )}
            </div>
            <Avatar user={ticket.assignee} size="xs" />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TicketCard;
