-- ============================================================
-- MIGRATION: Create Admin System Tables
-- Date: 2024-03-28
-- Description: Creates users_roles, responsaveis, and alunos
--              tables with RLS policies and indexes
-- ============================================================

-- Create users_roles table
CREATE TABLE IF NOT EXISTS users_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(30) NOT NULL CHECK (role IN ('admin', 'admin_programador', 'responsavel', 'aluno')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create responsaveis table
CREATE TABLE IF NOT EXISTS responsaveis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo VARCHAR(100) NOT NULL,
  grau_parentesco VARCHAR(50) NOT NULL,
  endereco VARCHAR(255),
  email VARCHAR(100),
  cpf VARCHAR(14) UNIQUE,
  celular VARCHAR(15),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create alunos table
CREATE TABLE IF NOT EXISTS alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome VARCHAR(100) NOT NULL,
  data_nascimento DATE NOT NULL,
  categoria VARCHAR(20) NOT NULL CHECK (categoria IN ('sub14', 'sub18_a', 'sub18_b', 'adultos')),
  responsavel_id UUID REFERENCES responsaveis(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE responsaveis ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- users_roles Policies
-- ============================================================

CREATE POLICY "Users can view their own role"
  ON users_roles FOR SELECT
  USING (auth.uid() = user_id OR 
         (SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can manage all roles"
  ON users_roles FOR ALL
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

-- ============================================================
-- responsaveis Policies
-- ============================================================

CREATE POLICY "Responsaveis can view their own data"
  ON responsaveis FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all responsaveis"
  ON responsaveis FOR SELECT
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can create responsaveis"
  ON responsaveis FOR INSERT
  WITH CHECK ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can update responsaveis"
  ON responsaveis FOR UPDATE
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can delete responsaveis"
  ON responsaveis FOR DELETE
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

-- ============================================================
-- alunos Policies
-- ============================================================

CREATE POLICY "Alunos can view their own data"
  ON alunos FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Responsaveis can view their students"
  ON alunos FOR SELECT
  USING (responsavel_id IN (
    SELECT id FROM responsaveis WHERE user_id = auth.uid()
  ));

CREATE POLICY "Admins can view all alunos"
  ON alunos FOR SELECT
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can create alunos"
  ON alunos FOR INSERT
  WITH CHECK ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can update alunos"
  ON alunos FOR UPDATE
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

CREATE POLICY "Admins can delete alunos"
  ON alunos FOR DELETE
  USING ((SELECT role FROM users_roles WHERE user_id = auth.uid()) IN ('admin', 'admin_programador'));

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

CREATE INDEX idx_users_roles_user_id ON users_roles(user_id);
CREATE INDEX idx_responsaveis_user_id ON responsaveis(user_id);
CREATE INDEX idx_alunos_user_id ON alunos(user_id);
CREATE INDEX idx_alunos_responsavel_id ON alunos(responsavel_id);
CREATE INDEX idx_alunos_categoria ON alunos(categoria);
CREATE INDEX idx_alunos_nome ON alunos(nome);
CREATE INDEX idx_responsaveis_email ON responsaveis(email);
CREATE INDEX idx_responsaveis_cpf ON responsaveis(cpf);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to count students per responsavel
CREATE OR REPLACE FUNCTION count_students_by_responsavel(responsavel_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM alunos WHERE responsavel_id = $1;
$$ LANGUAGE SQL;

-- Function to check if responsavel can add more students
CREATE OR REPLACE FUNCTION can_add_student_to_responsavel(responsavel_id UUID)
RETURNS BOOLEAN AS $$
  SELECT COUNT(*) < 4 FROM alunos WHERE responsavel_id = $1;
$$ LANGUAGE SQL;
