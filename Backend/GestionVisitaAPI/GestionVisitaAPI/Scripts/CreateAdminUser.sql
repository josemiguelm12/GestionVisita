-- ============================================================
-- SCRIPT: Crear Usuario Administrador de Prueba
-- Base de Datos: GestionVisitaDB
-- Fecha: 2026-01-19
-- ============================================================

USE GestionVisitaDB;
GO

-- Paso 1: Verificar si el usuario ya existe
IF EXISTS (SELECT 1 FROM users WHERE email = 'admin@gestionvisitas.com')
BEGIN
    PRINT '?? El usuario admin@gestionvisitas.com ya existe.';
    PRINT 'Eliminando usuario existente...';
    
    -- Eliminar relaciones
    DELETE FROM role_user WHERE user_id = (SELECT id FROM users WHERE email = 'admin@gestionvisitas.com');
    -- Eliminar usuario
    DELETE FROM users WHERE email = 'admin@gestionvisitas.com';
    
    PRINT '? Usuario anterior eliminado.';
END
GO

PRINT '';
PRINT '============================================================';
PRINT '?? CREANDO USUARIO ADMINISTRADOR';
PRINT '============================================================';
PRINT '';

-- Paso 2: Insertar el usuario administrador
-- NOTA: La contraseña aquí es temporal y en texto plano
-- La API hasheará la contraseña en el primer login
-- O puedes actualizarla manualmente con un hash generado

DECLARE @tempPassword NVARCHAR(100) = 'Admin123!';

INSERT INTO users (name, email, password, is_active, created_at, updated_at)
VALUES (
    'Administrador Sistema',
    'admin@gestionvisitas.com',
    @tempPassword, -- ?? TEMPORAL: Deberás actualizar esto con un hash
    1, -- is_active = true
    GETUTCDATE(),
    GETUTCDATE()
);

DECLARE @userId INT = SCOPE_IDENTITY();
PRINT '? Usuario creado con ID: ' + CAST(@userId AS VARCHAR(10));

-- Paso 3: Asignar el rol "Admin" (id = 1)
INSERT INTO role_user (user_id, role_id)
VALUES (@userId, 1);

PRINT '? Rol Admin asignado correctamente';
PRINT '';

-- Paso 4: Verificar el usuario creado
PRINT '?? INFORMACIÓN DEL USUARIO:';
PRINT '============================================================';

SELECT 
    u.id AS [ID],
    u.name AS [Nombre],
    u.email AS [Email],
    CASE WHEN u.is_active = 1 THEN 'Activo' ELSE 'Inactivo' END AS [Estado],
    r.name AS [Rol],
    u.created_at AS [Fecha Creación]
FROM users u
INNER JOIN role_user ru ON u.id = ru.user_id
INNER JOIN roles r ON ru.role_id = r.id
WHERE u.email = 'admin@gestionvisitas.com';

PRINT '';
PRINT '============================================================';
PRINT '? USUARIO ADMINISTRADOR CREADO EXITOSAMENTE';
PRINT '============================================================';
PRINT '';
PRINT '?? Email: admin@gestionvisitas.com';
PRINT '?? Contraseña: Admin123!';
PRINT '';
PRINT '?? IMPORTANTE: La contraseña está en texto plano.';
PRINT '   Debes hashearla antes de usar el sistema en producción.';
PRINT '';
PRINT '?? Para hashear la contraseña, ejecuta:';
PRINT '   dotnet run --project GestionVisitaAPI -- hash-password Admin123!';
PRINT '';
PRINT '   O ejecuta el script: Generate-PasswordHash.ps1';
PRINT '============================================================';
GO
