import React, { useState } from 'react';
import { Plus, X, Trash2, Edit3 } from 'lucide-react';
import { Exam, Difficulty, StudySession } from '../types';
import { generateStudyPlan } from '../services/geminiService';

interface ExamPlannerProps {
  exams: Exam[];
  sessions: StudySession[];
  addExam: (exam: Exam) => void;
  updateExam: (exam: Exam) => void;
  deleteExam: (id: string) => void;
  addSessions: (sessions: StudySession[]) => void;
}

const ExamPlanner: React.FC<ExamPlannerProps> = ({ exams, sessions, addExam, updateExam, deleteExam, addSessions }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.MODERATE);

  const startEditing = (exam: Exam) => {
    setSubject(exam.subject);
    setDate(exam.date);
    setDifficulty(exam.difficulty);
    setEditingId(exam.id);
    setIsAdding(true);
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setSubject('');
    setDate('');
    setDifficulty(Difficulty.MODERATE);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !date) return;

    if (editingId) {
      // Update existing exam
      const existingExam = exams.find(e => e.id === editingId);
      if (existingExam) {
        updateExam({
          ...existingExam,
          subject,
          date,
          difficulty
        });
      }
    } else {
      // Add new exam
      const newExam: Exam = {
        id: Math.random().toString(36).substr(2, 9),
        subject,
        date,
        weight: 0,
        difficulty,
        color: '#ffffff',
      };
      addExam(newExam);
    }

    cancelEdit();
  };

  const handleGeneratePlan = async (exam: Exam) => {
    setLoadingId(exam.id);
    const sessions = await generateStudyPlan(exam, new Date());
    addSessions(sessions);
    setLoadingId(null);
  };

  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="font-mono text-sm space-y-6">
      
      {/* Toolbar */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
        <h2 className="text-green-500 font-bold text-lg"> &gt; Exam Configuration</h2>
        <button
          onClick={() => {
            if (isAdding) cancelEdit();
            else setIsAdding(true);
          }}
          className={`border px-3 py-1 text-xs transition-colors ${
            isAdding 
              ? 'border-red-500 text-red-500 hover:bg-red-500/10' 
              : 'border-green-500 text-green-500 hover:bg-green-500/10'
          }`}
        >
          {isAdding ? '[ CANCEL ]' : '[ ADD EXAM ]'}
        </button>
      </div>

      {/* Editor Form */}
      {isAdding && (
        <div className="border border-dashed border-zinc-700 p-6 bg-zinc-900/30">
          <div className="mb-4 text-zinc-500 text-xs">
            {editingId ? `# Editing: ${editingId}` : '# Enter exam details below'}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="flex flex-col gap-1">
              <label className="text-zinc-400 text-xs">SUBJECT</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-black border border-zinc-700 p-2 text-zinc-200 focus:border-green-500 focus:outline-none"
                placeholder="e.g. Calculus II"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-zinc-400 text-xs">EXAM DATE</label>
               <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-black border border-zinc-700 p-2 text-zinc-200 focus:border-green-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col gap-1">
               <label className="text-zinc-400 text-xs">DIFFICULTY</label>
               <div className="flex gap-2">
                {Object.values(Difficulty).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`px-2 py-1 text-xs border ${
                      difficulty === diff
                        ? 'border-green-500 text-green-500 bg-green-500/10'
                        : 'border-zinc-700 text-zinc-600 hover:border-zinc-500'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
               </div>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="bg-zinc-200 text-black px-4 py-1 font-bold hover:bg-white text-xs"
              >
                [ SAVE EXAM ]
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exam List */}
      <div className="space-y-1">
        {sortedExams.length === 0 && !isAdding && (
          <div className="p-4 border-l-2 border-zinc-800 text-zinc-600 italic">
            # No exams found. Click [ ADD EXAM ] to start.
          </div>
        )}

        {sortedExams.map((exam) => {
          const daysLeft = Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          const examSessions = sessions.filter(s => s.examId === exam.id);
          const totalSessions = examSessions.length;
          const completedSessions = examSessions.filter(s => s.completed).length;
          const progress = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 20) : 0; // scale to 20 chars

          return (
            <div key={exam.id} className="group border border-transparent hover:border-zinc-700 hover:bg-zinc-900/20 p-4 transition-all">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-green-500 font-bold text-lg">{exam.subject}</span>
                    <span className="text-zinc-600 text-xs uppercase border border-zinc-800 px-1">{exam.difficulty}</span>
                  </div>
                  
                  <div className="text-zinc-400 text-xs font-mono">
                    Deadline: {exam.date} <span className={daysLeft < 3 ? "text-red-500" : "text-blue-500"}>({daysLeft} days remaining)</span>
                  </div>

                  <div className="text-zinc-500 text-xs font-mono mt-2">
                    Progress: [{ '#'.repeat(progress) }{ '.'.repeat(20 - progress) }]
                    <span className="ml-2 text-zinc-400">{completedSessions}/{totalSessions} sessions done</span>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2 items-end">
                   <button
                    onClick={() => handleGeneratePlan(exam)}
                    disabled={loadingId === exam.id || daysLeft < 0}
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline"
                   >
                     {loadingId === exam.id ? 'Generating Plan...' : '[ Generate Study Plan ]'}
                   </button>

                   <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                      onClick={() => startEditing(exam)}
                      className="text-xs text-zinc-600 hover:text-yellow-500 hover:underline"
                     >
                       [ Edit ]
                     </button>
                     
                     <button
                      onClick={() => deleteExam(exam.id)}
                      className="text-xs text-zinc-600 hover:text-red-500 hover:underline"
                     >
                       [ Delete ]
                     </button>
                   </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamPlanner;