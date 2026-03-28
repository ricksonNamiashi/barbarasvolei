export type UserRole = 'admin' | 'admin_programador' | 'responsavel' | 'aluno';
export type StudentCategory = 'sub14' | 'sub18_a' | 'sub18_b' | 'adultos';

export interface Aluno {
  id: string;
  user_id: string | null;
  nome: string;
  data_nascimento: string;
  categoria: StudentCategory;
  responsavel_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Responsavel {
  id: string;
  user_id: string;
  nome_completo: string;
  grau_parentesco: string;
  endereco: string;
  email: string;
  cpf: string;
  celular: string;
  created_at: string;
  updated_at: string;
}

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole | null;
}
