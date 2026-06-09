namespace server.Services
{
    public interface IEmailService
    {
        Task SendContactEmail(
            string fullName,
            string email,
            string subject,
            string phone,
            string message
        );

        Task SendPasswordResetEmail(string toEmail, string resetLink);
    }
}
