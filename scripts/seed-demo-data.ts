import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_COURSES, INITIAL_SHORT_VIDEOS } from '../src/data/edtechData';
import { INITIAL_USER, TEACHER_USER } from '../src/data/mockData';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || 'Vormirix-Demo-2026';

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsertAuthUser(email: string, fullName: string, role: 'student' | 'teacher', avatarUrl: string, bio: string) {
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (found) {
    console.log(`  already exists: ${email} (${found.id})`);
    return found.id;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, role },
  });

  if (error || !data.user) {
    throw new Error(`Failed to create ${email}: ${error?.message}`);
  }

  // handle_new_auth_user trigger already inserted a bare profile row; fill
  // in the richer demo details (avatar/bio) that the trigger doesn't know.
  await admin.from('profiles').update({ avatar_url: avatarUrl, bio }).eq('id', data.user.id);

  console.log(`  created: ${email} (${data.user.id})`);
  return data.user.id;
}

async function main() {
  console.log('1/5 Creating demo auth accounts...');
  const teacherId = await upsertAuthUser(
    TEACHER_USER.email,
    TEACHER_USER.name,
    'teacher',
    TEACHER_USER.avatarUrl,
    TEACHER_USER.bio || ''
  );
  const studentId = await upsertAuthUser(
    INITIAL_USER.email,
    INITIAL_USER.name,
    'student',
    INITIAL_USER.avatarUrl,
    INITIAL_USER.bio || ''
  );

  // All mock courses are authored by "Dr. Vikram Desai" / "Prof. Ananya Patel"
  // in the frontend data, but we only seed one real teacher account for now
  // — attribute every seeded course/video to that account so ownership/RLS
  // checks have a real row to point at.
  console.log('2/5 Seeding courses + lessons...');
  const courseIdMap = new Map<string, string>();

  for (const course of INITIAL_COURSES) {
    const { data: inserted, error } = await admin
      .from('courses')
      .insert({
        teacher_id: teacherId,
        title: course.title,
        subtitle: course.subtitle,
        description: course.description,
        long_description: course.longDescription,
        thumbnail_url: course.thumbnailUrl,
        category: course.category,
        difficulty: course.difficulty,
        language: course.language,
        price: course.price,
        is_free: course.isFree,
        status: course.isPublished ? 'published' : 'draft',
        what_you_will_learn: course.whatYouWillLearn,
        prerequisites: course.prerequisites,
        certificate_available: course.certificateAvailable,
      })
      .select('id')
      .single();

    if (error || !inserted) {
      console.error(`  failed to insert course "${course.title}": ${error?.message}`);
      continue;
    }

    courseIdMap.set(course.id, inserted.id);

    const lessonRows = course.lessons.map((lesson, idx) => ({
      course_id: inserted.id,
      title: lesson.title,
      description: lesson.description,
      video_url: lesson.videoUrl,
      duration_seconds: parseDurationToSeconds(lesson.duration),
      lesson_order: lesson.order ?? idx + 1,
      xp_reward: lesson.xpReward,
      is_preview: lesson.isFreePreview,
      notes: lesson.notes,
    }));

    const { error: lessonError } = await admin.from('course_lessons').insert(lessonRows);
    if (lessonError) {
      console.error(`  failed to insert lessons for "${course.title}": ${lessonError.message}`);
    } else {
      console.log(`  seeded "${course.title}" with ${lessonRows.length} lessons`);
    }
  }

  console.log('3/5 Seeding short videos...');
  for (const video of INITIAL_SHORT_VIDEOS) {
    const relatedCourseId = video.relatedCourseId ? courseIdMap.get(video.relatedCourseId) : null;
    const { error } = await admin.from('short_videos').insert({
      creator_id: teacherId,
      title: video.title,
      caption: video.caption,
      description: video.description,
      video_url: video.videoUrl,
      thumbnail_url: video.thumbnailUrl,
      duration_seconds: parseDurationToSeconds(video.duration),
      category: video.category,
      difficulty: video.difficulty,
      tags: video.tags,
      related_course_id: relatedCourseId,
    });
    if (error) {
      console.error(`  failed to insert video "${video.title}": ${error.message}`);
    }
  }
  console.log(`  seeded ${INITIAL_SHORT_VIDEOS.length} short videos`);

  console.log('4/5 Enrolling demo student + backfilling progress/XP...');
  for (const mockCourseId of INITIAL_USER.enrolledCourseIds) {
    const realCourseId = courseIdMap.get(mockCourseId);
    if (!realCourseId) continue;
    await admin.from('enrollments').insert({
      student_id: studentId,
      course_id: realCourseId,
      status: 'active',
      payment_status: 'free',
    });
  }

  console.log('5/5 Done. Demo login credentials:');
  console.log(`  Student: ${INITIAL_USER.email} / ${DEMO_PASSWORD}`);
  console.log(`  Teacher: ${TEACHER_USER.email} / ${DEMO_PASSWORD}`);
}

function parseDurationToSeconds(duration: string): number {
  const parts = duration.split(':').map((p) => parseInt(p, 10) || 0);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
