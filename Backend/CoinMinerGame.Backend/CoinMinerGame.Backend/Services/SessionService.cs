using CoinMinerGame.Backend.Hubs;
using CoinMinerGame.Backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace CoinMinerGame.Backend.Services
{
    public class SessionService
    {
        private readonly RedisService _redis;
        private readonly IHubContext<GameHub> _hubContext;

        public SessionService(RedisService redis, IHubContext<GameHub> hubContext)
        {
            _redis = redis;
        }

        // update user:id:auth hash last_update for now
        public async Task UpdateUserLastActive(string userId)
        {
            await _redis.Db.HashSetAsync(
                string.Format(RedisDbSchemaConstant.UserStateHash, userId),
                UserDbSchemaConstant.LastUpdate,
                DateTime.UtcNow.ToString());
        }
    }
}
