namespace CoinMinerGame.Backend.Models.Shops
{
    public class Boost
    {
        public string Type { get; set; } = default!;
        public int Multiplier { get; set; }
        public int Duration { get; set; } 
        public int Cost { get; set; }
    }
}
