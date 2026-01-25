using System.Security.Cryptography;
using System.Text;

namespace GestionVisitaAPI.Helpers;

/// <summary>
/// Helper para hash y validaci�n de contrase�as
/// Utiliza PBKDF2 para hash seguro
/// </summary>
public static class PasswordHelper
{
    /// <summary>
    /// Genera un hash de contrase�a usando PBKDF2 + Salt
    /// </summary>
    public static string HashPassword(string password)
    {
        // Generar salt aleatorio
        byte[] salt = RandomNumberGenerator.GetBytes(32);
        
        // Hash con PBKDF2
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password),
            salt,
            iterations: 100000,
            HashAlgorithmName.SHA256,
            outputLength: 32
        );

        // Combinar salt + hash
        byte[] hashBytes = new byte[salt.Length + hash.Length];
        Array.Copy(salt, 0, hashBytes, 0, salt.Length);
        Array.Copy(hash, 0, hashBytes, salt.Length, hash.Length);

        return Convert.ToBase64String(hashBytes);
    }

    /// <summary>
    /// Verifica si una contrase�a coincide con su hash
    /// </summary>
    public static bool VerifyPassword(string password, string storedHash)
    {
        try
        {
            byte[] hashBytes = Convert.FromBase64String(storedHash);

            // Extraer salt (primeros 32 bytes)
            byte[] salt = new byte[32];
            Array.Copy(hashBytes, 0, salt, 0, 32);

            // Generar hash de la contrase�a proporcionada
            byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
                Encoding.UTF8.GetBytes(password),
                salt,
                iterations: 100000,
                HashAlgorithmName.SHA256,
                outputLength: 32
            );

            // Comparar hashes
            for (int i = 0; i < 32; i++)
            {
                if (hashBytes[i + 32] != hash[i])
                {
                    return false;
                }
            }

            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// Genera una contrase�a aleatoria segura
    /// </summary>
    public static string GenerateRandomPassword(int length = 16)
    {
        const string validChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*";
        var password = new StringBuilder();
        
        using (var rng = RandomNumberGenerator.Create())
        {
            byte[] randomBytes = new byte[length];
            rng.GetBytes(randomBytes);

            foreach (byte b in randomBytes)
            {
                password.Append(validChars[b % validChars.Length]);
            }
        }

        return password.ToString();
    }
}
