-- Seed Data for Debate Management System
-- Password for all users: password123 (BCrypt encoded)

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Alex Thompson', 'organizer1', 35, 'Seasoned debate organizer with 10+ years of experience running national tournaments.', 'Colombo, Sri Lanka', 'organizer1@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NULL, NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'organizer1');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Priya Sharma', 'debater1', 21, 'Passionate debater specializing in Asian Parliamentary format. Won 3 regional tournaments.', 'Kandy, Sri Lanka', 'debater1@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'DEBATER', NULL, 'PUBLIC', 'en', NULL, NULL, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater1');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Ravi Kumar', 'debater2', 19, 'First-year debater with a passion for environmental topics and policy debates.', 'Galle, Sri Lanka', 'debater2@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater2');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Aisha Mohamed', 'debater3', 22, 'Experienced debater with strong skills in British Parliamentary. National finalist 2023.', 'Jaffna, Sri Lanka', 'debater3@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater3');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Kasun Perera', 'debater4', 20, 'Young but talented debater from Peradeniya University. Specializes in Sinhala debates.', 'Peradeniya, Sri Lanka', 'debater4@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater4');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Dr. Sarah Williams', 'judge1', 42, 'Former national debate champion. Certified judge for Asian Parliamentary and BP formats.', 'Colombo, Sri Lanka', 'judge1@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'JUDGE', NULL, 'PUBLIC', 'en', 'Asian Parliamentary, British Parliamentary', 15, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge1');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Prof. James Lee', 'judge2', 50, 'Professor of Communication Studies. Expert in rhetorical analysis and debate adjudication.', 'Colombo, Sri Lanka', 'judge2@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'JUDGE', NULL, 'PUBLIC', 'en', 'Traditional Debate, Asian Parliamentary', 20, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge2');

-- Seed debater stats
INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 15, 11, 4, 5, 2 FROM users u WHERE u.username = 'debater1'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds JOIN users u2 ON ds.debater_id = u2.id WHERE u2.username = 'debater1');

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 8, 5, 3, 2, 1 FROM users u WHERE u.username = 'debater2'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds JOIN users u2 ON ds.debater_id = u2.id WHERE u2.username = 'debater2');

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 20, 15, 5, 8, 3 FROM users u WHERE u.username = 'debater3'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds JOIN users u2 ON ds.debater_id = u2.id WHERE u2.username = 'debater3');

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 12, 7, 5, 3, 1 FROM users u WHERE u.username = 'debater4'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds JOIN users u2 ON ds.debater_id = u2.id WHERE u2.username = 'debater4');

-- Seed judge stats
INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 45 FROM users u WHERE u.username = 'judge1'
AND NOT EXISTS (SELECT 1 FROM judge_stats js JOIN users u2 ON js.judge_id = u2.id WHERE u2.username = 'judge1');

INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 62 FROM users u WHERE u.username = 'judge2'
AND NOT EXISTS (SELECT 1 FROM judge_stats js JOIN users u2 ON js.judge_id = u2.id WHERE u2.username = 'judge2');

-- Seed news posts
INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'National Debate Championship 2024 Announced',
  'LATEST_NEWS',
  'The National Debate Championship 2024 has been officially announced. Registration opens next month for all universities across the country. This year''s championship will feature Asian Parliamentary and British Parliamentary formats.',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
  (SELECT id FROM users WHERE username = 'organizer1' LIMIT 1),
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'National Debate Championship 2024 Announced');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'Debate Techniques: Mastering the Art of Rebuttal',
  'VLOGS',
  'In this comprehensive guide, we explore advanced rebuttal techniques used by champion debaters. Learn how to effectively counter your opponent''s arguments while maintaining logical coherence.',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800',
  (SELECT id FROM users WHERE username = 'organizer1' LIMIT 1),
  NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'Debate Techniques: Mastering the Art of Rebuttal');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'How Our Debate Club Changed My Life',
  'COMMUNITY_STORIES',
  'A heartfelt story from one of our members about how joining their university debate club transformed their confidence and communication skills. From shy freshman to national finalist in just two years.',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
  (SELECT id FROM users WHERE username = 'debater3' LIMIT 1),
  NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'How Our Debate Club Changed My Life');

-- Tamil author users for community stories
INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Bhaveenthan Thankajanikanth', 'bhaveenthank', 22, 'Debate enthusiast and tournament organizer from Jaffna. Passionate about growing the debate community in Northern Sri Lanka.', 'Jaffna, Sri Lanka', 'e22051@eng.pdn.ac.lk', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'bhaveenthank');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Karthikeyan Murugan', 'karthikeyan_m', 28, 'Senior debate coach and community advocate for youth debate programs across Sri Lanka.', 'Colombo, Sri Lanka', 'karthikeyan@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'karthikeyan_m');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Priyanka Selvam', 'priyanka_s', 25, 'Former national debate champion sharing stories of how debate transforms lives across communities.', 'Kandy, Sri Lanka', 'priyanka@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'priyanka_s');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Aarav Subramaniam', 'aarav_sub', 31, 'Debate educator and community storyteller. Documents the human side of competitive debate.', 'Trincomalee, Sri Lanka', 'aarav@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'aarav_sub');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Meenakshi Ramasamy', 'meenakshi_r', 27, 'Tournament director passionate about sharing community stories that inspire the next generation of debaters.', 'Matara, Sri Lanka', 'meenakshi@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'meenakshi_r');

