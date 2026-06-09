using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace server.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendContactEmail(
            string fullName,
            string email,
            string subject,
            string phone,
            string message
        )
        {
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var smtpUser = _configuration["EmailSettings:SmtpUser"];
            var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
            var toEmail = _configuration["EmailSettings:ToEmail"];

            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress("SAMCT Website", smtpUser));
            emailMessage.To.Add(MailboxAddress.Parse(toEmail));
            emailMessage.ReplyTo.Add(new MailboxAddress(fullName, email));
            emailMessage.Subject = $"Contact Form: {subject}";

            emailMessage.Body = new TextPart("plain")
            {
                Text =
$@"New contact message from SAMCT website

Name: {fullName}
Email: {email}
Subject: {subject}
Phone: {phone}

Message:
{message}"
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(smtpUser, smtpPassword);
            await smtp.SendAsync(emailMessage);
            await smtp.DisconnectAsync(true);
        }

        public async Task SendPasswordResetEmail(string toEmail, string resetLink)
        {
            var smtpHost = _configuration["EmailSettings:SmtpHost"];
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var smtpUser = _configuration["EmailSettings:SmtpUser"];
            var smtpPassword = _configuration["EmailSettings:SmtpPassword"];

            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress("SAMCT Villages", smtpUser));
            emailMessage.To.Add(MailboxAddress.Parse(toEmail));
            emailMessage.Subject = "Reset your SAMCT password";

            emailMessage.Body = new TextPart("html")
            {
                Text =
$@"
<p>Hello,</p>
<p>Please click the link below to reset your password:</p>
<p><a href='{resetLink}'>Reset Password</a></p>
<p>This link will expire in 1 hour.</p>
"
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(smtpUser, smtpPassword);
            await smtp.SendAsync(emailMessage);
            await smtp.DisconnectAsync(true);
        }
    }
}