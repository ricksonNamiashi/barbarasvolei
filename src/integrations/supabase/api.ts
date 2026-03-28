import { supabase } from './client';
import { Aluno, Responsavel } from './types';

// ===== ALUNOS =====
export const getAlunos = async () => {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .order('nome', { ascending: true });
  return { data: (data as Aluno[]) || [], error };
};

export const getAlunoById = async (id: string) => {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('id', id)
    .single();
  return { data: (data as Aluno) || null, error };
};

export const getAlunosByResponsavel = async (responsavelId: string) => {
  const { data, error } = await supabase
    .from('alunos')
    .select('*')
    .eq('responsavel_id', responsavelId)
    .order('nome', { ascending: true });
  return { data: (data as Aluno[]) || [], error };
};

export const createAluno = async (aluno: Omit<Aluno, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('alunos')
    .insert([aluno])
    .select()
    .single();
  return { data: (data as Aluno) || null, error };
};

export const updateAluno = async (id: string, updates: Partial<Aluno>) => {
  const { data, error } = await supabase
    .from('alunos')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: (data as Aluno) || null, error };
};

export const deleteAluno = async (id: string) => {
  const { error } = await supabase
    .from('alunos')
    .delete()
    .eq('id', id);
  return { error };
};

// ===== RESPONSÁVEIS =====
export const getResponsaveis = async () => {
  const { data, error } = await supabase
    .from('responsaveis')
    .select('*')
    .order('nome_completo', { ascending: true });
  return { data: (data as Responsavel[]) || [], error };
};

export const getResponsavelById = async (id: string) => {
  const { data, error } = await supabase
    .from('responsaveis')
    .select('*')
    .eq('id', id)
    .single();
  return { data: (data as Responsavel) || null, error };
};

export const createResponsavel = async (
  responsavel: Omit<Responsavel, 'id' | 'created_at' | 'updated_at'>
) => {
  const { data, error } = await supabase
    .from('responsaveis')
    .insert([responsavel])
    .select()
    .single();
  return { data: (data as Responsavel) || null, error };
};

export const updateResponsavel = async (id: string, updates: Partial<Responsavel>) => {
  const { data, error } = await supabase
    .from('responsaveis')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data: (data as Responsavel) || null, error };
};

export const deleteResponsavel = async (id: string) => {
  const { error } = await supabase
    .from('responsaveis')
    .delete()
    .eq('id', id);
  return { error };
};

// ===== VALIDAÇÕES =====
export const checkResponsavelStudentCount = async (responsavelId: string) => {
  const { data, error } = await supabase
    .from('alunos')
    .select('id', { count: 'exact' })
    .eq('responsavel_id', responsavelId);
  return { count: data?.length || 0, error };
};

export const canAddStudentToResponsavel = async (responsavelId: string) => {
  const { count } = await checkResponsavelStudentCount(responsavelId);
  return count < 4;
};

export const linkAlunoToResponsavel = async (alunoId: string, responsavelId: string) => {
  // Validar limite de 4 alunos
  const canAdd = await canAddStudentToResponsavel(responsavelId);
  if (!canAdd) {
    return { error: { message: 'Responsável já possui 4 alunos (limite máximo)' } };
  }

  return updateAluno(alunoId, { responsavel_id: responsavelId });
};
