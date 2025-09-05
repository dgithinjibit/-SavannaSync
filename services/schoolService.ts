
import { supabase } from './supabaseClient';
import { School } from '../types';

export const getSchoolsByCounty = async (county: string): Promise<School[]> => {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('county', county);

  if (error) {
    console.error('Error fetching schools:', error);
    throw error;
  }
  return data || [];
};

export const getAllSchools = async (): Promise<School[]> => {
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name', { ascending: true });
  
    if (error) {
      console.error('Error fetching all schools:', error);
      throw error;
    }
    return data || [];
};

export const addSchool = async (name: string, county: string): Promise<School> => {
  // Check for duplicates first
  const { data: existing, error: selectError } = await supabase
    .from('schools')
    .select('id')
    .eq('name', name)
    .eq('county', county)
    .single();

  if (selectError && selectError.code !== 'PGRST116') { // Ignore 'exact one row' error
      console.error('Error checking for existing school:', selectError);
      throw selectError;
  }
  
  if (existing) {
    throw new Error('A school with this name already exists in this county.');
  }

  const { data, error: insertError } = await supabase
    .from('schools')
    .insert([{ name, county }])
    .select()
    .single();

  if (insertError) {
    console.error('Error adding school:', insertError);
    throw insertError;
  }
  return data;
};
