-- Team Manager — test data seed script
-- Run: kubectl exec -i -n team-manager postgres-0 -- psql -U team-manager -d team-manager < scripts/seed-test-data.sql
-- All seed accounts use password: Seed@1234
--
-- Fixed IDs (never change):
--   Owner  (ozanzal@foo.local)  a337dff4-8b0a-4dcf-af99-a884ddb55da1
--   Claudes                     507a33cd-2c4a-4a89-83db-dac51e9f548f
--   Codexes                     fcd0b6c7-c9ed-4296-a112-cffd42287ed6
--   Copilots                    936f9604-ecc8-4d46-bd8c-2b4881b33de9

BEGIN;

-- ============================================================
-- 0. CLEAN UP — drop all previously seeded data for these teams
-- ============================================================
DO $$
DECLARE
  cl  uuid := '507a33cd-2c4a-4a89-83db-dac51e9f548f';
  cd  uuid := 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6';
  co  uuid := '936f9604-ecc8-4d46-bd8c-2b4881b33de9';
  own uuid := 'a337dff4-8b0a-4dcf-af99-a884ddb55da1';
BEGIN
  DELETE FROM attendance_records
    WHERE event_id IN (SELECT id FROM events WHERE team_id IN (cl, cd, co));
  DELETE FROM rsvp
    WHERE event_id IN (SELECT id FROM events WHERE team_id IN (cl, cd, co));
  DELETE FROM game_results
    WHERE event_id IN (SELECT id FROM events WHERE team_id IN (cl, cd, co));
  DELETE FROM notifications
    WHERE user_id = own AND team_id IN (cl, cd, co);
  DELETE FROM invites
    WHERE team_id IN (cl, cd, co) AND created_by = own;
  DELETE FROM announcements
    WHERE team_id IN (cl, cd, co);
  DELETE FROM season_records
    WHERE season_id IN (SELECT id FROM seasons WHERE team_id IN (cl, cd, co));
  DELETE FROM events
    WHERE team_id IN (cl, cd, co);
  DELETE FROM seasons
    WHERE team_id IN (cl, cd, co);
  DELETE FROM parent_player_links
    WHERE roster_entry_id IN (SELECT id FROM roster_entries WHERE team_id IN (cl, cd, co));
  DELETE FROM roster_entries
    WHERE team_id IN (cl, cd, co);
  DELETE FROM memberships
    WHERE team_id IN (cl, cd, co) AND user_id != own;
  DELETE FROM users
    WHERE email LIKE '%@foo.local' AND email != 'ozanzal@foo.local';
END;
$$;

