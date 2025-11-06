namespace CoinMinerGame.Backend.Models.Requests
{
    public class ActivateBoostRequest
    {
        public string Type { get; set; } = default!;
        public string? Name { get; set; }
    }
}
