using System.IO.Compression;

namespace server.Security;

public sealed class UploadValidationException(string message) : Exception(message);

public class UploadStorage(IWebHostEnvironment environment, IConfiguration configuration)
{
    public string Root => Path.GetFullPath(configuration["Storage:UploadPath"] ?? Path.Combine(environment.ContentRootPath, "storage", "uploads"));
    private static readonly Dictionary<string, string> Types = new(StringComparer.OrdinalIgnoreCase) {
        [".png"] = "image/png", [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg", [".pdf"] = "application/pdf",
        [".docx"] = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        [".xlsx"] = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    };
    public static bool IsImage(string path) => new[] { ".png", ".jpg", ".jpeg" }.Contains(Path.GetExtension(path).ToLowerInvariant());
    public static string ContentType(string path) => Types.GetValueOrDefault(Path.GetExtension(path), "application/octet-stream");

    public async Task<string> Save(IFormFile? file, string folder, bool imagesOnly = false)
    {
        if (file is null) return "";
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var limit = imagesOnly ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.Length < 1 || file.Length > limit) throw new UploadValidationException($"Files must be between 1 byte and {limit / 1024 / 1024} MB.");
        if (!Types.ContainsKey(extension) || (imagesOnly && !IsImage(extension)))
            throw new UploadValidationException(imagesOnly ? "Only PNG and JPEG images are allowed." : "Use a PDF, DOCX, XLSX, PNG or JPEG file. Legacy DOC/XLS files are not accepted.");
        if (!string.IsNullOrEmpty(file.ContentType) && file.ContentType != "application/octet-stream" && file.ContentType != Types[extension])
            throw new UploadValidationException("The file type does not match its extension.");
        await using var input = file.OpenReadStream();
        await ValidateSignature(input, extension);
        input.Position = 0;
        var filename = $"{Guid.NewGuid():N}{extension}";
        var directory = Path.Combine(Root, folder);
        Directory.CreateDirectory(directory);
        await using var output = new FileStream(Path.Combine(directory, filename), FileMode.CreateNew);
        await input.CopyToAsync(output);
        return $"/uploads/{folder}/{filename}";
    }

    public string? Resolve(string relativePath)
    {
        if (relativePath.Contains('\\') || relativePath.Split('/').Any(part => part is ".." or ".")) return null;
        // Legacy files remain accessible only through the same authorization checks.
        foreach (var root in new[] { Root, Path.Combine(environment.ContentRootPath, "wwwroot", "uploads") }) {
            var fullRoot = Path.GetFullPath(root) + Path.DirectorySeparatorChar;
            var candidate = Path.GetFullPath(Path.Combine(fullRoot, relativePath));
            if (candidate.StartsWith(fullRoot, StringComparison.Ordinal) && File.Exists(candidate)) return candidate;
        }
        return null;
    }

    public static async Task ValidateSignature(Stream input, string extension)
    {
        var header = new byte[8];
        var length = await input.ReadAsync(header);
        bool valid = extension switch {
            ".png" => length == 8 && header.SequenceEqual(new byte[] {137,80,78,71,13,10,26,10}),
            ".jpg" or ".jpeg" => length >= 3 && header[0] == 255 && header[1] == 216 && header[2] == 255,
            ".pdf" => length >= 5 && System.Text.Encoding.ASCII.GetString(header,0,5) == "%PDF-",
            ".docx" or ".xlsx" => length >= 4 && header[0] == 80 && header[1] == 75 && header[2] == 3 && header[3] == 4,
            _ => false
        };
        if (!valid) throw new UploadValidationException("The file content does not match an allowed file type.");
        if (extension is ".docx" or ".xlsx") {
            try {
                input.Position = 0;
                using var archive = new ZipArchive(input, ZipArchiveMode.Read, leaveOpen: true);
                var required = extension == ".docx" ? "word/document.xml" : "xl/workbook.xml";
                if (archive.Entries.Count > 2000 || archive.Entries.Sum(entry => entry.Length) > 50 * 1024 * 1024 ||
                    archive.GetEntry("[Content_Types].xml") is null || archive.GetEntry(required) is null ||
                    archive.Entries.Any(entry => entry.FullName.EndsWith("vbaProject.bin", StringComparison.OrdinalIgnoreCase)))
                    throw new UploadValidationException("This Office file is not supported.");
            } catch (InvalidDataException) { throw new UploadValidationException("This Office file is invalid."); }
        }
    }
}
