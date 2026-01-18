import { Subject, DailyRoutine, ScheduleBlock, WeeklySchedule } from '@/types/planner';

/**
 * Smart Study Scheduler Algorithm
 * 
 * This algorithm uses a weighted priority system based on:
 * 1. Difficulty (1-5): Higher difficulty = more study time needed
 * 2. Urgency: Calculated INDIVIDUALLY for each subject from its own exam date
 * 3. Weight = Difficulty × Urgency Factor (per subject)
 * 
 * Scheduling Rules:
 * - Each subject's urgency is calculated from ITS OWN exam date
 * - Harder + more urgent subjects are scheduled earlier in the day
 * - Easier subjects are scheduled later
 * - Breaks are automatically inserted between sessions with exact times
 * - All sessions show precise start and end times (e.g., 09:00 - 10:30)
 */

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Calculate urgency factor based on days remaining for THIS SPECIFIC SUBJECT
 * More urgent (fewer days) = higher factor
 */
const calculateUrgency = (daysRemaining: number): number => {
  if (daysRemaining <= 3) return 3;      // Critical urgency
  if (daysRemaining <= 7) return 2.5;    // High urgency
  if (daysRemaining <= 14) return 2;     // Medium urgency
  if (daysRemaining <= 30) return 1.5;   // Normal
  return 1;                               // Low urgency
};

/**
 * Calculate priority weight for a subject
 * Weight = Difficulty × Urgency (calculated per subject)
 */
const calculateWeight = (difficulty: number, urgency: number): number => {
  return difficulty * urgency;
};

/**
 * Determine priority label based on weight
 */
const getPriorityLabel = (weight: number): 'high' | 'medium' | 'low' => {
  if (weight >= 10) return 'high';
  if (weight >= 5) return 'medium';
  return 'low';
};

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Calculate available study slots for a day, avoiding meal times
 */
const getStudySlots = (
  startTime: string,
  endTime: string,
  mealTimes: string[],
  breakDuration: number
): { start: number; end: number }[] => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  // Sort meal times and add buffer (30 min for each meal)
  const mealBlocks = mealTimes
    .map(time => ({
      start: timeToMinutes(time),
      end: timeToMinutes(time) + 30
    }))
    .filter(block => block.start >= startMinutes && block.end <= endMinutes)
    .sort((a, b) => a.start - b.start);

  const slots: { start: number; end: number }[] = [];
  let currentStart = startMinutes;

  for (const meal of mealBlocks) {
    if (currentStart < meal.start) {
      slots.push({ start: currentStart, end: meal.start });
    }
    currentStart = meal.end;
  }

  if (currentStart < endMinutes) {
    slots.push({ start: currentStart, end: endMinutes });
  }

  return slots;
};

/**
 * Generate optimized weekly schedule with exact time slots
 * Each subject's urgency is calculated from ITS OWN exam date
 */
