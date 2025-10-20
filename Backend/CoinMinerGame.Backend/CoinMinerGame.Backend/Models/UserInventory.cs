using CoinMinerGame.Backend.Models.Shops;

namespace CoinMinerGame.Backend.Models
{
    public class UserInventory
    {
        public List<Machine> Machines { get; set; } = new();
    }
}
