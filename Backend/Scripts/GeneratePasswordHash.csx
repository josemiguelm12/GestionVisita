using GestionVisitaAPI.Helpers;

// Genera el hash para la contraseña "Admin123!"
var password = "Admin123!";
var hashedPassword = PasswordHelper.HashPassword(password);

Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine("GENERADOR DE HASH DE CONTRASEÑA");
Console.WriteLine("=".PadRight(60, '='));
Console.WriteLine();
Console.WriteLine($"Contraseña original: {password}");
Console.WriteLine($"Hash generado: {hashedPassword}");
Console.WriteLine();
Console.WriteLine("Copia este hash y úsalo en el script SQL");
Console.WriteLine("=".PadRight(60, '='));
