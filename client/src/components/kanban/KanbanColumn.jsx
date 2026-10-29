import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TicketCard from './TicketCard';

const KanbanColumn = ({ status, title, tickets = [], onCardClick, colorHeader = 'bg-slate-200', isLoading = false }) => {
  return (
    <div className="flex flex-col w-72 shrink-0 bg-slate-100/80 border border-slate-200/80 rounded-xl p-3 shadow-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${colorHeader}`} />
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">{title}</h3>
        </div>
        <span className="flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-xs font-bold">
          {isLoading ? '...' : tickets.length}
        </span>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[500px] rounded-lg p-1.5 transition-colors ${
              snapshot.isDraggingOver ? 'bg-blue-50/80 ring-2 ring-blue-400 ring-dashed' : 'bg-transparent'
            }`}
          >
            {isLoading ? (
              <div className="flex flex-col gap-2.5 p-1 animate-pulse">
                <div className="h-24 bg-slate-200/70 rounded-lg"></div>
                <div className="h-24 bg-slate-200/50 rounded-lg"></div>
              </div>
            ) : (
              <>
                {tickets.map((ticket, index) => (
                  <TicketCard key={ticket._id} ticket={ticket} index={index} onClick={onCardClick} />
                ))}
                {provided.placeholder}

                {tickets.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-medium text-center p-4">
                    No tickets in {title}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
