using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using System.Text.Encodings.Web;
using System.Text.Json;

namespace server.Services;

public class EmailService(IConfiguration configuration, IWebHostEnvironment environment) : IEmailService
{
    private string Setting(string name) => configuration["EmailSettings:" + name] is { Length: > 0 } value
        ? value : throw new InvalidOperationException("Email service is not configured.");

    private async Task Send(string recipient, string subject, TextPart body, string? replyName = null, string? replyEmail = null)
    {
        // No network email during isolated E2E tests. There is no HTTP endpoint to read this outbox.
        if (environment.IsEnvironment("Testing") && configuration["Testing:OutboxPath"] is { Length: > 0 } outbox) {
            Directory.CreateDirectory(outbox);
            await File.WriteAllTextAsync(Path.Combine(outbox, Guid.NewGuid() + ".json"), JsonSerializer.Serialize(new { recipient, subject, body = body.Text }));
            return;
        }
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("SAMCT Villages", Setting("SmtpUser")));
        message.To.Add(MailboxAddress.Parse(recipient));
        if (replyEmail is not null) message.ReplyTo.Add(new MailboxAddress(replyName, replyEmail));
        message.Subject = subject;
        message.Body = body;
        using var smtp = new SmtpClient { Timeout = 15000 };
        var port = int.Parse(configuration["EmailSettings:SmtpPort"] ?? "587");
        await smtp.ConnectAsync(Setting("SmtpHost"), port, port == 465 ? SecureSocketOptions.SslOnConnect : SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(Setting("SmtpUser"), Setting("SmtpPassword"));
        await smtp.SendAsync(message);
        await smtp.DisconnectAsync(true);
    }
    public Task SendContactEmail(string fullName, string email, string subject, string phone, string message) =>
        Send(Setting("ToEmail"), $"Contact Form: {subject}", new TextPart("plain") {
            Text = $"New SAMCT contact message\n\nName: {fullName}\nEmail: {email}\nPhone: {phone}\nSubject: {subject}\n\n{message}"
        }, fullName, email);
    public Task SendPasswordResetEmail(string toEmail, string resetLink) => Send(toEmail, "Reset your SAMCT password",
        new TextPart("html") { Text = $"<p>Hello,</p><p><a href=\"{HtmlEncoder.Default.Encode(resetLink)}\">Reset your SAMCT password</a></p><p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>" });
}
