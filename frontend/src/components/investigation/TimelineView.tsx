import React from 'react';
import {
  LogIn,
  Eye,
  Edit3,
  ShieldAlert,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { TimelineItem } from '../../types';

interface TimelineViewProps {
  events: TimelineItem[];
  onEventClick?: (event: TimelineItem) => void;
  selectedEventId?: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  events,
  onEventClick,
  selectedEventId,
}) => {
  if (!events || events.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-center text-slate-400">
        <Clock className="h-8 w-8 text-slate-500 mb-2" />
        <span className="text-sm">No timeline events recorded for this entity.</span>
      </div>
    );
  }

  const getEventIcon = (ev: TimelineItem) => {
    const desc = ev.description.toLowerCase();
    if (desc.includes('login') || desc.includes('session')) return LogIn;
    if (desc.includes('override') || desc.includes('unauthorized') || ev.severity === 'CRITICAL') return ShieldAlert;
    if (desc.includes('edit') || desc.includes('modified') || desc.includes('change')) return Edit3;
    if (desc.includes('transfer') || desc.includes('₹') || desc.includes('neft') || desc.includes('rtgs'))
      return ArrowRightLeft;
    return Eye;
  };

  const getEventBadgeColor = (ev: TimelineItem) => {
    const desc = ev.description.toLowerCase();
    if (ev.severity === 'CRITICAL' || desc.includes('override'))
      return 'bg-red-950/80 text-red-400 border-red-500/50';
    if (ev.severity === 'HIGH' || desc.includes('limit') || desc.includes('edit'))
      return 'bg-orange-950/80 text-orange-400 border-orange-500/50';
    if (desc.includes('transfer') || desc.includes('₹'))
      return 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50';
    return 'bg-slate-800 text-slate-300 border-slate-700';
  };

  return (
    <div className="relative space-y-4 before:absolute before:bottom-0 before:left-4 before:top-2 before:w-0.5 before:bg-slate-800">
      {events.map((ev, idx) => {
        const Icon = getEventIcon(ev);
        const badgeColor = getEventBadgeColor(ev);
        const isSelected = selectedEventId === ev.id;

        // Parse timestamp
        let formattedTime = ev.timestamp;
        try {
          const d = new Date(ev.timestamp);
          formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        } catch {
          // fallback
        }

        return (
          <div
            key={ev.id || idx}
            onClick={() => onEventClick && onEventClick(ev)}
            className={`relative flex items-start gap-4 rounded-xl border p-3.5 transition-all duration-150 ${
              isSelected
                ? 'border-cyan-500 bg-cyan-950/30 shadow-md'
                : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80 cursor-pointer'
            }`}
          >
            {/* Timeline Icon Node */}
            <div
              className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm ${badgeColor}`}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-200">{formattedTime}</span>
                  {ev.event_type && (
                    <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono uppercase text-slate-400">
                      {ev.event_type}
                    </span>
                  )}
                </div>

                {ev.time_delta_display && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
                    <Clock className="h-3 w-3" />
                    {ev.time_delta_display}
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs text-slate-300 leading-relaxed break-words">{ev.description}</p>

              {/* Source Record Tag */}
              {ev.id && (
                <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span>Record:</span>
                  <span className="text-slate-300 font-medium">{ev.id}</span>
                  {ev.actor && <span>• Actor: {ev.actor}</span>}
                  {ev.account_id && <span>• Account: {ev.account_id}</span>}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
