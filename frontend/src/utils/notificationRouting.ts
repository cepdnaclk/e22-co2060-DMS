import type { Notification } from '../types';

/**
 * Determines the appropriate navigation route for a given notification.
 *
 * Route logic:
 * - If the notification has an explicit matchId → /tournament/{tournamentId} (match lives inside tournament page)
 * - If the notification has an explicit tournamentId → /tournament/{tournamentId}
 * - Otherwise, parse the notification title/message for known patterns:
 *   - matchCode like "MATCH-{tournamentId}-..." → extract tournamentId
 *   - Tournament-related titles → /notifications (fallback since we don't have the ID)
 */
export function getNotificationRoute(n: Notification): string | null {
  // 1. Explicit IDs provided by the backend
  if (n.matchId && n.tournamentId) {
    return `/tournament/${n.tournamentId}`;
  }
  if (n.tournamentId) {
    return `/tournament/${n.tournamentId}`;
  }

  // 2. Parse matchCode from the message (format: "MATCH-{tournamentId}-{number}")
  const matchCodePattern = /MATCH-(\d+)-/;
  const messageMatch = n.message?.match(matchCodePattern);
  if (messageMatch) {
    const tournamentId = messageMatch[1];
    return `/tournament/${tournamentId}`;
  }

  // 3. Parse tournament name from "Tournament Created" messages
  //    Message format: "Your tournament '...' has been created successfully!"
  //    Unfortunately we can't get the ID from the name alone, so fall back
  if (n.title === 'Tournament Created') {
    return '/notifications';
  }

  // 4. Default fallback — go to notifications page
  return '/notifications';
}
