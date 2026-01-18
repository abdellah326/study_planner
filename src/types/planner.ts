export interface Subject {
  id: string;
  name: string;
  difficulty: number; // 1-5
  notes?: string;
  colorIndex: number;
  examDate?: Date; // Per-subject exam date
}

export interface DailyRoutine {
  studyStartTime: string; // HH:MM format
  studyEndTime: string;
  sleepDuration: number; // hours
  mealTimes: string[]; // HH:MM format array
  breakDuration: number; // minutes between sessions
}

export interface StudyPlan {
  subjects: Subject[];
  routine: DailyRoutine;
}

export interface ScheduleBlock {
  id: string;
  subjectId: string;
  subjectName: string;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  duration: number; // minutes
  priority: 'high' | 'medium' | 'low';
  colorIndex: number;
  day: number; // 0-6 (Sunday-Saturday)
  isBreak?: boolean; // For break blocks
}

export interface WeeklySchedule {
  weekStart: Date;
  blocks: ScheduleBlock[];
  stats: {
    totalStudyHours: number;
    earliestExamDays: number; // Days until the earliest exam
    subjectBreakdown: { 
      subjectId: string; 
      totalMinutes: number;
      daysUntilExam: number;
    }[];
  };
}

export type FormStep = 'subjects' | 'exam' | 'routine' | 'schedule';
