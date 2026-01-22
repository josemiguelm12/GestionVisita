using System;
using System.Security.Cryptography;
using System.Text;

namespace GestionVisitaAPI.Scripts
{
    public class GeneratePasswordHash
    {
        public static void Main(string[] args)
        {
            var password = "Admin123!";
            var hashedPassword = HashPassword(password);

            Console.WriteLine("============================================================");
            Console.WriteLine("GENERADOR DE HASH DE CONTRASEÑA");
            Console.WriteLine("============================================================");
            Console.WriteLine();
            Console.WriteLine($"Contraseña original: {password}");
            Console.WriteLine($"Hash generado: {hashedPassword}");
            Console.WriteLine();
            Console.WriteLine("Copia este hash y úsalo en el script SQL");
            Console.WriteLine("============================================================");
        }

        private static string HashPassword(string password)
        {
            const int iterations = 10000;
            const int keyLength = 32;
            const int saltSize = 16;

            using (var rng = RandomNumberGenerator.Create())
            {
                byte[] salt = new byte[saltSize];
                rng.GetBytes(salt);

                using (var pbkdf2 = new Rfc2898DeriveBytes(password, salt, iterations, HashAlgorithmName.SHA256))
                {
                    byte[] hash = pbkdf2.GetBytes(keyLength);
                    byte[] hashBytes = new byte[saltSize + keyLength];

                    Array.Copy(salt, 0, hashBytes, 0, saltSize);
                    Array.Copy(hash, 0, hashBytes, saltSize, keyLength);

                    return Convert.ToBase64String(hashBytes);
                }
            }
        }
    }
}
