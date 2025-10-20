namespace CoinMinerGame.Backend.Models
{
    public static class UserDbSchemaConstant
    {
        // state
        public const string Coins = "coins";
        public const string CoinsPerSecond = "coins_per_second";
        public const string Level = "level";
        public const string LastUpdate = "last_update";

        // auth
        public const string Username = "username";
        public const string PasswordHash = "password_hash";
        public const string CreatedAt = "created_at";

        // inventory
        public const string InventoryItems = "inventory_items";
        public const string InventoryItemName = "name";
        public const string InventoryItemCoinsPerSecond = "coins_per_second";
    }
}
