'use server';

import { getSupabase } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

export interface Chronicle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  cover_image_url?: string;
  status: 'draft' | 'published';
  author_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}

export async function getChronicles(publishedOnly = false) {
  const supabase = await getSupabase();
  let query = supabase
    .from('chronicles')
    .select('*')
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (publishedOnly) {
    query = query.eq('status', 'published');
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching chronicles:', error);
    return [];
  }
  return data as Chronicle[];
}

export async function getChronicle(slug: string) {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('chronicles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching chronicle:', error);
    return null;
  }
  return data as Chronicle;
}

export async function createChronicle(formData: FormData) {
  const supabase = await getSupabase();

  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const cover_image_url = formData.get('cover_image_url') as string;
  const status = (formData.get('status') as string) || 'draft';

  if (!title) return { error: 'Tiêu đề không được để trống' };

  const slug = rawSlug?.trim() || generateSlug(title) + '-' + Date.now();

  const payload: Record<string, unknown> = {
    title,
    slug,
    excerpt: excerpt || null,
    content: content || null,
    cover_image_url: cover_image_url || null,
    status,
    published_at: status === 'published' ? new Date().toISOString() : null,
  };

  const { error } = await supabase.from('chronicles').insert(payload);
  if (error) {
    console.error('Error creating chronicle:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/chronicles');
  revalidatePath('/dashboard/admin/chronicles');
  return { success: true };
}

export async function updateChronicle(id: string, formData: FormData) {
  const supabase = await getSupabase();

  const title = formData.get('title') as string;
  const rawSlug = formData.get('slug') as string;
  const excerpt = formData.get('excerpt') as string;
  const content = formData.get('content') as string;
  const cover_image_url = formData.get('cover_image_url') as string;
  const status = (formData.get('status') as string) || 'draft';

  const slug = rawSlug?.trim() || generateSlug(title || '') + '-' + Date.now();

  // Fetch current to preserve published_at if already set
  const { data: current } = await supabase
    .from('chronicles')
    .select('status, published_at')
    .eq('id', id)
    .single();

  const published_at =
    status === 'published'
      ? current?.published_at || new Date().toISOString()
      : null;

  const payload: Record<string, unknown> = {
    title,
    slug,
    excerpt: excerpt || null,
    content: content || null,
    cover_image_url: cover_image_url || null,
    status,
    published_at,
  };

  const { error } = await supabase.from('chronicles').update(payload).eq('id', id);
  if (error) {
    console.error('Error updating chronicle:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/chronicles');
  revalidatePath('/dashboard/admin/chronicles');
  revalidatePath(`/dashboard/chronicles/${slug}`);
  return { success: true };
}

export async function deleteChronicle(id: string) {
  const supabase = await getSupabase();
  const { error } = await supabase.from('chronicles').delete().eq('id', id);
  if (error) {
    console.error('Error deleting chronicle:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/chronicles');
  revalidatePath('/dashboard/admin/chronicles');
  return { success: true };
}
