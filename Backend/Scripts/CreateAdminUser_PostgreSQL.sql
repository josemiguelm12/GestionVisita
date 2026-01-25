-- Script para crear usuario administrador en PostgreSQL (Supabase)
-- Ejecuta este script en SQL Editor de Supabase
-- IMPORTANTE: Necesitas reemplazar el hash generado con el PowerShell script

-- Primero genera el hash ejecutando en PowerShell:
-- cd Backend\Scripts
-- dotnet run --project ../GestionVisitaAPI.csproj GenerateHash "Admin123!"

-- Insertar rol de Administrador
INSERT INTO roles ("Name", "Description", "CreatedAt", "UpdatedAt")
VALUES ('Admin', 'Administrador del sistema', NOW(), NOW())
ON CONFLICT ("Name") DO NOTHING;

INSERT INTO users ("Name", "Email", "Password", "IsActive", "CreatedAt", "UpdatedAt")
VALUES (
    'Administrador Sistema',
    'admin@gestionvisitas.com',
    'ZfVVLxvb8bJ8PYthRNJILsoxL5PsgUEO6zYQPKxpfFtPSvE/uQNEIJHhPAy4UqTfT1YGzn6qiLN1xGlMNkjZsw==',
    true,
    NOW(),
    NOW()
)
ON CONFLICT ("Email") DO NOTHING;

INSERT INTO role_user (role_id, user_id)
SELECT r."Id", u."Id"
FROM roles r, users u
WHERE r."Name" = 'Admin' AND u."Email" = 'admin@gestionvisitas.com';

SELECT 'Usuario administrador creado exitosamente' AS result;
SELECT 'Email: admin@gestionvisitas.com' AS login_email;
SELECT 'Password: Admin123!' AS login_password;
