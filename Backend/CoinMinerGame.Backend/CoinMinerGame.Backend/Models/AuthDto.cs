namespace CoinMinerGame.Backend.Models
{
    public class AuthDto
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string? ConfirmPassword { get; set; }
    }
}
