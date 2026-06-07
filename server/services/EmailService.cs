using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace server.Services
{
    public class EmailService
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

            if (
                string.IsNullOrWhiteSpace(smtpHost) ||
                string.IsNullOrWhiteSpace(smtpUser) ||
                string.IsNullOrWhiteSpace(smtpPassword) ||
                string.IsNullOrWhiteSpace(toEmail)
            )
            {
                throw new Exception("Email settings are missing in appsettings.json.");
            }

            var emailMessage = new MimeMessage();

            emailMessage.From.Add(new MailboxAddress("SAMCT Website", smtpUser));
            emailMessage.To.Add(new MailboxAddress("SAMCT", toEmail));
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
    }
}