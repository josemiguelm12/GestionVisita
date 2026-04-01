using System.Security.Cryptography;
using System.Text;

string password = "Admin123!";
byte[] salt = RandomNumberGenerator.GetBytes(32);
byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
    Encoding.UTF8.GetBytes(password),
    salt,
    iterations: 100000,
    HashAlgorithmName.SHA256,
    outputLength: 32
);

byte[] hashBytes = new byte[64];
Array.Copy(salt, 0, hashBytes, 0, 32);
Array.Copy(hash, 0, hashBytes, 32, 32);
Console.WriteLine(Convert.ToBase64String(hashBytes));
