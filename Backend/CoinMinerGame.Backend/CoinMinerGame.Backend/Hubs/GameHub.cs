using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization; 
using System.Security.Claims; 

namespace CoinMinerGame.Backend.Hubs
{
    [Authorize] 
    public class GameHub : Hub
    {
        private readonly RedisService _redis;

        public GameHub(RedisService redis)
        {
            _redis = redis;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await _redis.Db.SetAddAsync(RedisDbSchemaConstant.UsersOnlineSet, userId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!string.IsNullOrEmpty(userId))
            {
                await _redis.Db.HashSetAsync(
                        string.Format(RedisDbSchemaConstant.UserStateHash, userId),
                        UserDbSchemaConstant.LastUpdate,
                        DateTime.UtcNow.ToString());
                await _redis.Db.SetRemoveAsync(RedisDbSchemaConstant.UsersOnlineSet, userId);
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
