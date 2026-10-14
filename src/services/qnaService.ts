import { Question, QuestionAnswer } from '../types';
import { mapAnswer, mapQuestion } from './mappers';
import { supabase } from './supabaseClient';
import { DbAnswer, DbQuestion } from './dbTypes';

const QUESTION_SELECT = `*, author:profiles!questions_author_id_fkey(*)`;
const ANSWER_SELECT = `*, author:profiles!answers_author_id_fkey(*)`;

export type QuestionFilter = { subject?: string; resolved?: boolean };

class QnaService {
  async listQuestions(filter: QuestionFilter = {}, page = 0, pageSize = 20): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select(QUESTION_SELECT)
      .order('created_at', { ascending: false })
      .range(page * pageSize, page * pageSize + pageSize - 1);

    if (filter.subject) query = query.eq('subject', filter.subject);
    if (filter.resolved !== undefined) query = query.eq('is_resolved', filter.resolved);

    const { data, error } = await query;
    if (error) throw error;
    return ((data || []) as unknown as DbQuestion[]).map(mapQuestion);
  }

  async getQuestion(questionId: string): Promise<Question | null> {
    const { data, error } = await supabase.from('questions').select(QUESTION_SELECT).eq('id', questionId).maybeSingle();
    if (error) throw error;
    return data ? mapQuestion(data as unknown as DbQuestion) : null;
  }

  /** Best-effort view counter — not gated behind a trusted RPC since a
   * slightly-inflatable view count isn't a security-sensitive number
   * (unlike XP/enrollment). Mirrors increment_video_views in spirit. */
  async incrementViews(questionId: string) {
    const { data } = await supabase.from('questions').select('views_count').eq('id', questionId).single();
    if (data) {
      await supabase.from('questions').update({ views_count: (data.views_count || 0) + 1 }).eq('id', questionId);
    }
  }

  async createQuestion(
    authorId: string,
    input: { title: string; description?: string; subject?: string; topic?: string; imageUrl?: string; tags: string[]; difficulty: Question['difficulty'] }
  ): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        author_id: authorId,
        title: input.title,
        description: input.description || null,
        subject: input.subject || null,
        topic: input.topic || null,
        image_url: input.imageUrl || null,
        tags: input.tags,
        difficulty: input.difficulty,
      })
      .select(QUESTION_SELECT)
      .single();
    if (error) throw error;
    return mapQuestion(data as unknown as DbQuestion);
  }

  async deleteQuestion(questionId: string) {
    const { error } = await supabase.from('questions').delete().eq('id', questionId);
    if (error) throw error;
  }

  async listAnswers(questionId: string, viewerId?: string): Promise<QuestionAnswer[]> {
    const { data, error } = await supabase
      .from('answers')
      .select(ANSWER_SELECT)
      .eq('question_id', questionId)
      // Accepted answer first, then by upvotes, then newest — surfaces the
      // "best answer" the way the brief describes without needing a
      // separate ranking service.
      .order('is_accepted', { ascending: false })
      .order('upvotes_count', { ascending: false })
      .order('created_at', { ascending: true });
    if (error) throw error;
    const rows = (data || []) as unknown as DbAnswer[];
    if (!viewerId || rows.length === 0) return rows.map((r) => mapAnswer(r));

    const answerIds = rows.map((r) => r.id);
    const { data: upvotes } = await supabase.from('answer_upvotes').select('answer_id').eq('user_id', viewerId).in('answer_id', answerIds);
    const upvotedSet = new Set((upvotes || []).map((u: any) => u.answer_id));
    return rows.map((r) => mapAnswer(r, upvotedSet.has(r.id)));
  }

  async createAnswer(questionId: string, authorId: string, content: string): Promise<QuestionAnswer> {
    const { data, error } = await supabase
      .from('answers')
      .insert({ question_id: questionId, author_id: authorId, content })
      .select(ANSWER_SELECT)
      .single();
    if (error) throw error;
    return mapAnswer(data as unknown as DbAnswer);
  }

  async toggleUpvote(answerId: string, userId: string, currentlyUpvoted: boolean) {
    if (currentlyUpvoted) {
      const { error } = await supabase.from('answer_upvotes').delete().eq('answer_id', answerId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('answer_upvotes').insert({ answer_id: answerId, user_id: userId });
      if (error && error.code !== '23505') throw error;
    }
  }

  /** Only the question's own author can call this successfully — enforced
   * server-side by accept_answer() (009.../015...sql), not just here. */
  async acceptAnswer(answerId: string) {
    const { data, error } = await supabase.rpc('accept_answer', { p_answer_id: answerId });
    if (error) throw error;
    return data;
  }

  async toggleSaveQuestion(questionId: string, userId: string, currentlySaved: boolean) {
    if (currentlySaved) {
      const { error } = await supabase.from('saved_questions').delete().eq('question_id', questionId).eq('user_id', userId);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('saved_questions').insert({ user_id: userId, question_id: questionId });
      if (error && error.code !== '23505') throw error;
    }
  }
}

export const qnaService = new QnaService();
