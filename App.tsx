import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExamPlanner from './components/ExamPlanner';
import TaskManager from './components/TaskManager';
import FocusTimer from './components/FocusTimer';
import Schedule from './components/Schedule';
import { AppState, Exam, Task, StudySession } from './types';

// Initial State / Mock Data
const INITIAL_STATE: AppState = {
  exams: [],
  tasks: [],
  sessions: [],
  stats: {
    studyMinutesToday: 0,
    tasksCompleted: 0,
    streakDays: 3,
    xp: 450
  },
  motivation: "Ready to learn?"
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<AppState>(() => {
    const saved = localStorage.getItem('scholarSyncData');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });

  useEffect(() => {
    localStorage.setItem('scholarSyncData', JSON.stringify(data));
  }, [data]);

  const addExam = (exam: Exam) => {
    setData(prev => ({ ...prev, exams: [...prev.exams, exam] }));
  };

  const updateExam = (updatedExam: Exam) => {
    setData(prev => ({
      ...prev,
      exams: prev.exams.map(e => e.id === updatedExam.id ? updatedExam : e)
    }));
  };

  const deleteExam = (id: string) => {
    setData(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id),
      sessions: prev.sessions.filter(s => s.examId !== id) // Cascade delete sessions
    }));
  };

  const addTask = (task: Task) => {
    setData(prev => ({ ...prev, tasks: [...prev.tasks, task] }));
  };

  const updateTask = (updatedTask: Task) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === updatedTask.id ? updatedTask : t)
    }));
  };

  const toggleTask = (id: string) => {
    setData(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      ),
      stats: {
        ...prev.stats,
        tasksCompleted: prev.tasks.find(t => t.id === id)?.completed 
          ? prev.stats.tasksCompleted - 1 
          : prev.stats.tasksCompleted + 1
      }
    }));
  };

  const deleteTask = (id: string) => {
    setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
  };

  const updateFocusStats = (minutes: number) => {
    setData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        studyMinutesToday: prev.stats.studyMinutesToday + minutes,
        xp: prev.stats.xp + (minutes * 5) // 5 XP per minute of focus
      }
    }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={data.stats} 
            tasks={data.tasks} 
            sessions={data.sessions} 
            exams={data.exams}
            userName="Hakuna" 
          />
        );
      case 'exams':
        return (
          <ExamPlanner 
            exams={data.exams} 
            sessions={data.sessions}
            addExam={addExam} 
            updateExam={updateExam}
            deleteExam={deleteExam}
          />
        );
      case 'tasks':
        return (
          <TaskManager 
            tasks={data.tasks} 
            addTask={addTask} 
            updateTask={updateTask}
            toggleTask={toggleTask}
            deleteTask={deleteTask}
          />
        );
      case 'schedule':
        return (
          <Schedule 
            sessions={data.sessions}
            tasks={data.tasks}
            exams={data.exams}
          />
        );
      case 'focus':
        return <FocusTimer updateStats={updateFocusStats} initialStats={data.stats} />;
      default:
        return <Dashboard stats={data.stats} tasks={data.tasks} sessions={data.sessions} exams={data.exams} userName="Hakuna" />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
}

export default App;