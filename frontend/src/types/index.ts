export type Role = 'DEBATER' | 'JUDGE' | 'ORGANIZER';

export interface User {
  id: number;
  fullName: string;
  username: string;
  age?: number;
  bio?: string;
  location?: string;
  email: string;
  role: Role;
  profilePictureUrl?: string;
  socialLinksJson?: string;
  privacyStatus: 'PUBLIC' | 'PRIVATE';
  language: string;
  expertise?: string;
  yearsOfExperience?: number;
  createdAt?: string;
}

export interface Tournament {
  id: number;
  name: string;
  debateType: DebateType;
  customDebateType?: string;
  tournamentType: 'LEAGUE' | 'KNOCKOUT';
  organizer: User;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  numberOfLeagues?: number;
  createdAt: string;
  schools?: School[];
  judges?: TournamentJudge[];
}

export type DebateType =
  | 'TRADITIONAL'
  | 'ASIAN_PARLIAMENTARY'
  | 'BRITISH_PARLIAMENTARY'
  | 'SULALUM_SOTPOR'
  | 'VAZHAKAADU_MANDRAM'
  | 'OTHER';

export interface School {
  id: number;
  name: string;
  tournamentId: number;
  debaters?: User[];
}

export interface TournamentJudge {
  id: number;
  judge: User;
  judgeCode: string;
}

export interface Match {
  id: number;
  matchCode: string;
  tournamentId: number;
  tournamentName: string;
  propositionSchool: School;
  oppositionSchool: School;
  topic: string;
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  winnerSchool?: School;
  bestSpeaker?: User;
  roundNumber: number;
  createdAt: string;
  startTime?: string;
  judges?: MatchJudge[];
}

export interface MatchJudge {
  id: number;
  judge: User;
  scoreSheetLink: string;
  submitted: boolean;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
  matchId?: number;
  tournamentId?: number;
}

export interface DiscussionComment {
  id: number;
  tournamentId: number;
  matchId?: number;
  user: User;
  comment: string;
  createdAt: string;
  replies?: DiscussionComment[];
}

export interface DebaterStats {
  debaterId: number;
  fullName: string;
  username: string;
  profilePictureUrl?: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  playerOfMatchCount: number;
  bestDebaterTournamentCount: number;
  winRate: number;
}

export interface NewsPost {
  id: number;
  title: string;
  category: 'LATEST_NEWS' | 'VLOGS' | 'COMMUNITY_STORIES';
  content: string;
  imageUrl?: string;
  authorName?: string;
  authorId?: number;
  createdAt: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  eventType: 'MATCH' | 'TOURNAMENT' | 'JUDGING_ASSIGNMENT' | 'OTHER';
  startTime: string;
  endTime?: string;
  reminderEnabled: boolean;
  colorCode?: string;
}

export interface SearchResult {
  players: User[];
  tournaments: Tournament[];
  organizers: User[];
}

export interface SchoolLeaderboardEntry {
  schoolId: number;
  schoolName: string;
  played: number;
  wins: number;
  losses: number;
  points: number;
  winRate: number;
}

export interface ScoreSheetTemplate {
  id: number;
  tournamentId: number;
  name: string;
  criteriaJson: string;
  createdAt: string;
}

export interface ScoreCriteria {
  name: string;
  maxMarks: number;
}

export interface MessageDTO {
  id: number;
  senderId: number;
  receiverId: number;
  text: string;
  createdAt: string;
}

