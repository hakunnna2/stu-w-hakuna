export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum Difficulty {
  EASY = 'Easy',
  MODERATE = 'Moderate',
  HARD = 'Hard',
  EXTREME = 'Extreme',
}

export interface Exam {
  id: string;
  subject: string;
  date: string; // ISO Date string
  weight: number; // Percentage
  difficulty: Difficulty;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string; // ISO Date string
  priority: Priority;
  estimatedMinutes: number;
}

export interface StudySession {
  id: string;
  examId: string;
  topic: string;
  date: string; // ISO Date string
  durationMinutes: number;
  completed: boolean;
}

export interface UserStats {
  studyMinutesToday: number;
  tasksCompleted: number;
  streakDays: number;
  xp: number;
}

export interface AppState {
  exams: Exam[];
  tasks: Task[];
  sessions: StudySession[];
  stats: UserStats;
  motivation: string;
}