-- Seed Data for Debate Management System
-- Password for all users: password123 (BCrypt encoded)

-- ===================== ORGANIZERS (3) =====================
INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Organizer1', 'organizer1', 35, 'Seasoned debate organizer with 10+ years of experience running national tournaments.', 'Colombo, Sri Lanka', 'organizer1@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'organizer1');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Organizer2', 'organizer2', 40, 'University debate coordinator and regional tournament director with a passion for youth development.', 'Kandy, Sri Lanka', 'organizer2@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'organizer2');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Organizer3', 'organizer3', 38, 'International debate event planner specializing in Asian Parliamentary and World Schools formats.', 'Galle, Sri Lanka', 'organizer3@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'organizer3');

-- ===================== DEBATERS (10) =====================
INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater1', 'debater1', 21, 'Passionate debater specializing in Asian Parliamentary format. Won 3 regional tournaments.', 'Kandy, Sri Lanka', 'debater1@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater1');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater2', 'debater2', 19, 'First-year debater with a passion for environmental topics and policy debates.', 'Galle, Sri Lanka', 'debater2@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater2');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater3', 'debater3', 22, 'Experienced debater with strong skills in British Parliamentary. National finalist 2023.', 'Jaffna, Sri Lanka', 'debater3@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater3');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater4', 'debater4', 20, 'Young but talented debater from Peradeniya University. Specializes in Sinhala debates.', 'Peradeniya, Sri Lanka', 'debater4@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater4');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater5', 'debater5', 23, 'Senior debater and team captain at Moratuwa University. Multiple tournament winner.', 'Moratuwa, Sri Lanka', 'debater5@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater5');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater6', 'debater6', 18, 'Freshman debater eager to learn and compete. Interested in economics and social justice topics.', 'Matara, Sri Lanka', 'debater6@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater6');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater7', 'debater7', 21, 'Bilingual debater fluent in English and Tamil. Competed in 12 national tournaments.', 'Batticaloa, Sri Lanka', 'debater7@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater7');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater8', 'debater8', 20, 'Philosophy student with excellent argumentation skills. Best speaker at Inter-University Debate 2024.', 'Colombo, Sri Lanka', 'debater8@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater8');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater9', 'debater9', 22, 'Law student and competitive debater. Specializes in legal and constitutional debates.', 'Negombo, Sri Lanka', 'debater9@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater9');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Debater10', 'debater10', 19, 'Engineering student who brings analytical thinking to every debate. Rising star in the circuit.', 'Kurunegala, Sri Lanka', 'debater10@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'DEBATER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'debater10');

-- ===================== JUDGES (5) =====================
INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Judge1', 'judge1', 42, 'Former national debate champion. Certified judge for Asian Parliamentary and BP formats.', 'Colombo, Sri Lanka', 'judge1@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'JUDGE', NULL, 'PUBLIC', 'en', 'Asian Parliamentary, British Parliamentary', 15, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge1');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Judge2', 'judge2', 50, 'Professor of Communication Studies. Expert in rhetorical analysis and debate adjudication.', 'Colombo, Sri Lanka', 'judge2@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'JUDGE', NULL, 'PUBLIC', 'en', 'Traditional Debate, Asian Parliamentary', 20, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge2');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Judge3', 'judge3', 38, 'Practicing lawyer and debate coach. Specializes in World Schools and Lincoln-Douglas formats.', 'Kandy, Sri Lanka', 'judge3@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'JUDGE', NULL, 'PUBLIC', 'en', 'World Schools, Lincoln-Douglas', 10, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge3');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Judge4', 'judge4', 45, 'Senior lecturer in Political Science. Experienced in policy debate and public forum adjudication.', 'Galle, Sri Lanka', 'judge4@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'JUDGE', NULL, 'PUBLIC', 'en', 'Policy Debate, Public Forum', 18, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge4');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, expertise, years_of_experience, created_at)
SELECT 'Judge5', 'judge5', 36, 'Journalist and media trainer. Brings real-world communication expertise to debate adjudication.', 'Jaffna, Sri Lanka', 'judge5@dms.com', '$2a$10$rJLvrCnSjgJhhyTkKeuY2egjmVdNpx3BaCTadBCdnP/wq3YSiIw76', 'JUDGE', NULL, 'PUBLIC', 'en', 'British Parliamentary, Asian Parliamentary', 8, NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'judge5');

