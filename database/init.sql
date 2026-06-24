-- Habilitar la extensión para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- 1. CREACIÓN DE TABLAS
-- =====================================================================

-- A. Tabla de Grupos (creados por los orientadores)
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    counselor_id UUID NOT NULL,               -- Clave foránea lógica hacia el Auth Service (Orientador)
    name VARCHAR(100) NOT NULL,               -- Nombre del grupo, ej: "6to de Preparatoria A"
    access_code VARCHAR(15) UNIQUE NOT NULL,  -- Código para que los alumnos se unan al grupo
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- B. Tabla de Perfiles Vocacionales de Estudiantes
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,             -- Clave foránea lógica hacia el Auth Service (Estudiante)
    subjects_liked TEXT[] DEFAULT '{}',
    subjects_disliked TEXT[] DEFAULT '{}',
    interests TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    needs_scholarship BOOLEAN DEFAULT FALSE,
    study_abroad BOOLEAN DEFAULT FALSE,
    vocational_clarity INTEGER DEFAULT 5 CHECK (vocational_clarity BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- C. Tabla Pivote M:N (student_group) - Relación Alumnos y Grupos
CREATE TABLE IF NOT EXISTS student_group (
    user_id UUID NOT NULL,                    -- Clave foránea física hacia student_profiles.user_id
    group_id UUID NOT NULL,                   -- Clave foránea física hacia groups.id
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, group_id),
    CONSTRAINT fk_student_group_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_student_group_profile FOREIGN KEY (user_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE
);

-- D. Sesiones de Orientación Individual (Seguimiento del orientador)
CREATE TABLE IF NOT EXISTS counselor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,                 -- Clave foránea física a student_profiles.user_id
    counselor_id UUID NOT NULL,               -- Clave foránea lógica a auth_db.users.id
    session_date TIMESTAMP WITH TIME ZONE NOT NULL,
    motive VARCHAR(255) NOT NULL,             -- Ej: 'Alta indecisión', 'Revisión de resultados'
    observations TEXT,
    agreement TEXT,                           -- Acuerdos logrados con el estudiante
    status VARCHAR(50) DEFAULT 'SCHEDULED',   -- Ej: 'SCHEDULED', 'COMPLETED', 'CANCELLED'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sessions_profile FOREIGN KEY (student_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE
);

-- E. Tareas Vocacionales Asignadas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(150) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PENDING',     -- Ej: 'PENDING', 'COMPLETED'
    group_id UUID NULL,                       -- Si es una tarea grupal
    student_id UUID NULL,                     -- Si es una tarea individual dirigida
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_tasks_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    CONSTRAINT fk_tasks_profile FOREIGN KEY (student_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE
);

-- F. Alertas Vocacionales (Generadas por el sistema para llamar la atención del orientador)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    group_id UUID NULL,
    alert_type VARCHAR(50) NOT NULL,          -- Ej: 'HIGH_INDECISION', 'NO_PROGRESS', 'SCHOLARSHIP_NEED'
    status VARCHAR(50) DEFAULT 'PENDING',     -- Ej: 'PENDING', 'IN_REVIEW', 'RESOLVED'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_alerts_profile FOREIGN KEY (student_id) REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_alerts_group FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
);

-- G. Consentimiento de Privacidad (Privacy)
CREATE TABLE IF NOT EXISTS user_consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL,             -- Clave foránea lógica a auth_db.users.id
    consent_type VARCHAR(50) DEFAULT 'GENERAL',
    accepted BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- H. Notificaciones en la App (Notifications)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,                    -- Clave foránea lógica a auth_db.users.id
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- 2. CREACIÓN DE ÍNDICES (Para mejorar el rendimiento)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_code ON groups(access_code);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON counselor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_student ON tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_group ON tasks(group_id);
CREATE INDEX IF NOT EXISTS idx_alerts_student ON alerts(student_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- =====================================================================
-- 3. TRIGGERS PARA ACTUALIZAR LA COLUMNA UPDATED_AT AUTOMÁTICAMENTE
-- =====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para groups
CREATE TRIGGER trigger_update_groups_updated_at
    BEFORE UPDATE ON groups
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para student_profiles
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para counselor_sessions
CREATE TRIGGER trigger_update_sessions_updated_at
    BEFORE UPDATE ON counselor_sessions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para tasks
CREATE TRIGGER trigger_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();

-- Trigger para alerts
CREATE TRIGGER trigger_update_alerts_updated_at
    BEFORE UPDATE ON alerts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();