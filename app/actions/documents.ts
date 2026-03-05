'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface DocumentCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category_id?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  thumbnail_url?: string;
  is_public: boolean;
  uploaded_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getDocumentCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('document_categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data;
}

export async function getDocuments(categoryId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('documents')
    .select(`
      *,
      category:document_categories(id, name, icon),
      uploader:profiles(id, email)
    `)
    .order('created_at', { ascending: false });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return data;
}

export async function createDocument(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const document = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category_id: formData.get('category_id') as string || null,
    file_url: formData.get('file_url') as string,
    file_type: formData.get('file_type') as string,
    file_size: formData.get('file_size') ? parseInt(formData.get('file_size') as string) : null,
    thumbnail_url: formData.get('thumbnail_url') as string,
    is_public: formData.get('is_public') === 'true',
    uploaded_by: user.id,
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(document)
    .select()
    .single();

  if (error) {
    console.error('Error creating document:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/documents');
  revalidatePath('/dashboard/documents');
  return { data };
}

export async function updateDocument(id: string, formData: FormData) {
  const supabase = await createClient();

  const document = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    category_id: formData.get('category_id') as string || null,
    file_type: formData.get('file_type') as string,
    thumbnail_url: formData.get('thumbnail_url') as string,
    is_public: formData.get('is_public') === 'true',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('documents')
    .update(document)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating document:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/documents');
  revalidatePath('/dashboard/documents');
  return { data };
}

export async function deleteDocument(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/documents');
  revalidatePath('/dashboard/documents');
  return { success: true };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();

  const category = {
    name: formData.get('name') as string,
    description: formData.get('description') as string,
    parent_id: formData.get('parent_id') as string || null,
    icon: formData.get('icon') as string,
    sort_order: formData.get('sort_order') ? parseInt(formData.get('sort_order') as string) : 0,
  };

  const { data, error } = await supabase
    .from('document_categories')
    .insert(category)
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/documents');
  return { data };
}
