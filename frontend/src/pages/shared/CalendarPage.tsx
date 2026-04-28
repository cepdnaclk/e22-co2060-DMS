import { useState, useEffect } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Bell, BellOff, Plus, X } from 'lucide-react';
import { calendarAPI } from '../../api';
import type { CalendarEvent } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { useToast } from '../../components/common/Toast';

const EVENT_COLORS: Record<string, string> = {
  MATCH: 'bg-blue-500',
  TOURNAMENT: 'bg-yellow-500',
  JUDGING_ASSIGNMENT: 'bg-violet-500',
  OTHER: 'bg-emerald-500',
};

export default function CalendarPage() {
  const { showToast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '', description: '', eventType: 'OTHER' as CalendarEvent['eventType'],
    startTime: '', endTime: '', colorCode: '#3b82f6'
  });

  useEffect(() => {
    calendarAPI.getEvents()
      .then(r => setEvents(r.data))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleReminder = async (id: number) => {
    try {
      const { data } = await calendarAPI.toggleReminder(id);
      setEvents(prev => prev.map(e => e.id === id ? data : e));
    } catch { showToast('Failed to update reminder', 'error'); }
  };

  const addEvent = async () => {
    if (!newEvent.title || !newEvent.startTime) {
      showToast('Please fill title and start time', 'error'); return;
    }
    try {
      const { data } = await calendarAPI.createEvent(newEvent);
      setEvents(prev => [...prev, data]);
      setShowAdd(false);
      setNewEvent({ title: '', description: '', eventType: 'OTHER', startTime: '', endTime: '', colorCode: '#3b82f6' });
      showToast('Event added!', 'success');
    } catch { showToast('Failed to add event', 'error'); }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  const getEventsForDay = (day: Date) =>
    events.filter(e => e.startTime && isSameDay(new Date(e.startTime), day));

  const selectedDayEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <CalIcon className="w-6 h-6 text-blue-400" /> Calendar
          </h1>
          <button onClick={() => setShowAdd(true)}
            className="btn-primary text-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{format(currentMonth, 'MMMM yyyy')}</h2>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-xs text-gray-500 py-1 font-medium">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isToday = isSameDay(day, new Date());
                return (
                  <button key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={`min-h-[52px] p-1 rounded-lg text-sm transition-all ${
                      isSelected ? 'bg-blue-600 text-white' :
                      isToday ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'text-gray-300 hover:bg-white/10'
                    }`}>
                    <span className="block text-center font-medium">{format(day, 'd')}</span>
                    <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                      {dayEvents.slice(0, 3).map(e => (
                        <div key={e.id} className={`w-1.5 h-1.5 rounded-full ${EVENT_COLORS[e.eventType] || 'bg-emerald-500'}`} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
              {Object.entries(EVENT_COLORS).map(([type, color]) => (
                <div key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
                  <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                  {type.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Event Detail Panel */}
          <div className="card">
            <h3 className="font-bold text-white mb-4">
              {selectedDay ? format(selectedDay, 'MMMM d, yyyy') : 'Select a day'}
            </h3>
            {loading ? <LoadingSpinner size="sm" /> : selectedDay ? (
              selectedDayEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedDayEvents.map(e => (
                    <div key={e.id} className="glass rounded-xl p-3 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${EVENT_COLORS[e.eventType]}`} />
                          <p className="text-sm font-semibold text-white">{e.title}</p>
                        </div>
                        <button onClick={() => toggleReminder(e.id)}
                          className={`p-1 rounded-lg transition-colors ${e.reminderEnabled ? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
                          {e.reminderEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </button>
                      </div>
                      {e.description && <p className="text-xs text-gray-400">{e.description}</p>}
                      {e.startTime && (
                        <p className="text-xs text-gray-500">
                          {format(new Date(e.startTime), 'h:mm a')}
                          {e.endTime && ` – ${format(new Date(e.endTime), 'h:mm a')}`}
                        </p>
                      )}
                      <span className="text-xs text-gray-600">{e.eventType.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm text-center py-8">No events on this day</p>
              )
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">Click a day to see events</p>
            )}

            {/* All upcoming events */}
            {events.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Upcoming</p>
                <div className="space-y-2">
                  {events.filter(e => e.startTime && new Date(e.startTime) >= new Date())
                    .slice(0, 4).map(e => (
                    <div key={e.id} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_COLORS[e.eventType]}`} />
                      <span className="text-gray-300 truncate">{e.title}</span>
                      <span className="text-gray-600 flex-shrink-0 ml-auto">
                        {e.startTime ? format(new Date(e.startTime), 'MMM d') : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAdd(false)} />
          <div className="relative glass-dark rounded-2xl w-full max-w-md border border-white/10 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="font-bold text-white">Add Event</h3>
              <button onClick={() => setShowAdd(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="p-5 space-y-3">
              <input value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))}
                placeholder="Event title *" className="input-field" />
              <textarea value={newEvent.description} onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                placeholder="Description" rows={2} className="input-field resize-none" />
              <select value={newEvent.eventType} onChange={e => setNewEvent(p => ({ ...p, eventType: e.target.value as any }))}
                className="input-field">
                <option value="MATCH">Match</option>
                <option value="TOURNAMENT">Tournament</option>
                <option value="JUDGING_ASSIGNMENT">Judging Assignment</option>
                <option value="OTHER">Other</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Start Time *</label>
                  <input type="datetime-local" value={newEvent.startTime}
                    onChange={e => setNewEvent(p => ({ ...p, startTime: e.target.value }))}
                    className="input-field text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                  <input type="datetime-local" value={newEvent.endTime}
                    onChange={e => setNewEvent(p => ({ ...p, endTime: e.target.value }))}
                    className="input-field text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={addEvent} className="btn-primary flex-1">Add Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
