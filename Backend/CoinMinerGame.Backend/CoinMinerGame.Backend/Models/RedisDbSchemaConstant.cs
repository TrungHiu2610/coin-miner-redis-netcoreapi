namespace CoinMinerGame.Backend.Models
{
    public static class RedisDbSchemaConstant
    {
        public const string UsersAllSet = "users:all";
        public const string User = "user:{0}"; // user:{userId}
        public const string UsernameToUserIdKey = "user:username_to_userid:{0}"; // user:username_to_userid:{username}
        public const string UserAuthHash = "user:{0}:auth"; // user:{userId}:auth
        public const string UserStateHash = "user:{0}:state"; // user:{userId}:state
        public const string UserInventoryKey = "user:{0}:inventory"; // user:{userId}:inventory
        public const string UserCoinHistoryList = "user:{0}:coin_history"; // user:{userId}:coin_history
        public const string UsersOnlineSet = "users:online";
        public const string LeaderboardCoinsZSet = "leaderboard:coins";
        public const string LeaderboardLastTopKey = "leaderboard:last_top";
    }
}