-- ===================== DEBATER STATS =====================
INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 15, 11, 4, 5, 2 FROM users u WHERE u.username = 'debater1'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 8, 5, 3, 2, 1 FROM users u WHERE u.username = 'debater2'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 20, 15, 5, 8, 3 FROM users u WHERE u.username = 'debater3'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 12, 7, 5, 3, 1 FROM users u WHERE u.username = 'debater4'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 18, 13, 5, 6, 2 FROM users u WHERE u.username = 'debater5'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 5, 3, 2, 1, 0 FROM users u WHERE u.username = 'debater6'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 14, 9, 5, 4, 1 FROM users u WHERE u.username = 'debater7'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 10, 7, 3, 3, 1 FROM users u WHERE u.username = 'debater8'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 16, 10, 6, 5, 2 FROM users u WHERE u.username = 'debater9'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

INSERT INTO debater_stats (debater_id, matches_played, wins, losses, player_of_match_count, best_debater_tournament_count)
SELECT u.id, 6, 4, 2, 2, 0 FROM users u WHERE u.username = 'debater10'
AND NOT EXISTS (SELECT 1 FROM debater_stats ds WHERE ds.debater_id = u.id);

-- ===================== JUDGE STATS =====================
INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 45 FROM users u WHERE u.username = 'judge1'
AND NOT EXISTS (SELECT 1 FROM judge_stats js WHERE js.judge_id = u.id);

INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 62 FROM users u WHERE u.username = 'judge2'
AND NOT EXISTS (SELECT 1 FROM judge_stats js WHERE js.judge_id = u.id);

INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 30 FROM users u WHERE u.username = 'judge3'
AND NOT EXISTS (SELECT 1 FROM judge_stats js WHERE js.judge_id = u.id);

INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 55 FROM users u WHERE u.username = 'judge4'
AND NOT EXISTS (SELECT 1 FROM judge_stats js WHERE js.judge_id = u.id);

INSERT INTO judge_stats (judge_id, matches_judged)
SELECT u.id, 22 FROM users u WHERE u.username = 'judge5'
AND NOT EXISTS (SELECT 1 FROM judge_stats js WHERE js.judge_id = u.id);

-- ===================== NEWS POSTS =====================
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
  (SELECT id FROM users WHERE username = 'organizer2' LIMIT 1),
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

-- Tamil author users for news content
INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Bhaveenthan Thankajanikanth', 'bhaveenthank', 22, 'Debate enthusiast and tournament organizer from Jaffna. Passionate about growing the debate community in Northern Sri Lanka.', 'Jaffna, Sri Lanka', 'e22051@eng.pdn.ac.lk', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'bhaveenthank');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Karthikeyan Murugan', 'karthikeyan_m', 28, 'Senior debate coach and journalist covering competitive debate circuits across South Asia.', 'Colombo, Sri Lanka', 'karthikeyan@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'karthikeyan_m');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Priyanka Selvam', 'priyanka_s', 25, 'Debate analyst and former national champion. Writes about debate strategy and tournament formats.', 'Kandy, Sri Lanka', 'priyanka@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'priyanka_s');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Aarav Subramaniam', 'aarav_sub', 31, 'Debate researcher and educator. Focuses on policy debate and its role in youth development.', 'Trincomalee, Sri Lanka', 'aarav@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'aarav_sub');

INSERT INTO users (full_name, username, age, bio, location, email, password_hash, role, profile_picture_url, privacy_status, language, created_at)
SELECT 'Meenakshi Ramasamy', 'meenakshi_r', 27, 'Tournament director and debate advocate. Has organized over 30 inter-school debate events.', 'Matara, Sri Lanka', 'meenakshi@dms.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EH0xP5u/1Ksg4YVPC.Ja.', 'ORGANIZER', NULL, 'PUBLIC', 'en', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'meenakshi_r');