export const generateSchedule = (
  subjects: Subject[],
  routine: DailyRoutine
): WeeklySchedule => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate days remaining and urgency PER SUBJECT
  const weightedSubjects = subjects.map(subject => {
    const examDate = subject.examDate ? new Date(subject.examDate) : new Date();
    examDate.setHours(0, 0, 0, 0);
    
    const daysRemaining = Math.max(
      1,
      Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    );
    
    const urgency = calculateUrgency(daysRemaining);
    const weight = calculateWeight(subject.difficulty, urgency);
    
    return {
      ...subject,
      daysRemaining,
      urgency,
      weight,
      priority: getPriorityLabel(weight)
    };
  }).sort((a, b) => b.weight - a.weight); // Sort by weight descending

  // Calculate total weight for proportional time allocation
  const totalWeight = weightedSubjects.reduce((sum, s) => sum + s.weight, 0);

  // Get daily study slots
  const dailySlots = getStudySlots(
    routine.studyStartTime,
    routine.studyEndTime,
    routine.mealTimes,
    routine.breakDuration
  );

  // Calculate total daily study minutes
  const totalDailyMinutes = dailySlots.reduce(
    (sum, slot) => sum + (slot.end - slot.start),
    0
  );

  const blocks: ScheduleBlock[] = [];
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start from Sunday

  // Generate schedule for 7 days with exact time slots
  for (let day = 0; day < 7; day++) {
    let subjectIndex = 0;
    
    for (const slot of dailySlots) {
      let currentTime = slot.start;
      
      while (currentTime < slot.end && weightedSubjects.length > 0) {
        const subject = weightedSubjects[subjectIndex % weightedSubjects.length];
        
        // Calculate time for this subject based on its weight proportion
        const proportionalTime = Math.round(
          (subject.weight / totalWeight) * totalDailyMinutes
        );
        
        // Minimum 30 min, maximum 90 min per session
        const sessionDuration = Math.min(
          90,
          Math.max(30, proportionalTime)
        );
        
        // Ensure we don't overflow the slot
        const actualDuration = Math.min(sessionDuration, slot.end - currentTime);
        
        if (actualDuration >= 20) { // Minimum useful session
          const startTimeStr = minutesToTime(currentTime);
          const endTimeStr = minutesToTime(currentTime + actualDuration);
          
          blocks.push({
            id: generateId(),
            subjectId: subject.id,
            subjectName: subject.name,
            startTime: startTimeStr,
            endTime: endTimeStr,
            duration: actualDuration,
            priority: subject.priority as 'high' | 'medium' | 'low',
            colorIndex: subject.colorIndex,
            day,
            isBreak: false
          });
          
          currentTime += actualDuration;
          
          // Add break block if there's time left in the slot
          if (currentTime + routine.breakDuration < slot.end) {
            blocks.push({
              id: generateId(),
              subjectId: 'break',
              subjectName: 'Break',
              startTime: minutesToTime(currentTime),
              endTime: minutesToTime(currentTime + routine.breakDuration),
              duration: routine.breakDuration,
              priority: 'low',
              colorIndex: -1,
              day,
              isBreak: true
            });
            currentTime += routine.breakDuration;
          }
        } else {
          currentTime = slot.end; // End this slot
        }
        
        subjectIndex++;
      }
    }
  }

  // Calculate stats
  const studyBlocks = blocks.filter(b => !b.isBreak);
  const totalStudyMinutes = studyBlocks.reduce((sum, b) => sum + b.duration, 0);
  
  // Find earliest exam
  const earliestExamDays = Math.min(...weightedSubjects.map(s => s.daysRemaining));
  
  const subjectBreakdown = subjects.map(subject => {
    const ws = weightedSubjects.find(w => w.id === subject.id);
    return {
      subjectId: subject.id,
      totalMinutes: studyBlocks
        .filter(b => b.subjectId === subject.id)
        .reduce((sum, b) => sum + b.duration, 0),
      daysUntilExam: ws?.daysRemaining || 0
    };
  });

  return {
    weekStart,
    blocks,
    stats: {
      totalStudyHours: Math.round(totalStudyMinutes / 60 * 10) / 10,
      earliestExamDays,
      subjectBreakdown
    }
  };
};

/**
 * Get study tips for a subject based on difficulty
 */
export const getStudyTips = (difficulty: number): string[] => {
  const tips: Record<number, string[]> = {
    1: [
      "Quick review sessions are sufficient",
      "Use flashcards for key concepts",
      "Test yourself with practice questions"
    ],
    2: [
      "Regular short study sessions work well",
      "Create summary notes",
      "Teach the material to someone else"
    ],
    3: [
      "Break down into smaller topics",
      "Use active recall techniques",
      "Schedule regular review sessions"
    ],
    4: [
      "Focus during peak energy hours",
      "Use the Feynman technique",
      "Create mind maps for complex topics"
    ],
    5: [
      "Schedule multiple focused sessions",
      "Start with fundamentals first",
      "Use spaced repetition",
      "Seek help from tutors or study groups"
    ]
  };
  
  return tips[difficulty] || tips[3];
};
