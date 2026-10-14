import { StudentProject } from '../types';
import { mapProject } from './mappers';
import { supabase } from './supabaseClient';
import { DbProject } from './dbTypes';

const PROJECT_SELECT = `*, author:profiles!projects_author_id_fkey(*)`;

class ProjectService {
  async listByAuthor(authorId: string): Promise<StudentProject[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(PROJECT_SELECT)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return ((data || []) as unknown as DbProject[]).map(mapProject);
  }

  async createProject(
    authorId: string,
    input: { title: string; description?: string; technologies: string[]; imageUrl?: string; demoUrl?: string; githubUrl?: string; whatILearned?: string }
  ): Promise<StudentProject> {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        author_id: authorId,
        title: input.title,
        description: input.description || null,
        technologies: input.technologies,
        image_url: input.imageUrl || null,
        demo_url: input.demoUrl || null,
        github_url: input.githubUrl || null,
        what_i_learned: input.whatILearned || null,
      })
      .select(PROJECT_SELECT)
      .single();
    if (error) throw error;
    return mapProject(data as unknown as DbProject);
  }

  async deleteProject(projectId: string) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
  }
}

export const projectService = new ProjectService();