-- ============================================================
-- 1. USERS  (password = Seed@1234 for all)
-- ============================================================
INSERT INTO users (email, "displayName", "passwordHash") VALUES
-- Staff
('jmitchell@foo.local',  'James Mitchell',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('rkim@foo.local',       'Rachel Kim',        '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('mthompson@foo.local',  'Marcus Thompson',  '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('jadams@foo.local',     'Jennifer Adams',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('sanderson@foo.local',  'Steve Anderson',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('dmurphy@foo.local',    'Diane Murphy',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
-- Claudes players
('ltorres@foo.local',    'Liam Torres',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('nrivera@foo.local',    'Noah Rivera',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('edavis@foo.local',     'Emma Davis',       '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('omartinez@foo.local',  'Olivia Martinez',  '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('ajohnson@foo.local',   'Aiden Johnson',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('ithompson@foo.local',  'Isabella Thompson','$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('mlee@foo.local',       'Mason Lee',        '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('swilson@foo.local',    'Sophia Wilson',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
-- Codexes players
('ebrown@foo.local',     'Ethan Brown',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('jgarcia@foo.local',    'Jackson Garcia',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('awhite@foo.local',     'Amelia White',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('lharris@foo.local',    'Lucas Harris',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('cclark@foo.local',     'Charlotte Clark',  '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('blewis@foo.local',     'Benjamin Lewis',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('hrobinson@foo.local',  'Harper Robinson',  '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('ewalker@foo.local',    'Elijah Walker',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
-- Copilots players
('rscott@foo.local',     'Ryan Scott',       '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('ngreen@foo.local',     'Natalie Green',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('dbaker@foo.local',     'Dylan Baker',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('znelson@foo.local',    'Zoe Nelson',       '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('ccarter@foo.local',    'Caleb Carter',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('lmitchell@foo.local',  'Lily Mitchell',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('jperez@foo.local',     'Jack Perez',       '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('croberts@foo.local',   'Chloe Roberts',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
-- Parents
('ctorres@foo.local',    'Carlos Torres',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('adavis@foo.local',     'Angela Davis',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('kjohnson@foo.local',   'Kevin Johnson',    '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('llee@foo.local',       'Linda Lee',        '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('dbrown2@foo.local',    'David Brown',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('pgarcia@foo.local',    'Patricia Garcia',  '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('nharris@foo.local',    'Nancy Harris',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('plewis@foo.local',     'Patricia Lewis',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('fscott@foo.local',     'Frank Scott',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('hgreen@foo.local',     'Helen Green',      '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('gbaker@foo.local',     'George Baker',     '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy'),
('rcarter@foo.local',    'Rebecca Carter',   '$2b$12$XX8drBY/SoraaPGoU0.iauti55aFPKjoGNPyTRPKLwydS6axWJxEy');

-- ============================================================
-- 2. MEMBERSHIPS
-- ============================================================
-- Claudes
INSERT INTO memberships (team_id, user_id, role)
SELECT '507a33cd-2c4a-4a89-83db-dac51e9f548f', id, r.role::team_role
FROM users, (VALUES
  ('jmitchell@foo.local',  'ASSISTANT_COACH'),
  ('rkim@foo.local',        'TEAM_MANAGER'),
  ('ltorres@foo.local',     'PLAYER'),
  ('nrivera@foo.local',     'PLAYER'),
  ('edavis@foo.local',      'PLAYER'),
  ('omartinez@foo.local',   'PLAYER'),
  ('ajohnson@foo.local',    'PLAYER'),
  ('ithompson@foo.local',   'PLAYER'),
  ('mlee@foo.local',        'PLAYER'),
  ('swilson@foo.local',     'PLAYER'),
  ('ctorres@foo.local',     'PARENT'),
  ('adavis@foo.local',      'PARENT'),
  ('kjohnson@foo.local',    'PARENT'),
  ('llee@foo.local',        'PARENT')
) AS r(email, role)
WHERE users.email = r.email;

-- Codexes
INSERT INTO memberships (team_id, user_id, role)
SELECT 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6', id, r.role::team_role
FROM users, (VALUES
  ('mthompson@foo.local',   'ASSISTANT_COACH'),
  ('jadams@foo.local',      'TEAM_MANAGER'),
  ('ebrown@foo.local',      'PLAYER'),
  ('jgarcia@foo.local',     'PLAYER'),
  ('awhite@foo.local',      'PLAYER'),
  ('lharris@foo.local',     'PLAYER'),
  ('cclark@foo.local',      'PLAYER'),
  ('blewis@foo.local',      'PLAYER'),
  ('hrobinson@foo.local',   'PLAYER'),
  ('ewalker@foo.local',     'PLAYER'),
  ('dbrown2@foo.local',     'PARENT'),
  ('pgarcia@foo.local',     'PARENT'),
  ('nharris@foo.local',     'PARENT'),
  ('plewis@foo.local',      'PARENT')
) AS r(email, role)
WHERE users.email = r.email;

-- Copilots
INSERT INTO memberships (team_id, user_id, role)
SELECT '936f9604-ecc8-4d46-bd8c-2b4881b33de9', id, r.role::team_role
FROM users, (VALUES
  ('sanderson@foo.local',   'ASSISTANT_COACH'),
  ('dmurphy@foo.local',     'TEAM_MANAGER'),
  ('rscott@foo.local',      'PLAYER'),
  ('ngreen@foo.local',      'PLAYER'),
  ('dbaker@foo.local',      'PLAYER'),
  ('znelson@foo.local',     'PLAYER'),
  ('ccarter@foo.local',     'PLAYER'),
  ('lmitchell@foo.local',   'PLAYER'),
  ('jperez@foo.local',      'PLAYER'),
  ('croberts@foo.local',    'PLAYER'),
  ('fscott@foo.local',      'PARENT'),
  ('hgreen@foo.local',      'PARENT'),
  ('gbaker@foo.local',      'PARENT'),
  ('rcarter@foo.local',     'PARENT')
) AS r(email, role)
WHERE users.email = r.email;

-- ============================================================
-- 3. ROSTER ENTRIES
-- ============================================================
-- Claudes (basketball positions)
INSERT INTO roster_entries (team_id, user_id, display_name, jersey_number, position)
SELECT '507a33cd-2c4a-4a89-83db-dac51e9f548f', u.id, r.name, r.num, r.pos
FROM (VALUES
  ('ltorres@foo.local',   'Liam Torres',       '10', 'Point Guard'),
  ('nrivera@foo.local',   'Noah Rivera',       '23', 'Shooting Guard'),
  ('edavis@foo.local',    'Emma Davis',        '14', 'Small Forward'),
  ('omartinez@foo.local', 'Olivia Martinez',   '32', 'Power Forward'),
  ('ajohnson@foo.local',  'Aiden Johnson',      '5', 'Center'),
  ('ithompson@foo.local', 'Isabella Thompson', '11', 'Point Guard'),
  ('mlee@foo.local',      'Mason Lee',         '20', 'Shooting Guard'),
  ('swilson@foo.local',   'Sophia Wilson',     '33', 'Small Forward')
) AS r(email, name, num, pos)
LEFT JOIN users u ON u.email = r.email;

INSERT INTO roster_entries (team_id, user_id, display_name, jersey_number, position) VALUES
('507a33cd-2c4a-4a89-83db-dac51e9f548f', NULL, 'Tyler Chen',   '44', 'Center'),
('507a33cd-2c4a-4a89-83db-dac51e9f548f', NULL, 'Ava Rodriguez', '7', 'Power Forward'),
('507a33cd-2c4a-4a89-83db-dac51e9f548f', NULL, 'Logan Kim',    '15', 'Shooting Guard'),
('507a33cd-2c4a-4a89-83db-dac51e9f548f', NULL, 'Mia Patel',    '28', 'Point Guard');

-- Codexes (soccer positions)
INSERT INTO roster_entries (team_id, user_id, display_name, jersey_number, position)
SELECT 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6', u.id, r.name, r.num, r.pos
FROM (VALUES
  ('ebrown@foo.local',    'Ethan Brown',      '1',  'Goalkeeper'),
  ('jgarcia@foo.local',   'Jackson Garcia',   '4',  'Defender'),
  ('awhite@foo.local',    'Amelia White',     '6',  'Defender'),
  ('lharris@foo.local',   'Lucas Harris',     '8',  'Midfielder'),
  ('cclark@foo.local',    'Charlotte Clark',  '12', 'Midfielder'),
  ('blewis@foo.local',    'Benjamin Lewis',   '9',  'Forward'),
  ('hrobinson@foo.local', 'Harper Robinson',  '11', 'Forward'),
  ('ewalker@foo.local',   'Elijah Walker',    '31', 'Goalkeeper')
) AS r(email, name, num, pos)
LEFT JOIN users u ON u.email = r.email;

INSERT INTO roster_entries (team_id, user_id, display_name, jersey_number, position) VALUES
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', NULL, 'Avery Hall',     '3',  'Defender'),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', NULL, 'Daniel Young',   '17', 'Midfielder'),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', NULL, 'Scarlett Allen', '22', 'Forward'),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', NULL, 'Owen King',      '19', 'Midfielder');

-- Copilots (mixed positions)
INSERT INTO roster_entries (team_id, user_id, display_name, jersey_number, position)
SELECT '936f9604-ecc8-4d46-bd8c-2b4881b33de9', u.id, r.name, r.num, r.pos
FROM (VALUES
  ('rscott@foo.local',    'Ryan Scott',      '21', 'Forward'),
  ('ngreen@foo.local',    'Natalie Green',   '16', 'Midfielder'),
  ('dbaker@foo.local',    'Dylan Baker',      '7', 'Defender'),
  ('znelson@foo.local',   'Zoe Nelson',      '13', 'Forward'),
  ('ccarter@foo.local',   'Caleb Carter',    '30', 'Goalkeeper'),
  ('lmitchell@foo.local', 'Lily Mitchell',   '18', 'Midfielder'),
  ('jperez@foo.local',    'Jack Perez',      '25', 'Defender'),
  ('croberts@foo.local',  'Chloe Roberts',    '8', 'Forward')
) AS r(email, name, num, pos)
LEFT JOIN users u ON u.email = r.email;

INSERT INTO roster_entries (team_id, user_id, display_name, jersey_number, position) VALUES
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', NULL, 'Owen Turner',     '2',  'Defender'),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', NULL, 'Ella Phillips',   '35', 'Midfielder'),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', NULL, 'Sebastian Evans', '10', 'Forward'),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', NULL, 'Aurora Collins',  '24', 'Goalkeeper');

-- ============================================================
-- 4. PARENT-PLAYER LINKS
-- ============================================================
INSERT INTO parent_player_links (parent_user_id, roster_entry_id)
SELECT u.id, re.id
FROM (VALUES
  -- Claudes
  ('ctorres@foo.local',  '507a33cd-2c4a-4a89-83db-dac51e9f548f', 'Liam Torres'),
  ('adavis@foo.local',   '507a33cd-2c4a-4a89-83db-dac51e9f548f', 'Emma Davis'),
  ('kjohnson@foo.local', '507a33cd-2c4a-4a89-83db-dac51e9f548f', 'Aiden Johnson'),
  ('llee@foo.local',     '507a33cd-2c4a-4a89-83db-dac51e9f548f', 'Mason Lee'),
  -- Codexes
  ('dbrown2@foo.local',  'fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'Ethan Brown'),
  ('pgarcia@foo.local',  'fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'Jackson Garcia'),
  ('nharris@foo.local',  'fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'Lucas Harris'),
  ('plewis@foo.local',   'fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'Benjamin Lewis'),
  -- Copilots
  ('fscott@foo.local',   '936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'Ryan Scott'),
  ('hgreen@foo.local',   '936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'Natalie Green'),
  ('gbaker@foo.local',   '936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'Dylan Baker'),
  ('rcarter@foo.local',  '936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'Caleb Carter')
) AS p(parent_email, team_id, player_name)
JOIN users u ON u.email = p.parent_email
JOIN roster_entries re ON re.team_id = p.team_id::uuid AND re.display_name = p.player_name;

-- ============================================================
-- 5. SEASONS
-- ============================================================
INSERT INTO seasons (team_id, name, start_date, end_date, status) VALUES
('507a33cd-2c4a-4a89-83db-dac51e9f548f', 'Spring 2026', '2026-01-15', '2026-04-30', 'ARCHIVED'),
('507a33cd-2c4a-4a89-83db-dac51e9f548f', 'Summer 2026', '2026-05-01', '2026-08-31', 'ACTIVE'),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'Spring 2026', '2026-01-15', '2026-04-30', 'ARCHIVED'),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'Summer 2026', '2026-05-01', '2026-08-31', 'ACTIVE'),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'Spring 2026', '2026-01-15', '2026-04-30', 'ARCHIVED'),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'Summer 2026', '2026-05-01', '2026-08-31', 'ACTIVE');

-- ============================================================
-- 6. EVENTS — Spring (all past)
-- ============================================================
-- Helper: season_id via (team_id, name)
-- Claudes Spring practices
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location)
SELECT '507a33cd-2c4a-4a89-83db-dac51e9f548f',
       (SELECT id FROM seasons WHERE team_id='507a33cd-2c4a-4a89-83db-dac51e9f548f' AND name='Spring 2026'),
       'Practice', 'PRACTICE', e.status::event_status_enum, e.starts_at, 'Central Sports Center'
FROM (VALUES
  ('SCHEDULED', '2026-01-20 18:00:00+00'::timestamptz),
  ('SCHEDULED', '2026-01-22 18:00:00+00'),
  ('SCHEDULED', '2026-01-27 18:00:00+00'),
  ('SCHEDULED', '2026-01-29 18:00:00+00'),
  ('SCHEDULED', '2026-02-03 18:00:00+00'),
  ('SCHEDULED', '2026-02-05 18:00:00+00'),
  ('SCHEDULED', '2026-02-10 18:00:00+00'),
  ('CANCELLED', '2026-02-12 18:00:00+00')
) AS e(status, starts_at);

-- Claudes Spring games
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location)
SELECT '507a33cd-2c4a-4a89-83db-dac51e9f548f',
       (SELECT id FROM seasons WHERE team_id='507a33cd-2c4a-4a89-83db-dac51e9f548f' AND name='Spring 2026'),
       e.title, 'GAME', 'SCHEDULED', e.starts_at, e.location
FROM (VALUES
  ('vs Thunder Hawks', '2026-01-31 14:00:00+00'::timestamptz, 'Metro Arena'),
  ('vs Blue Jays',     '2026-02-07 14:00:00+00', 'Blue Jay Fieldhouse'),
  ('vs Red Eagles',    '2026-02-14 14:00:00+00', 'Metro Arena'),
  ('vs Green Wave',    '2026-02-21 14:00:00+00', 'Green Wave Arena'),
  ('vs Silver Foxes',  '2026-02-28 14:00:00+00', 'Metro Arena'),
  ('vs Black Bears',   '2026-03-07 14:00:00+00', 'Northside Complex')
) AS e(title, starts_at, location);

-- Codexes Spring practices
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location)
SELECT 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6',
       (SELECT id FROM seasons WHERE team_id='fcd0b6c7-c9ed-4296-a112-cffd42287ed6' AND name='Spring 2026'),
       'Practice', 'PRACTICE', 'SCHEDULED', e.starts_at, 'Riverside Field'
FROM (VALUES
  ('2026-01-19 17:30:00+00'::timestamptz), ('2026-01-21 17:30:00+00'),
  ('2026-01-26 17:30:00+00'), ('2026-01-28 17:30:00+00'),
  ('2026-02-02 17:30:00+00'), ('2026-02-04 17:30:00+00'),
  ('2026-02-09 17:30:00+00'), ('2026-02-11 17:30:00+00')
) AS e(starts_at);

-- Codexes Spring games
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location)
SELECT 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6',
       (SELECT id FROM seasons WHERE team_id='fcd0b6c7-c9ed-4296-a112-cffd42287ed6' AND name='Spring 2026'),
       e.title, 'GAME', 'SCHEDULED', e.starts_at, e.location
FROM (VALUES
  ('vs Storm FC',         '2026-02-01 11:00:00+00'::timestamptz, 'Riverside Field'),
  ('vs Desert Wolves',    '2026-02-08 11:00:00+00', 'Desert Sports Park'),
  ('vs Iron City FC',     '2026-02-15 11:00:00+00', 'Iron City Complex'),
  ('vs Riverside United', '2026-02-22 11:00:00+00', 'Riverside Field'),
  ('vs Northside FC',     '2026-03-01 11:00:00+00', 'Northside Pitch'),
  ('vs Ocean Blues',      '2026-03-08 11:00:00+00', 'Riverside Field')
) AS e(title, starts_at, location);

-- Copilots Spring practices
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location)
SELECT '936f9604-ecc8-4d46-bd8c-2b4881b33de9',
       (SELECT id FROM seasons WHERE team_id='936f9604-ecc8-4d46-bd8c-2b4881b33de9' AND name='Spring 2026'),
       'Practice', 'PRACTICE', 'SCHEDULED', e.starts_at, 'Lakeside Gym'
FROM (VALUES
  ('2026-01-19 19:00:00+00'::timestamptz), ('2026-01-21 19:00:00+00'),
  ('2026-01-26 19:00:00+00'), ('2026-01-28 19:00:00+00'),
  ('2026-02-02 19:00:00+00'), ('2026-02-04 19:00:00+00'),
  ('2026-02-09 19:00:00+00'), ('2026-02-11 19:00:00+00')
) AS e(starts_at);

-- Copilots Spring games
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location)
SELECT '936f9604-ecc8-4d46-bd8c-2b4881b33de9',
       (SELECT id FROM seasons WHERE team_id='936f9604-ecc8-4d46-bd8c-2b4881b33de9' AND name='Spring 2026'),
       e.title, 'GAME', 'SCHEDULED', e.starts_at, e.location
FROM (VALUES
  ('vs Falcons',  '2026-02-01 16:00:00+00'::timestamptz, 'Lakeside Gym'),
  ('vs Sharks',   '2026-02-08 16:00:00+00', 'Shark Tank Arena'),
  ('vs Panthers', '2026-02-15 16:00:00+00', 'Lakeside Gym'),
  ('vs Tigers',   '2026-02-22 16:00:00+00', 'Tiger Den'),
  ('vs Eagles',   '2026-03-01 16:00:00+00', 'Lakeside Gym'),
  ('vs Lions',    '2026-03-08 16:00:00+00', 'Lion Pride Arena')
) AS e(title, starts_at, location);

-- ============================================================
-- 7. EVENTS — Summer (past + future)
-- ============================================================
-- Claudes Summer
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location, notes)
SELECT '507a33cd-2c4a-4a89-83db-dac51e9f548f',
       (SELECT id FROM seasons WHERE team_id='507a33cd-2c4a-4a89-83db-dac51e9f548f' AND name='Summer 2026'),
       e.title, e.type::event_type_enum, 'SCHEDULED', e.starts_at, e.location, e.notes
FROM (VALUES
  ('Practice',                  'PRACTICE', '2026-05-05 18:00:00+00'::timestamptz, 'Central Sports Center', NULL),
  ('vs Westside Wolves',        'GAME',     '2026-05-08 14:00:00+00', 'Metro Arena',           NULL),
  ('Practice',                  'PRACTICE', '2026-05-12 18:00:00+00', 'Central Sports Center', NULL),
  ('Practice',                  'PRACTICE', '2026-05-19 18:00:00+00', 'Central Sports Center', NULL),
  ('vs Riverside Rapids',       'GAME',     '2026-05-22 14:00:00+00', 'Riverside Complex',     NULL),
  ('Practice',                  'PRACTICE', '2026-05-26 18:00:00+00', 'Central Sports Center', NULL),
  ('Practice',                  'PRACTICE', '2026-06-02 18:00:00+00', 'Central Sports Center', NULL),
  ('Practice',                  'PRACTICE', '2026-06-05 18:00:00+00', 'Central Sports Center', NULL),
  ('vs Iron City',              'GAME',     '2026-06-09 14:00:00+00', 'Metro Arena',           NULL),
  ('Practice',                  'PRACTICE', '2026-06-12 18:00:00+00', 'Central Sports Center', NULL),
  ('Practice',                  'PRACTICE', '2026-06-16 18:00:00+00', 'Central Sports Center', NULL),
  ('vs Desert Hawks',           'GAME',     '2026-06-19 14:00:00+00', 'Metro Arena',           NULL),
  ('Team Meeting — Summer Strategy', 'MEETING', '2026-06-23 19:00:00+00', 'Central Sports Center',
   'Discuss lineup rotations and summer tournament preparation')
) AS e(title, type, starts_at, location, notes);

-- Codexes Summer
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location, notes)
SELECT 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6',
       (SELECT id FROM seasons WHERE team_id='fcd0b6c7-c9ed-4296-a112-cffd42287ed6' AND name='Summer 2026'),
       e.title, e.type::event_type_enum, 'SCHEDULED', e.starts_at, e.location, e.notes
FROM (VALUES
  ('Practice',                  'PRACTICE', '2026-05-06 17:30:00+00'::timestamptz, 'Riverside Field', NULL),
  ('vs Lakeside Lions',         'GAME',     '2026-05-09 11:00:00+00', 'Riverside Field',   NULL),
  ('Practice',                  'PRACTICE', '2026-05-13 17:30:00+00', 'Riverside Field',   NULL),
  ('Practice',                  'PRACTICE', '2026-05-20 17:30:00+00', 'Riverside Field',   NULL),
  ('vs Harborview FC',          'GAME',     '2026-05-23 11:00:00+00', 'Harborview Stadium',NULL),
  ('Practice',                  'PRACTICE', '2026-05-27 17:30:00+00', 'Riverside Field',   NULL),
  ('Practice',                  'PRACTICE', '2026-06-03 17:30:00+00', 'Riverside Field',   NULL),
  ('vs Mountain Ridge',         'GAME',     '2026-06-06 11:00:00+00', 'Riverside Field',   NULL),
  ('Practice',                  'PRACTICE', '2026-06-10 17:30:00+00', 'Riverside Field',   NULL),
  ('vs Eastside United',        'GAME',     '2026-06-13 11:00:00+00', 'Eastside Park',     NULL),
  ('Practice',                  'PRACTICE', '2026-06-17 17:30:00+00', 'Riverside Field',   NULL),
  ('Practice',                  'PRACTICE', '2026-06-20 17:30:00+00', 'Riverside Field',   NULL),
  ('Team Meeting — Tactics Review', 'MEETING', '2026-06-24 18:00:00+00', 'Riverside Field',
   'Formation and set-piece review ahead of summer tournament')
) AS e(title, type, starts_at, location, notes);

-- Copilots Summer
INSERT INTO events (team_id, season_id, title, type, status, starts_at, location, notes)
SELECT '936f9604-ecc8-4d46-bd8c-2b4881b33de9',
       (SELECT id FROM seasons WHERE team_id='936f9604-ecc8-4d46-bd8c-2b4881b33de9' AND name='Summer 2026'),
       e.title, e.type::event_type_enum, 'SCHEDULED', e.starts_at, e.location, e.notes
FROM (VALUES
  ('Practice',                  'PRACTICE', '2026-05-05 19:00:00+00'::timestamptz, 'Lakeside Gym', NULL),
  ('vs Northside Blazers',      'GAME',     '2026-05-08 16:00:00+00', 'Lakeside Gym',      NULL),
  ('Practice',                  'PRACTICE', '2026-05-12 19:00:00+00', 'Lakeside Gym',      NULL),
  ('Practice',                  'PRACTICE', '2026-05-19 19:00:00+00', 'Lakeside Gym',      NULL),
  ('vs Southgate Storm',        'GAME',     '2026-05-22 16:00:00+00', 'Southgate Arena',   NULL),
  ('Practice',                  'PRACTICE', '2026-05-26 19:00:00+00', 'Lakeside Gym',      NULL),
  ('Practice',                  'PRACTICE', '2026-06-02 19:00:00+00', 'Lakeside Gym',      NULL),
  ('vs Valley Vipers',          'GAME',     '2026-06-06 16:00:00+00', 'Lakeside Gym',      NULL),
  ('Practice',                  'PRACTICE', '2026-06-09 19:00:00+00', 'Lakeside Gym',      NULL),
  ('Practice',                  'PRACTICE', '2026-06-13 19:00:00+00', 'Lakeside Gym',      NULL),
  ('Practice',                  'PRACTICE', '2026-06-16 19:00:00+00', 'Lakeside Gym',      NULL),
  ('vs Thunder Ridge',          'GAME',     '2026-06-20 16:00:00+00', 'Lakeside Gym',      NULL),
  ('Team Meeting — Roster Review', 'MEETING', '2026-06-23 18:00:00+00', 'Lakeside Gym',
   'End-of-month roster review and tournament bracket discussion')
) AS e(title, type, starts_at, location, notes);

-- ============================================================
-- 8. GAME RESULTS
-- ============================================================
-- Claudes Spring
INSERT INTO game_results (event_id, season_id, own_score, opp_score, outcome, notes)
SELECT e.id,
       (SELECT id FROM seasons WHERE team_id='507a33cd-2c4a-4a89-83db-dac51e9f548f' AND name='Spring 2026'),
       r.own, r.opp, r.outcome::game_outcome_enum, r.notes
FROM events e
JOIN (VALUES
  ('vs Thunder Hawks', '2026-01-31'::date, 3, 1, 'WIN',  'Strong second half'),
  ('vs Blue Jays',     '2026-02-07', 1, 2, 'LOSS', 'Struggled on defense'),
  ('vs Red Eagles',    '2026-02-14', 4, 2, 'WIN',  'Liam Torres standout game'),
  ('vs Green Wave',    '2026-02-21', 2, 0, 'WIN',  'Solid defensive effort'),
  ('vs Silver Foxes',  '2026-02-28', 2, 2, 'TIE',  'Tied in overtime'),
  ('vs Black Bears',   '2026-03-07', 3, 2, 'WIN',  'Season finale win')
) AS r(title, date, own, opp, outcome, notes)
  ON e.title = r.title AND e.starts_at::date = r.date
  AND e.team_id = '507a33cd-2c4a-4a89-83db-dac51e9f548f';

-- Claudes Summer past
INSERT INTO game_results (event_id, season_id, own_score, opp_score, outcome)
SELECT e.id,
       (SELECT id FROM seasons WHERE team_id='507a33cd-2c4a-4a89-83db-dac51e9f548f' AND name='Summer 2026'),
       r.own, r.opp, r.outcome::game_outcome_enum
FROM events e
JOIN (VALUES
  ('vs Westside Wolves',  '2026-05-08'::date, 3, 2, 'WIN'),
  ('vs Riverside Rapids', '2026-05-22',       1, 3, 'LOSS')
) AS r(title, date, own, opp, outcome)
  ON e.title = r.title AND e.starts_at::date = r.date
  AND e.team_id = '507a33cd-2c4a-4a89-83db-dac51e9f548f';

-- Codexes Spring
INSERT INTO game_results (event_id, season_id, own_score, opp_score, outcome, notes)
SELECT e.id,
       (SELECT id FROM seasons WHERE team_id='fcd0b6c7-c9ed-4296-a112-cffd42287ed6' AND name='Spring 2026'),
       r.own, r.opp, r.outcome::game_outcome_enum, r.notes
FROM events e
JOIN (VALUES
  ('vs Storm FC',         '2026-02-01'::date, 2, 0, 'WIN',  'Ethan Brown clean sheet'),
  ('vs Desert Wolves',    '2026-02-08', 3, 1, 'WIN',  'Benjamin Lewis brace'),
  ('vs Iron City FC',     '2026-02-15', 0, 2, 'LOSS', 'Away form struggled'),
  ('vs Riverside United', '2026-02-22', 1, 0, 'WIN',  'Late winner from Harper Robinson'),
  ('vs Northside FC',     '2026-03-01', 1, 3, 'LOSS', 'Difficult match away'),
  ('vs Ocean Blues',      '2026-03-08', 1, 1, 'TIE',  NULL)
) AS r(title, date, own, opp, outcome, notes)
  ON e.title = r.title AND e.starts_at::date = r.date
  AND e.team_id = 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6';

-- Codexes Summer past
INSERT INTO game_results (event_id, season_id, own_score, opp_score, outcome)
SELECT e.id,
       (SELECT id FROM seasons WHERE team_id='fcd0b6c7-c9ed-4296-a112-cffd42287ed6' AND name='Summer 2026'),
       r.own, r.opp, r.outcome::game_outcome_enum
FROM events e
JOIN (VALUES
  ('vs Lakeside Lions', '2026-05-09'::date, 2, 1, 'WIN'),
  ('vs Harborview FC',  '2026-05-23',       0, 0, 'TIE')
) AS r(title, date, own, opp, outcome)
  ON e.title = r.title AND e.starts_at::date = r.date
  AND e.team_id = 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6';

-- Copilots Spring
INSERT INTO game_results (event_id, season_id, own_score, opp_score, outcome, notes)
SELECT e.id,
       (SELECT id FROM seasons WHERE team_id='936f9604-ecc8-4d46-bd8c-2b4881b33de9' AND name='Spring 2026'),
       r.own, r.opp, r.outcome::game_outcome_enum, r.notes
FROM events e
JOIN (VALUES
  ('vs Falcons',  '2026-02-01'::date, 5, 3, 'WIN',  'Ryan Scott hat-trick'),
  ('vs Sharks',   '2026-02-08', 4, 1, 'WIN',  'Dominant performance'),
  ('vs Panthers', '2026-02-15', 3, 2, 'WIN',  'Won in overtime'),
  ('vs Tigers',   '2026-02-22', 6, 4, 'WIN',  'High-scoring thriller'),
  ('vs Eagles',   '2026-03-01', 4, 3, 'WIN',  'Nail-biting finish'),
  ('vs Lions',    '2026-03-08', 2, 5, 'LOSS', 'Couldn''t contain Lions'' offense')
) AS r(title, date, own, opp, outcome, notes)
  ON e.title = r.title AND e.starts_at::date = r.date
  AND e.team_id = '936f9604-ecc8-4d46-bd8c-2b4881b33de9';

-- Copilots Summer past
INSERT INTO game_results (event_id, season_id, own_score, opp_score, outcome)
SELECT e.id,
       (SELECT id FROM seasons WHERE team_id='936f9604-ecc8-4d46-bd8c-2b4881b33de9' AND name='Summer 2026'),
       r.own, r.opp, r.outcome::game_outcome_enum
FROM events e
JOIN (VALUES
  ('vs Northside Blazers', '2026-05-08'::date, 4, 2, 'WIN'),
  ('vs Southgate Storm',   '2026-05-22',       3, 1, 'WIN')
) AS r(title, date, own, opp, outcome)
  ON e.title = r.title AND e.starts_at::date = r.date
  AND e.team_id = '936f9604-ecc8-4d46-bd8c-2b4881b33de9';

-- ============================================================
-- 9. SEASON RECORDS
-- ============================================================
INSERT INTO season_records (season_id, wins, losses, ties)
SELECT id, r.wins, r.losses, r.ties
FROM seasons
JOIN (VALUES
  ('507a33cd-2c4a-4a89-83db-dac51e9f548f'::uuid, 'Spring 2026', 4, 1, 1),
  ('507a33cd-2c4a-4a89-83db-dac51e9f548f',        'Summer 2026', 1, 1, 0),
  ('fcd0b6c7-c9ed-4296-a112-cffd42287ed6',        'Spring 2026', 3, 2, 1),
  ('fcd0b6c7-c9ed-4296-a112-cffd42287ed6',        'Summer 2026', 1, 0, 1),
  ('936f9604-ecc8-4d46-bd8c-2b4881b33de9',        'Spring 2026', 5, 1, 0),
  ('936f9604-ecc8-4d46-bd8c-2b4881b33de9',        'Summer 2026', 2, 0, 0)
) AS r(team_id, season_name, wins, losses, ties)
  ON seasons.team_id = r.team_id AND seasons.name = r.season_name;

-- ============================================================
-- 10. ATTENDANCE RECORDS — Summer past events (6 per team)
-- ============================================================
-- Claudes attendance (summer practices + games, ~2 ABSENT per event)
INSERT INTO attendance_records (event_id, roster_entry_id, mark)
SELECT e.id, re.id,
       CASE WHEN (re.display_name, e.starts_at::date::text) IN (
         ('Olivia Martinez','2026-05-05'), ('Ava Rodriguez','2026-05-05'),
         ('Emma Davis','2026-05-08'),      ('Logan Kim','2026-05-08'),
         ('Noah Rivera','2026-05-12'),     ('Mia Patel','2026-05-12'),
         ('Aiden Johnson','2026-05-19'),   ('Logan Kim','2026-05-19'),
         ('Isabella Thompson','2026-05-22'),('Ava Rodriguez','2026-05-22'),
         ('Mason Lee','2026-05-26'),       ('Tyler Chen','2026-05-26')
       ) THEN 'ABSENT'::attendance_mark_enum ELSE 'PRESENT'::attendance_mark_enum END
FROM events e
CROSS JOIN roster_entries re
WHERE e.team_id = '507a33cd-2c4a-4a89-83db-dac51e9f548f'
  AND re.team_id = '507a33cd-2c4a-4a89-83db-dac51e9f548f'
  AND e.starts_at::date IN ('2026-05-05','2026-05-08','2026-05-12','2026-05-19','2026-05-22','2026-05-26');

-- Codexes attendance
INSERT INTO attendance_records (event_id, roster_entry_id, mark)
SELECT e.id, re.id,
       CASE WHEN (re.display_name, e.starts_at::date::text) IN (
         ('Amelia White','2026-05-06'),    ('Avery Hall','2026-05-06'),
         ('Charlotte Clark','2026-05-09'), ('Owen King','2026-05-09'),
         ('Jackson Garcia','2026-05-13'),  ('Elijah Walker','2026-05-13'),
         ('Benjamin Lewis','2026-05-20'),  ('Daniel Young','2026-05-20'),
         ('Harper Robinson','2026-05-23'), ('Scarlett Allen','2026-05-23'),
         ('Lucas Harris','2026-05-27'),    ('Avery Hall','2026-05-27')
       ) THEN 'ABSENT'::attendance_mark_enum ELSE 'PRESENT'::attendance_mark_enum END
FROM events e
CROSS JOIN roster_entries re
WHERE e.team_id = 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6'
  AND re.team_id = 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6'
  AND e.starts_at::date IN ('2026-05-06','2026-05-09','2026-05-13','2026-05-20','2026-05-23','2026-05-27');

-- Copilots attendance
INSERT INTO attendance_records (event_id, roster_entry_id, mark)
SELECT e.id, re.id,
       CASE WHEN (re.display_name, e.starts_at::date::text) IN (
         ('Zoe Nelson','2026-05-05'),      ('Owen Turner','2026-05-05'),
         ('Dylan Baker','2026-05-08'),     ('Ella Phillips','2026-05-08'),
         ('Caleb Carter','2026-05-12'),    ('Sebastian Evans','2026-05-12'),
         ('Natalie Green','2026-05-19'),   ('Aurora Collins','2026-05-19'),
         ('Lily Mitchell','2026-05-22'),   ('Owen Turner','2026-05-22'),
         ('Jack Perez','2026-05-26'),      ('Aurora Collins','2026-05-26')
       ) THEN 'ABSENT'::attendance_mark_enum ELSE 'PRESENT'::attendance_mark_enum END
FROM events e
CROSS JOIN roster_entries re
WHERE e.team_id = '936f9604-ecc8-4d46-bd8c-2b4881b33de9'
  AND re.team_id = '936f9604-ecc8-4d46-bd8c-2b4881b33de9'
  AND e.starts_at::date IN ('2026-05-05','2026-05-08','2026-05-12','2026-05-19','2026-05-22','2026-05-26');

-- ============================================================
-- 11. RSVPs — first 3 upcoming events per team
-- ============================================================
-- Claudes: Jun 2 practice, Jun 5 practice, Jun 9 game
INSERT INTO rsvp (event_id, user_id, status)
SELECT e.id, u.id, r.status::rsvp_status_enum
FROM events e
CROSS JOIN (VALUES
  ('ltorres@foo.local',   'GOING'),
  ('nrivera@foo.local',   'GOING'),
  ('edavis@foo.local',    'GOING'),
  ('omartinez@foo.local', 'MAYBE'),
  ('ajohnson@foo.local',  'GOING'),
  ('ithompson@foo.local', 'GOING'),
  ('mlee@foo.local',      'NOT_GOING'),
  ('swilson@foo.local',   'GOING'),
  ('jmitchell@foo.local', 'GOING'),
  ('rkim@foo.local',      'GOING')
) AS r(email, status)
JOIN users u ON u.email = r.email
WHERE e.team_id = '507a33cd-2c4a-4a89-83db-dac51e9f548f'
  AND e.starts_at::date IN ('2026-06-02','2026-06-05','2026-06-09');

-- Codexes: Jun 3 practice, Jun 6 game, Jun 10 practice
INSERT INTO rsvp (event_id, user_id, status)
SELECT e.id, u.id, r.status::rsvp_status_enum
FROM events e
CROSS JOIN (VALUES
  ('ebrown@foo.local',    'GOING'),
  ('jgarcia@foo.local',   'GOING'),
  ('awhite@foo.local',    'MAYBE'),
  ('lharris@foo.local',   'GOING'),
  ('cclark@foo.local',    'GOING'),
  ('blewis@foo.local',    'GOING'),
  ('hrobinson@foo.local', 'NOT_GOING'),
  ('ewalker@foo.local',   'GOING'),
  ('mthompson@foo.local', 'GOING'),
  ('jadams@foo.local',    'GOING')
) AS r(email, status)
JOIN users u ON u.email = r.email
WHERE e.team_id = 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6'
  AND e.starts_at::date IN ('2026-06-03','2026-06-06','2026-06-10');

-- Copilots: Jun 2 practice, Jun 6 game, Jun 9 practice
INSERT INTO rsvp (event_id, user_id, status)
SELECT e.id, u.id, r.status::rsvp_status_enum
FROM events e
CROSS JOIN (VALUES
  ('rscott@foo.local',    'GOING'),
  ('ngreen@foo.local',    'GOING'),
  ('dbaker@foo.local',    'GOING'),
  ('znelson@foo.local',   'GOING'),
  ('ccarter@foo.local',   'MAYBE'),
  ('lmitchell@foo.local', 'GOING'),
  ('jperez@foo.local',    'GOING'),
  ('croberts@foo.local',  'NOT_GOING'),
  ('sanderson@foo.local', 'GOING'),
  ('dmurphy@foo.local',   'GOING')
) AS r(email, status)
JOIN users u ON u.email = r.email
WHERE e.team_id = '936f9604-ecc8-4d46-bd8c-2b4881b33de9'
  AND e.starts_at::date IN ('2026-06-02','2026-06-06','2026-06-09');

-- ============================================================
-- 12. ANNOUNCEMENTS (from Owen)
-- ============================================================
INSERT INTO announcements (team_id, author_id, title, body, pinned, urgent, target_audience) VALUES
-- Claudes
('507a33cd-2c4a-4a89-83db-dac51e9f548f', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'Summer Season Kickoff!',
 'Welcome to Summer 2026! We had a great Spring finishing 4W-1L-1T. First practice May 5 at Central Sports Center, 6pm.',
 true, false, 'ALL'::announcement_audience_enum),
('507a33cd-2c4a-4a89-83db-dac51e9f548f', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'URGENT: Game Day Uniform Reminder',
 'All players must wear the full team uniform for games — jersey, shorts, and socks. Contact Rachel Kim if you are missing any part.',
 false, true, 'PLAYERS'::announcement_audience_enum),
('507a33cd-2c4a-4a89-83db-dac51e9f548f',
 (SELECT id FROM users WHERE email = 'jmitchell@foo.local'),
 'Practice Focus: Defensive Rotations',
 'This week we focus on defensive rotations and help-side defense. Watch the film clips I sent before Tuesday''s session.',
 false, false, 'PLAYERS'::announcement_audience_enum),
-- Codexes
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'Welcome to Summer 2026 — Codexes',
 'Great Spring campaign — 3W-2L-1T. Summer practices move to Wednesday/Saturday. Let''s push for a top-3 finish.',
 true, false, 'ALL'::announcement_audience_enum),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'Tournament Registration Open',
 'We have registered for the Riverside Summer Cup (July 12-13). Confirm availability by June 15th.',
 false, false, 'ALL'::announcement_audience_enum),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6',
 (SELECT id FROM users WHERE email = 'mthompson@foo.local'),
 'Set Piece Session — Saturday',
 'This Saturday we dedicate 45 minutes to set pieces — corners, free kicks, and throw-ins. Arrive 10 minutes early.',
 false, false, 'PLAYERS'::announcement_audience_enum),
-- Copilots
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'Unbeaten Start to Summer!',
 'Two wins from two — fantastic start! Next practice June 2 at Lakeside Gym, 7pm.',
 true, false, 'ALL'::announcement_audience_enum),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'Parent Information Night — June 10th',
 'Parent information evening on June 10th at Lakeside Gym, 6:30pm. Summer schedule, tournament plans, team goals. All parents welcome.',
 false, false, 'PARENTS'::announcement_audience_enum),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9',
 (SELECT id FROM users WHERE email = 'sanderson@foo.local'),
 'Conditioning Drill Packs Shared',
 'I emailed everyone the off-day conditioning drill packs. Aim for 3 sessions per week on non-practice days.',
 false, false, 'PLAYERS'::announcement_audience_enum);

-- ============================================================
-- 13. NOTIFICATIONS for Owen
-- ============================================================
INSERT INTO notifications (user_id, team_id, type, message, is_read) VALUES
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', '507a33cd-2c4a-4a89-83db-dac51e9f548f',
 'ANNOUNCEMENT_POSTED'::notification_type_enum, 'James Mitchell posted: "Practice Focus: Defensive Rotations"', false),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', '507a33cd-2c4a-4a89-83db-dac51e9f548f',
 'EVENT_UPDATED'::notification_type_enum, 'Claudes game vs Desert Hawks on Jun 19 — location confirmed: Metro Arena', true),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6',
 'ANNOUNCEMENT_POSTED'::notification_type_enum, 'Marcus Thompson posted: "Set Piece Session — Saturday"', false),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', 'fcd0b6c7-c9ed-4296-a112-cffd42287ed6',
 'EVENT_UPDATED'::notification_type_enum, 'Codexes game vs Mountain Ridge on Jun 6 — kickoff time confirmed 11:00am', true),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', '936f9604-ecc8-4d46-bd8c-2b4881b33de9',
 'ANNOUNCEMENT_POSTED'::notification_type_enum, 'Steve Anderson posted: "Conditioning Drill Packs Shared"', false),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', '936f9604-ecc8-4d46-bd8c-2b4881b33de9',
 'EVENT_UPDATED'::notification_type_enum, 'Copilots Team Meeting on Jun 23 — agenda updated', false),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', '507a33cd-2c4a-4a89-83db-dac51e9f548f',
 'EVENT_CANCELLED'::notification_type_enum, 'Claudes Practice on Feb 12 was cancelled due to facility maintenance', true),
('a337dff4-8b0a-4dcf-af99-a884ddb55da1', '936f9604-ecc8-4d46-bd8c-2b4881b33de9',
 'EVENT_UPDATED'::notification_type_enum, 'Copilots game vs Valley Vipers on Jun 6 — venue confirmed: Lakeside Gym', true);

-- ============================================================
-- 14. INVITES (one open PLAYER invite per team)
-- token_hash is char(64)
-- ============================================================
INSERT INTO invites (team_id, created_by, role, expires_at, status, token_hash) VALUES
('507a33cd-2c4a-4a89-83db-dac51e9f548f', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'PLAYER'::team_role, '2026-07-31 23:59:59+00', 'PENDING'::invite_status_enum,
 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'),
('fcd0b6c7-c9ed-4296-a112-cffd42287ed6', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'PLAYER'::team_role, '2026-07-31 23:59:59+00', 'PENDING'::invite_status_enum,
 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3'),
('936f9604-ecc8-4d46-bd8c-2b4881b33de9', 'a337dff4-8b0a-4dcf-af99-a884ddb55da1',
 'PLAYER'::team_role, '2026-07-31 23:59:59+00', 'PENDING'::invite_status_enum,
 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4');

COMMIT;
