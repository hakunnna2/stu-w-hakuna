import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { StudySession, Task, Exam } from '../types';

interface ScheduleProps {
  sessions: StudySession[];
  tasks: Task[];
  exams: Exam[];
}

type ViewMode = 'day' | 'week' | 'month';

const Schedule: React.FC<ScheduleProps> = ({ sessions, tasks, exams }) => {
  const [view, setView] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper to format date key YYYY-MM-DD
  const formatDateKey = (d: Date) => d.toISOString().split('T')[0];

  const getDayItems = (date: Date) => {
    const dateStr = formatDateKey(date);
    return {
      sessions: sessions.filter(s => s.date === dateStr),
      tasks: tasks.filter(t => t.dueDate === dateStr),
      exams: exams.filter(e => e.date === dateStr)
    };
  };

  const getExamSubject = (examId: string) => exams.find(e => e.id === examId)?.subject || 'Unknown';

  // Navigation Logic
  const navigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const jumpToToday = () => setCurrentDate(new Date());

  // Date Generators
  const calendarDays = useMemo(() => {
    if (view === 'day') return [currentDate];

    if (view === 'week') {
      const days = [];
      const startOfWeek = new Date(currentDate);
      const day = currentDate.getDay(); // 0 is Sunday
      startOfWeek.setDate(currentDate.getDate() - day); // Go to Sunday
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        days.push(d);
      }
      return days;
    }

    // Month View
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startPadding = firstDay.getDay(); // 0 (Sun) to 6 (Sat)
    
    const days = [];
    // Padding
    for (let i = 0; i < startPadding; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [view, currentDate]);

  const headerLabel = useMemo(() => {
    if (view === 'day') return currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    if (view === 'week') {
      const start = calendarDays[0] as Date;
      const end = calendarDays[6] as Date;
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, [view, currentDate, calendarDays]);

  return (
    <div className="font-mono h-full flex flex-col space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-4">
          <div className="flex border border-zinc-700">
            {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-1 text-xs uppercase ${view === v ? 'bg-green-900/40 text-green-400 font-bold' : 'text-zinc-500 hover:bg-zinc-900'}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={jumpToToday} className="text-xs text-zinc-500 hover:text-green-500 underline decoration-zinc-700 underline-offset-4">
            Today
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => navigate('prev')} className="hover:text-green-500 text-zinc-400"><ChevronLeft size={20} /></button>
          <span className="text-lg font-bold text-zinc-200 min-w-[200px] text-center uppercase tracking-widest">{headerLabel}</span>
          <button onClick={() => navigate('next')} className="hover:text-green-500 text-zinc-400"><ChevronRight size={20} /></button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={`flex-1 overflow-auto border-t border-l border-zinc-800 bg-black ${
        view === 'month' ? 'grid grid-cols-7' : view === 'week' ? 'grid grid-cols-7' : 'flex flex-col'
      }`}>
        
        {/* Weekday Headers (Only for Month/Week) */}
        {view !== 'day' && ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
          <div key={d} className="border-b border-r border-zinc-800 bg-zinc-950 p-2 text-center text-[10px] text-zinc-500 font-bold tracking-wider">
            {d}
          </div>
        ))}

        {/* Days */}
        {calendarDays.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="border-b border-r border-zinc-800 bg-zinc-900/20 min-h-[100px]" />;

          const { sessions: daySessions, tasks: dayTasks, exams: dayExams } = getDayItems(day);
          const isToday = formatDateKey(new Date()) === formatDateKey(day);
          const hasItems = daySessions.length > 0 || dayTasks.length > 0 || dayExams.length > 0;

          return (
            <div 
              key={idx} 
              className={`
                border-b border-r border-zinc-800 p-2 transition-colors relative group
                ${view === 'month' ? 'min-h-[120px]' : view === 'week' ? 'min-h-[400px]' : 'min-h-[200px] border-l border-t-0'}
                ${isToday ? 'bg-zinc-900/50' : 'hover:bg-zinc-900/10'}
              `}
            >
              {/* Day Number Header */}
              <div className={`flex justify-between items-start mb-2 ${view === 'day' ? 'border-b border-zinc-800 pb-2 mb-4' : ''}`}>
                <span className={`text-sm ${isToday ? 'text-green-500 font-bold' : 'text-zinc-500'}`}>
                  {day.getDate()}
                </span>
                {view === 'day' && <span className="text-zinc-500 uppercase">{day.toLocaleDateString('en-US', { weekday: 'long' })}</span>}
                {hasItems && view === 'month' && (
                  <span className="text-[10px] text-zinc-600 md:hidden">•</span>
                )}
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                {dayExams.map(exam => (
                  <div key={exam.id} className="bg-red-900/20 border-l-2 border-red-500 px-1.5 py-1">
                    <div className="text-[10px] text-red-400 font-bold truncate">! EXAM: {exam.subject}</div>
                    {view !== 'month' && <div className="text-[9px] text-red-400/70">{exam.difficulty}</div>}
                  </div>
                ))}

                {daySessions.map(session => (
                  <div key={session.id} className="group/item relative">
                    <div className="text-[10px] text-green-600 truncate flex items-center gap-1 hover:bg-zinc-900/50 p-0.5 -mx-0.5">
                       <span className="text-green-700">./</span>
                       <span className="font-bold">{getExamSubject(session.examId).substring(0,view === 'month' ? 6 : 10)}</span>
                       {view !== 'month' && <span className="text-zinc-500">- {session.topic}</span>}
                    </div>
                  </div>
                ))}

                {dayTasks.map(task => (
                  <div key={task.id} className={`text-[10px] px-1 truncate border-l ${task.completed ? 'border-zinc-700 text-zinc-600 line-through' : 'border-blue-500 text-blue-400'}`}>
                    {task.title}
                  </div>
                ))}

                {/* Overflow indicator for month view */}
                {view === 'month' && (daySessions.length + dayTasks.length) > 3 && (
                   <div className="text-[9px] text-zinc-600 text-center italic">
                     + {(daySessions.length + dayTasks.length) - 3} more
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="flex justify-between text-[10px] text-zinc-600 border-t border-zinc-800 pt-2">
         <span>Mode: --{view}--</span>
         <span>[ {sessions.length} sessions ] [ {tasks.length} tasks ] [ {exams.length} exams ]</span>
      </div>
    </div>
  );
};

export default Schedule;