-- Community Stories (2026)
INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'How Debate Gave Me the Confidence to Speak at My Own Graduation',
  'COMMUNITY_STORIES',
  'Three years ago, I could not speak in front of more than five people without my voice shaking. I was selected for our school debate team almost by accident — my teacher put my name on the list because I had missed the sign-up deadline and she needed one more member. That first tournament was a disaster. I froze mid-speech, lost every round, and cried in the bathroom between sessions. But my coach told me something I have never forgotten: the fear does not go away, you just get better at speaking through it. By my second year, I was reaching quarter-finals. By my third, I was selected for the national team. Last month, I delivered the student address at our university graduation in front of 3,000 people. I did not shake once. Debate did not just teach me to argue — it taught me that my voice is worth hearing.',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
  (SELECT id FROM users WHERE username = 'bhaveenthank' LIMIT 1),
  TIMESTAMP '2026-01-15 08:30:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'How Debate Gave Me the Confidence to Speak at My Own Graduation');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'From a Village School in Vavuniya to the National Debate Finals',
  'COMMUNITY_STORIES',
  'Our school in Vavuniya did not have a debate team when I arrived in Year 10. We did not have a coach, a trophy cabinet, or even a proper stage. What we had was a passionate English teacher named Mr. Shanmugam, who had debated in university twenty years ago and believed that every student deserved the chance to find their voice. He started our debate club with seven students in a borrowed classroom. By the end of that year, we had eighteen members and had entered our first regional tournament. We lost every round but came back the following year with a clearer understanding of what we were doing. In 2026, four years after that first meeting in the borrowed classroom, our school reached the national finals for the first time in its history. Mr. Shanmugam was in the front row.',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
  (SELECT id FROM users WHERE username = 'karthikeyan_m' LIMIT 1),
  TIMESTAMP '2026-02-01 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'From a Village School in Vavuniya to the National Debate Finals');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'The Tournament That Brought Two Rival Schools Together',
  'COMMUNITY_STORIES',
  'St. Joseph''s and Holy Cross had not spoken civilly to each other at any inter-school event for eleven years. The rivalry was legendary — rooted in a disputed cricket match result that had grown into something far bigger and uglier over the years. When the regional debate draw placed them against each other in the semi-finals of the 2026 Northern Province Championships, both schools arrived braced for conflict. What happened instead was something none of us expected. The round — on the motion "This House Would prioritize reconciliation over accountability in post-conflict societies" — was the most substantive and respectful debate I have judged in fifteen years. After adjudication, both teams stayed behind to continue the conversation. The captains exchanged numbers. Three weeks later, they held a joint practice session. Debate did what sports could not.',
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800',
  (SELECT id FROM users WHERE username = 'priyanka_s' LIMIT 1),
  TIMESTAMP '2026-02-18 13:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'The Tournament That Brought Two Rival Schools Together');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'Why I Started a Free Debate Club in My Neighbourhood',
  'COMMUNITY_STORIES',
  'I grew up in Kilinochchi and had never heard of competitive debate until I was 17. By the time I discovered it, most of my peers had already spent years in well-funded school debate programs in Colombo. The gap felt impossible to close. But instead of giving up, I decided to close the gap for the next generation. In January 2026, I launched a free Saturday debate club for students aged 12 to 18 in my neighbourhood. We meet every week in the community hall, with no registration fee, no uniform requirement, and no pressure. In three months, we have gone from 8 students to 34. Two of our members competed in their first ever tournament last month. One of them won best speaker in their bracket. I am not trying to create champions. I am trying to make sure that geography and income do not determine who gets to learn how to think and speak.',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800',
  (SELECT id FROM users WHERE username = 'aarav_sub' LIMIT 1),
  TIMESTAMP '2026-03-10 09:30:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'Why I Started a Free Debate Club in My Neighbourhood');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'She Started Debating at 40 — And Won Her Category at Regionals',
  'COMMUNITY_STORIES',
  'Nirmala Krishnaswamy had spent twenty years wishing she had joined the debate team at school. She had watched her daughter compete for three seasons, sitting in the audience thinking "I could have done that." At 40, working full time as a nurse and raising two children, she signed up for the Open Adult Debate League that launched in Colombo in early 2026. Her husband thought she was joking. Her daughter thought it was brilliant. Nirmala trained every Sunday for four months, watching recorded rounds online during her night shifts, arguing motions with anyone willing to listen. In April 2026, she competed in the inaugural Open Adult Regionals and won the 35-and-above category, beating participants from legal and academic backgrounds. Her best speaker citation read: "Unshakeable clarity and a warmth that made the audience feel every word."',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
  (SELECT id FROM users WHERE username = 'meenakshi_r' LIMIT 1),
  TIMESTAMP '2026-04-10 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'She Started Debating at 40 — And Won Her Category at Regionals');
