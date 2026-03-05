'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Achievement {
  id: string;
  member_id: string;
  title: string;
  description?: string;
  achievement_type: 'education' | 'career' | 'culture' | 'sports' | 'social' | 'clan_contribution';
  year?: number;
  organization?: string;
  certificate_url?: string;
  image_url?: string;
  verified_by?: string;
  is_featured: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getAchievements() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      member:persons(id, full_name),
      verifier:profiles(id, email)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data;
}

export async function createAchievement(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const achievement = {
    member_id: formData.get('member_id') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    achievement_type: formData.get('achievement_type') as string,
    year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
    organization: formData.get('organization') as string,
    certificate_url: formData.get('certificate_url') as string,
    image_url: formData.get('image_url') as string,
    is_featured: formData.get('is_featured') === 'true',
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('achievements')
    .insert(achievement)
    .select()
    .single();

  if (error) {
    console.error('Error creating achievement:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/achievements');
  return { data };
}

export async function updateAchievement(id: string, formData: FormData) {
  const supabase = await createClient();

  const achievement = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    achievement_type: formData.get('achievement_type') as string,
    year: formData.get('year') ? parseInt(formData.get('year') as string) : null,
    organization: formData.get('organization') as string,
    certificate_url: formData.get('certificate_url') as string,
    image_url: formData.get('image_url') as string,
    is_featured: formData.get('is_featured') === 'true',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('achievements')
    .update(achievement)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating achievement:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/achievements');
  return { data };
}

export async function deleteAchievement(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('achievements')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting achievement:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/achievements');
  return { success: true };
}

export async function toggleFeatured(id: string, isFeatured: boolean) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('achievements')
    .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling featured:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/achievements');
  return { data };
}
