-- 014_xp_activity_types.sql
-- Adds the one new XP-earning event the Phase 1 social/community loop needs.
-- Split into its own migration because Postgres won't let a new enum value
-- be used by a statement in the same transaction that adds it — this must
-- be run (and committed) before 015_social_community.sql.
--
-- Per the brief's own "avoid meaningless engagement" / "do not make this
-- pay-to-win" principle, Phase 1 intentionally does NOT award XP for merely
-- posting, answering, liking, or following — only for an answer actually
-- being accepted, which is the one unambiguous, abuse-resistant signal of
-- real help given (see accept_answer() in 015_social_community.sql).

alter type public.xp_activity_type add value if not exists 'answer_accepted';