-- Latest News (2026)
INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'Asia Pacific Debate Championship 2026 to Be Hosted in Colombo',
  'LATEST_NEWS',
  'Sri Lanka has been selected as the host nation for the Asia Pacific Debate Championship 2026, with Colombo set to welcome over 400 debaters from 28 countries this August. The University of Colombo will serve as the main venue. This marks the first time Sri Lanka has hosted the prestigious tournament, which will feature Asian Parliamentary, British Parliamentary, and World Schools formats across five days of intense competition. Organizers have confirmed that online registration opens on 15 February 2026.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  (SELECT id FROM users WHERE username = 'bhaveenthank' LIMIT 1),
  TIMESTAMP '2026-01-10 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'Asia Pacific Debate Championship 2026 to Be Hosted in Colombo');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'Sri Lanka National Schools Debate League 2026 Announces Record 312 Registrations',
  'LATEST_NEWS',
  'The Sri Lanka National Schools Debate League has received a record 312 school registrations for its 2026 season, up from 240 last year. The league, which runs from March to November, will be divided into six regional divisions before culminating in a national final in Colombo. The Ministry of Education has officially endorsed the league this year, pledging to provide funding for transportation costs for schools from remote districts. The league director confirmed that Tamil-medium and Sinhala-medium debate streams will both be expanded.',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
  (SELECT id FROM users WHERE username = 'karthikeyan_m' LIMIT 1),
  TIMESTAMP '2026-02-03 11:30:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'Sri Lanka National Schools Debate League 2026 Announces Record 312 Registrations');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'University of Peradeniya Wins South Asian Universities Debate Cup 2026',
  'LATEST_NEWS',
  'The University of Peradeniya debate team clinched the South Asian Universities Debate Cup 2026 held in Dhaka, Bangladesh, defeating the University of Delhi in a tightly contested final on the motion "This House Would introduce mandatory national service for university graduates." The Peradeniya team, comprising Nithyaa Krishnaswamy and Roshan Perera, received a standing ovation from the 600-strong audience. This is Peradeniya''s third SADC title. The best speaker award was jointly given to both finalists in recognition of an exceptionally high-quality final round.',
  'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800',
  (SELECT id FROM users WHERE username = 'priyanka_s' LIMIT 1),
  TIMESTAMP '2026-02-21 14:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'University of Peradeniya Wins South Asian Universities Debate Cup 2026');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'World Schools Debating Championships 2026 Motion List Released',
  'LATEST_NEWS',
  'The World Schools Debating Championships (WSDC) 2026, to be held in Cape Town, South Africa in July, has released its preparatory motion list covering seven key topic areas: climate justice, digital rights, economic inequality, health policy, conflict resolution, education reform, and democratic governance. Sri Lanka''s national team, selected through a rigorous four-round national trial held in January, will begin their coaching camp in March. The team is coached by former WSDC finalist Dr. Ananthan Sivakumar and has been allocated three international training scrimmages with teams from Australia, Canada, and Singapore.',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800',
  (SELECT id FROM users WHERE username = 'aarav_sub' LIMIT 1),
  TIMESTAMP '2026-03-05 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'World Schools Debating Championships 2026 Motion List Released');

INSERT INTO news_posts (title, category, content, image_url, author_id, created_at)
SELECT
  'Debate Management System Launched to Modernize Tournament Administration Across Sri Lanka',
  'LATEST_NEWS',
  'A new digital Debate Management System (DMS) has been officially launched to streamline how debate tournaments are organized, judged, and scored across Sri Lanka. The platform, developed by students of the University of Peradeniya, replaces the traditional paper-based processes that have long slowed tournament operations. DMS supports role-based access for organizers, judges, and debaters, with features including automated round generation, digital score sheets, live leaderboards, and a built-in notification system. The platform has already been piloted at three tournaments with over 200 participants and received overwhelmingly positive feedback from tournament directors.',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  (SELECT id FROM users WHERE username = 'meenakshi_r' LIMIT 1),
  TIMESTAMP '2026-04-01 08:00:00'
WHERE NOT EXISTS (SELECT 1 FROM news_posts WHERE title = 'Debate Management System Launched to Modernize Tournament Administration Across Sri Lanka');
