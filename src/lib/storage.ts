import { Subject, DailyRoutine, WeeklySchedule } from '@/types/planner';

const STORAGE_KEYS = {
  SUBJECTS: 'studyplanner_subjects',
  ROUTINE: 'studyplanner_routine',
  SCHEDULE: 'studyplanner_schedule'
};

export const saveSubjects = (subjects: Subject[]): void => {
  // Serialize subjects with exam dates as ISO strings
  const serialized = subjects.map(s => ({
    ...s,
    examDate: s.examDate ? new Date(s.examDate).toISOString() : undefined
  }));
  localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(serialized));
};

export const loadSubjects = (): Subject[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
  if (!data) return [];
  
  const parsed = JSON.parse(data);
  // Deserialize exam dates back to Date objects
  return parsed.map((s: any) => ({
    ...s,
    examDate: s.examDate ? new Date(s.examDate) : undefined
  }));
};

export const saveRoutine = (routine: DailyRoutine): void => {
  localStorage.setItem(STORAGE_KEYS.ROUTINE, JSON.stringify(routine));
};

export const loadRoutine = (): DailyRoutine | null => {
  const data = localStorage.getItem(STORAGE_KEYS.ROUTINE);
  return data ? JSON.parse(data) : null;
};

export const saveSchedule = (schedule: WeeklySchedule): void => {
  localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify({
    ...schedule,
    weekStart: schedule.weekStart.toISOString()
  }));
};

export const loadSchedule = (): WeeklySchedule | null => {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
  if (!data) return null;
  
  const parsed = JSON.parse(data);
  return {
    ...parsed,
    weekStart: new Date(parsed.weekStart)
  };
};

export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};
