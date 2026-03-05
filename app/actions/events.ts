'use server';

import { getSupabase } from '@/utils/supabase/queries';
import { revalidatePath } from 'next/cache';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'ancestor_memorial' | 'clan_meeting' | 'inauguration' | 'scholarship' | 'wedding' | 'sports' | 'other';
  start_date: string;
  end_date?: string;
  location?: string;
  is_lunar: boolean;
  recurrence?: string;
  max_attendees?: number;
  image_url?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export async function getEvents() {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      attendees:event_attendees(count)
    `)
    .order('start_date', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }

  return data;
}

export async function createEvent(formData: FormData) {
  const supabase = await getSupabase();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const event = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    event_type: formData.get('event_type') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    location: formData.get('location') as string,
    is_lunar: formData.get('is_lunar') === 'true',
    recurrence: formData.get('recurrence') as string || null,
    max_attendees: formData.get('max_attendees') ? parseInt(formData.get('max_attendees') as string) : null,
    image_url: formData.get('image_url') as string,
    created_by: user.id,
  };

  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/events');
  revalidatePath('/dashboard/events');
  return { data };
}

export async function updateEvent(id: string, formData: FormData) {
  const supabase = await getSupabase();

  const event = {
    title: formData.get('title') as string,
    description: formData.get('description') as string,
    event_type: formData.get('event_type') as string,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string || null,
    location: formData.get('location') as string,
    is_lunar: formData.get('is_lunar') === 'true',
    recurrence: formData.get('recurrence') as string || null,
    max_attendees: formData.get('max_attendees') ? parseInt(formData.get('max_attendees') as string) : null,
    image_url: formData.get('image_url') as string,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('events')
    .update(event)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/events');
  revalidatePath('/dashboard/events');
  return { data };
}

export async function deleteEvent(id: string) {
  const supabase = await getSupabase();

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/events');
  revalidatePath('/dashboard/events');
  return { success: true };
}
