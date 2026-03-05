'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface Fund {
  id: string;
  name: string;
  description?: string;
  fund_type: 'clan_fund' | 'scholarship_fund';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface FundTransaction {
  id: string;
  fund_id: string;
  member_id?: string;
  amount: number;
  transaction_type: 'donation' | 'expense' | 'scholarship' | 'support';
  description?: string;
  receipt_url?: string;
  transaction_date: string;
  recorded_by?: string;
  created_at: string;
}

export async function getFunds() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('funds')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching funds:', error);
    return [];
  }

  return data;
}

export async function getFundTransactions(fundId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from('fund_transactions')
    .select(`
      *,
      fund:funds(id, name),
      member:persons(id, full_name),
      recorder:profiles(id, email)
    `)
    .order('transaction_date', { ascending: false });

  if (fundId) {
    query = query.eq('fund_id', fundId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data;
}

export async function createFundTransaction(formData: FormData) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const transaction = {
    fund_id: formData.get('fund_id') as string,
    member_id: formData.get('member_id') as string || null,
    amount: parseFloat(formData.get('amount') as string),
    transaction_type: formData.get('transaction_type') as string,
    description: formData.get('description') as string,
    receipt_url: formData.get('receipt_url') as string,
    transaction_date: formData.get('transaction_date') as string || new Date().toISOString().split('T')[0],
    recorded_by: user.id,
  };

  const { data, error } = await supabase
    .from('fund_transactions')
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/funds');
  return { data };
}

export async function updateFundTransaction(id: string, formData: FormData) {
  const supabase = await createClient();

  const transaction = {
    amount: parseFloat(formData.get('amount') as string),
    transaction_type: formData.get('transaction_type') as string,
    description: formData.get('description') as string,
    receipt_url: formData.get('receipt_url') as string,
    transaction_date: formData.get('transaction_date') as string,
  };

  const { data, error } = await supabase
    .from('fund_transactions')
    .update(transaction)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/funds');
  return { data };
}

export async function deleteFundTransaction(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('fund_transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return { error: error.message };
  }

  revalidatePath('/dashboard/admin/funds');
  return { success: true };
}
