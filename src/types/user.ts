export type UserRole = 'STUDENT' | 'JUDGE';

export interface BaseUserProfile {
  id: string;
  name: string;
  affiliation: string;
  teamAffiliation?: string;
  bio?: string;
  socialLinks?: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  rank?: string;
  followers?: number;
  following?: number;
  location?: string;
  communityStats?: {
    views: number;
    viewsLastWeek: number;
    solutions: number;
    solutionsLastWeek: number;
    discuss: number;
    discussLastWeek: number;
  };
  skills?: {
    category: 'Advanced' | 'Intermediate' | 'Fundamental';
    items: { name: string; count: number }[];
  }[];
  profilePictureUrl?: string;
  role: UserRole;
  history: MatchHistory[];
}

export interface MatchHistory {
  id: string;
  date: string;
  motion: string;
  tournamentName: string;
  position?: string; // e.g. "Proposition", "Opposition"
  // Student specific
  result?: 'WIN' | 'LOSS' | 'DRAW';
  // Judge specific
  winningTeam?: string;
}

export interface StudentStats {
  wins: number;
  losses: number;
  draws?: number;
  averageSpeakerPoints: number;
  tournamentsAttended: number;
}

export interface JudgeStats {
  matchesJudged: number;
  averageJudgeFeedbackScore: number;
  chairCount: number;
  panelistCount: number;
  tournamentsJudged: number;
}

export interface NextMatch {
  time: string;
  roomNumber: string;
  motion: string;
  tournamentName: string;
  round: string;
  position?: string;
}

export interface StudentProfile extends BaseUserProfile {
  role: 'STUDENT';
  stats: StudentStats;
  nextMatch?: NextMatch;
}

export interface JudgeProfile extends BaseUserProfile {
  role: 'JUDGE';
  stats: JudgeStats;
  nextMatch?: NextMatch;
}

export type UserProfile = StudentProfile | JudgeProfile;
