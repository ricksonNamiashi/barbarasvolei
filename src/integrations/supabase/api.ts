import { supabase } from './client';

// ===== STUDENTS =====
export const getStudents = async () => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .order('name', { ascending: true });
  return { data: data || [], error };
};

export const getStudentById = async (id: string) => {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
};

export const createStudent = async (student: { name: string; age: number; category: string; responsible: string; status?: string }) => {
  const { data, error } = await supabase
    .from('students')
    .insert([student])
    .select()
    .single();
  return { data, error };
};

export const updateStudent = async (id: string, updates: Partial<{ name: string; age: number; category: string; responsible: string; status: string }>) => {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteStudent = async (id: string) => {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);
  return { error };
};
