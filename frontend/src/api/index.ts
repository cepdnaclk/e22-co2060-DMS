import api from './axios';
import type {
  User, Tournament, Match, Notification, DiscussionComment,
  DebaterStats, NewsPost, CalendarEvent, SearchResult,
  SchoolLeaderboardEntry, ScoreSheetTemplate
} from '../types';

// Auth
export const authAPI = {
  signup: (data: object) => api.post('/auth/signup', data),
  login: (data: object) => api.post<{ token: string; user: User }>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

// Users
export const usersAPI = {
  getById: (id: number) => api.get<User>(`/users/${id}`),
  update: (id: number, data: Partial<User>) => api.put<User>(`/users/${id}`, data),
  uploadProfilePicture: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Do NOT set Content-Type manually — Axios sets multipart/form-data with the
    // correct boundary automatically when the body is a FormData object.
    return api.post<User>(`/users/${id}/profile-picture`, formData);
  },
  searchDebaters: (query: string) => api.get<User[]>(`/users/debaters/search?query=${encodeURIComponent(query)}`),
  searchJudges: (query: string) => api.get<User[]>(`/users/judges/search?query=${encodeURIComponent(query)}`),
  getTopDebaters: () => api.get<DebaterStats[]>('/users/top-debaters'),
  getOrganizers: () => api.get<User[]>('/users/organizers'),
};

// Search
export const searchAPI = {
  search: (query: string) => api.get<SearchResult>(`/search?query=${encodeURIComponent(query)}`),
};

// Tournaments
export const tournamentsAPI = {
  create: (data: object) => api.post<Tournament>('/tournaments', data),
  getAll: () => api.get<Tournament[]>('/tournaments'),
  getById: (id: number) => api.get<Tournament>(`/tournaments/${id}`),
  getByOrganizer: (organizerId: number) => api.get<Tournament[]>(`/tournaments/organizer/${organizerId}`),
  delete: (id: number) => api.delete(`/tournaments/${id}`),
  addJudge: (tournamentId: number, judgeId: number) =>
    api.post(`/tournaments/${tournamentId}/judges`, { judgeId }),
  getJudges: (tournamentId: number) => api.get(`/tournaments/${tournamentId}/judges`),
};

// Matches
export const matchesAPI = {
  create: (data: object) => api.post<Match>('/matches', data),
  getById: (id: number) => api.get<Match>(`/matches/${id}`),
  getByTournament: (tournamentId: number) => api.get<Match[]>(`/tournaments/${tournamentId}/matches`),
  getLive: () => api.get<Match[]>('/matches/live'),
  generateNextRound: (tournamentId: number) =>
    api.post(`/tournaments/${tournamentId}/generate-next-round`),
};

// Score Sheets
export const scoreSheetsAPI = {
  getTemplate: (tournamentId: number) =>
    api.get<ScoreSheetTemplate>(`/score-templates/${tournamentId}`),
  saveTemplate: (data: object) => api.post('/score-templates', data),
  getSubmission: (matchId: number, judgeId: number) =>
    api.get(`/score-sheets/${matchId}/${judgeId}`),
  submit: (data: object) => api.post('/score-sheets/submit', data),
  reopen: (id: number) => api.post(`/score-sheets/${id}/reopen`),
};

// Stats
export const statsAPI = {
  getDebaterStats: (id: number) => api.get<DebaterStats>(`/stats/debater/${id}`),
  getJudgeStats: (id: number) => api.get<{ judgeId: number; matchesJudged: number }>(`/stats/judge/${id}`),
  getLeaderboard: (tournamentId: number) =>
    api.get<SchoolLeaderboardEntry[]>(`/tournaments/${tournamentId}/leaderboard`),
};

// Discussion
export const discussionAPI = {
  getComments: (tournamentId: number) =>
    api.get<DiscussionComment[]>(`/tournaments/${tournamentId}/discussion`),
  addComment: (data: object) => api.post<DiscussionComment>('/discussion', data),
  delete: (id: number) => api.delete(`/discussion/${id}`),
  reply: (id: number, data: object) => api.post<DiscussionComment>(`/discussion/${id}/reply`, data),
};

// Notifications
export const notificationsAPI = {
  getAll: () => api.get<Notification[]>('/notifications'),
  markRead: (id: number) => api.put(`/notifications/${id}/read`),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count'),
};

// Calendar
export const calendarAPI = {
  getEvents: () => api.get<CalendarEvent[]>('/calendar'),
  createEvent: (data: object) => api.post<CalendarEvent>('/calendar', data),
  toggleReminder: (id: number) => api.put<CalendarEvent>(`/calendar/${id}/reminder`),
};

// News
export const newsAPI = {
  getAll: () => api.get<NewsPost[]>('/news'),
  create: (data: object) => api.post<NewsPost>('/news', data),
};
