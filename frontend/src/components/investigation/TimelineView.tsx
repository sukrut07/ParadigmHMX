import React from 'react';
import {
  LogIn,
  Eye,
  Edit3,
  ShieldAlert,
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  UserCheck
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
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-[#D7E0DA] bg-[#FFFFFF] p-6 text-center text-[#68766E] shadow-sm">
        <Clock className="h-8 w-8 text-[#8A958E] mb-2" />
        <span className="text-sm font-medium">No timeline events recorded for this entity.</span>
      </div>
    );
  }

  const getEventIcon = (ev: TimelineItem) => {
    const desc = (ev.description || '').toLowerCase();
    const type = (ev.event_type || '').toUpperCase();
    if (type.includes('APPROVAL') || desc.includes('approval') || desc.includes('approved')) return CheckCircle2;
    if (type.includes('OVERRIDE') || desc.includes('override') || desc.includes('unauthorized') || ev.severity === 'CRITICAL') return ShieldAlert;
    if (type.includes('ACCOUNT_CHANGE') || desc.includes('edit') || desc.includes('modified') || desc.includes('change')) return Edit3;
    if (type.includes('TRANSACTION') || desc.includes('transfer') || desc.includes('₹') || desc.includes('neft') || desc.includes('rtgs'))
      return ArrowRightLeft;
    if (desc.includes('login') || desc.includes('session')) return LogIn;
    return Eye;
  };

  /**
   * Semantic badge colors as specified:
   * ACCESS_LOG:     bg #EDF5FF, color #1858A8, border #B8D5FA
   * ACCOUNT_CHANGE: bg #FFF7E8, color #8A5A00, border #E9CF8B
   * OVERRIDE:       bg #FDECEC, color #B42318, border #F3B5B0
   * TRANSACTION:    bg #EAF8F1, color #176044, border #B8DCC8
   * APPROVAL:       bg #F1EEFF, color #5A43A6, border #D5C8F8
   */
  const getEventTypeStyle = (eventType: string = '', desc: string = '', severity: string = '') => {
    const typeUpper = eventType.toUpperCase();
    const descLower = desc.toLowerCase();

    if (typeUpper.includes('OVERRIDE') || descLower.includes('override') || severity === 'CRITICAL') {
      return { bg: '#FDECEC', color: '#B42318', border: '#F3B5B0' };
    }
    if (typeUpper.includes('ACCOUNT') || typeUpper.includes('CHANGE') || descLower.includes('modified') || descLower.includes('field')) {
      return { bg: '#FFF7E8', color: '#8A5A00', border: '#E9CF8B' };
    }
    if (typeUpper.includes('TRANSACTION') || typeUpper.includes('TRANSFER') || descLower.includes('transfer') || descLower.includes('₹')) {
      return { bg: '#EAF8F1', color: '#176044', border: '#B8DCC8' };
    }
    if (typeUpper.includes('APPROVAL') || descLower.includes('approval') || descLower.includes('approved')) {
      return { bg: '#F1EEFF', color: '#5A43A6', border: '#D5C8F8' };
    }
    if (typeUpper.includes('ACCESS') || typeUpper.includes('LOG') || descLower.includes('view') || descLower.includes('access')) {
      return { bg: '#EDF5FF', color: '#1858A8', border: '#B8D5FA' };
    }
    return { bg: '#EDF3EF', color: '#176044', border: '#C9D9D0' };
  };

  /**
   * Highlight critical entities (EMP-xxx, ACC-xxx, CUST-xxx, 'FIELD_NAME') with #0B2E21 font-weight 600
   */
  const renderDescription = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(EMP-[\w-]+|ACC-[\w-]+|CUST-[\w-]+|TX-[\w-]+|'[^']+')/g);
    return (
      <span className="text-xs text-[#425148] leading-relaxed break-words">
        {parts.map((part, i) => {
          if (/^(EMP-[\w-]+|ACC-[\w-]+|CUST-[\w-]+|TX-[\w-]+|'[^']+')$/.test(part)) {
            return (
              <strong key={i} className="text-[#0B2E21] font-semibold">
                {part}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  return (
    <div className="relative space-y-3.5 before:absolute before:bottom-0 before:left-4 before:top-2 before:w-0.5 before:bg-[#D7E0DA]">
      {events.map((ev, idx) => {
        const Icon = getEventIcon(ev);
        const typeStyle = getEventTypeStyle(ev.event_type, ev.description, ev.severity);
        const isSelected = selectedEventId === ev.id;

        // Parse timestamp
        let formattedTime = ev.timestamp;
        try {
          const d = new Date(ev.timestamp);
          if (!isNaN(d.getTime())) {
            formattedTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
        } catch {
          // fallback
        }

        return (
          <div
            key={ev.id || idx}
            onClick={() => onEventClick && onEventClick(ev)}
            className={`timeline-event-card relative flex items-start gap-3.5 p-3.5 cursor-pointer ${
              isSelected ? 'selected' : ''
            }`}
            style={
              isSelected
                ? {
                    background: '#EFF9F3',
                    border: '1px solid #39A96B',
                    boxShadow: '0 2px 8px rgba(20,40,30,0.08)',
                  }
                : {
                    background: '#FFFFFF',
                    border: '1px solid #D7E0DA',
                    boxShadow: '0 2px 8px rgba(20,40,30,0.05)',
                  }
            }
          >
            {/* Timeline Icon Node */}
            <div
              className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs"
              style={{
                background: typeStyle.bg,
                color: typeStyle.color,
                border: `1px solid ${typeStyle.border}`,
              }}
            >
              <Icon className="h-4 w-4" />
            </div>

            {/* Event Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#17221C]">{formattedTime}</span>
                  {ev.event_type && (
                    <span
                      style={{
                        background: typeStyle.bg,
                        color: typeStyle.color,
                        border: `1px solid ${typeStyle.border}`,
                      }}
                      className="rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider"
                    >
                      {ev.event_type}
                    </span>
                  )}
                </div>

                {ev.time_delta_display && (
                  <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-[#176044]">
                    <Clock className="h-3 w-3" />
                    {ev.time_delta_display}
                  </span>
                )}
              </div>

              <div className="mt-1.5">
                {renderDescription(ev.description)}
              </div>

              {/* Source Record Tag */}
              {ev.id && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-mono text-[#68766E]">
                  <span>Record:</span>
                  <span className="text-[#17221C] font-semibold">{ev.id}</span>
                  {ev.actor && (
                    <span>
                      • Actor: <strong className="text-[#0B2E21] font-semibold">{ev.actor}</strong>
                    </span>
                  )}
                  {ev.account_id && (
                    <span>
                      • Account: <strong className="text-[#0B2E21] font-semibold">{ev.account_id}</strong>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
