using CoinMinerGame.Backend.Hubs;
using CoinMinerGame.Backend.Models;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;

namespace CoinMinerGame.Backend.Services
{
    public class LeaderboardService
    {
        private readonly RedisService _redis;

        public LeaderboardService(RedisService redis, IHubContext<GameHub> hubContext)
        {
            _redis = redis;
        }
        public async Task CheckAndNotifyLeaderChange(string potentialNewLeaderId)
        {
            var lastTopId = await _redis.Db.StringGetAsync(RedisDbSchemaConstant.LeaderboardLastTopKey);
            var topUsers = await _redis.Db.SortedSetRangeByRankAsync(RedisDbSchemaConstant.LeaderboardCoinsZSet, 0, 0, Order.Descending);
            var currentTopId = topUsers.FirstOrDefault();

            if (currentTopId.HasValue && currentTopId != lastTopId)
            {
                if (currentTopId.ToString() == potentialNewLeaderId)
                {
                    var newLeaderUsername = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, currentTopId), UserDbSchemaConstant.Username);
                    string message = $"User {newLeaderUsername} has become the leader !";

                    if (lastTopId.HasValue)
                    {
                        var prevLeaderUsername = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, lastTopId), UserDbSchemaConstant.Username);
                        message = $"User {newLeaderUsername} has just surpassed {prevLeaderUsername} to become the new leader !";
                    }

                    await _redis.Db.StringSetAsync(RedisDbSchemaConstant.LeaderboardLastTopKey, currentTopId);

                    var leaderboardEvent = new GameEvent<string>
                    {
                        Type = GameEventTypeConstant.LeaderboardChanged,
                        Payload = message
                    };
                    await _redis.Subscriber.PublishAsync("game-events", leaderboardEvent.Serialize());
                }
            }
        }

    }
}
