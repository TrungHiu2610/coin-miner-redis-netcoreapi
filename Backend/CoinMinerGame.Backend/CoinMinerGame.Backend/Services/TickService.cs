using System.Text.Json;
using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Models.Shops;
using NReJSON;
using StackExchange.Redis;

namespace CoinMinerGame.Backend.Services
{
    public class TickService : BackgroundService
    {
        private readonly RedisService _redis;
        private readonly LeaderboardService _leaderboardService;

        public TickService(RedisService redis, LeaderboardService leaderboardService)
        {
            _redis = redis;
            _leaderboardService = leaderboardService;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                var userIds = await _redis.Db.SetMembersAsync(RedisDbSchemaConstant.UsersOnlineSet);

                foreach (var redisValue in userIds)
                {
                    var userId = redisValue.ToString();
                    var userStateKey = string.Format(RedisDbSchemaConstant.UserStateHash, userId);

                    var inventoryKey = string.Format(RedisDbSchemaConstant.UserInventoryKey, userId);
                    int baseCps = 0;
                    if (await _redis.Db.KeyExistsAsync(inventoryKey))
                    {
                        try
                        {
                            var inventoryResult = await _redis.Db.JsonGetAsync<UserInventory>(inventoryKey, ".");
                            if (inventoryResult?.InnerResult is RedisResult redisResult && redisResult.ToString() is string json)
                            {
                                var inventory = JsonSerializer.Deserialize<UserInventory>(json);
                                if (inventory != null && inventory.Machines != null)
                                {
                                    baseCps = inventory.Machines.Sum(m => m.Cps);
                                }
                            }
                        }
                        catch (StackExchange.Redis.RedisServerException ex) when (ex.Message.Contains("WRONGTYPE"))
                        {
                            await _redis.Db.KeyDeleteAsync(inventoryKey);
                            Console.WriteLine($"[TickService] Deleted legacy string key at {inventoryKey}.");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"[TickService] Error processing inventory for user {userId}: {ex.Message}");
                        }
                    }

                    if (baseCps > 0)
                    {
                        var boostMultiplier = await GetCurrentBoost(userId, "passive");
                        var finalCps = baseCps * boostMultiplier;

                        var newTotalCoins = await _redis.Db.HashIncrementAsync(userStateKey, UserDbSchemaConstant.Coins, finalCps);

                        await _redis.Db.HashSetAsync(userStateKey, UserDbSchemaConstant.CoinsPerSecond, finalCps);

                        await _redis.Db.ListLeftPushAsync(string.Format(RedisDbSchemaConstant.UserCoinHistoryList, userId), newTotalCoins);
                        await _redis.Db.ListTrimAsync(string.Format(RedisDbSchemaConstant.UserCoinHistoryList, userId), 0, 49);
                        await _redis.Db.SortedSetIncrementAsync(RedisDbSchemaConstant.LeaderboardCoinsZSet, userId, finalCps);

                        var username = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, userId), UserDbSchemaConstant.Username);
                        
                        var message = $"User {username} gained {finalCps} coins from passive income.";
                        var coinEventPayload = new CoinChangedPayload(userId, newTotalCoins, message, finalCps);
                        var coinEvent = new GameEvent<CoinChangedPayload>
                        {
                            Type = GameEventTypeConstant.CoinChanged,
                            Payload = coinEventPayload
                        };
                        await _redis.Subscriber.PublishAsync("game-events", coinEvent.Serialize());

                        await _leaderboardService.CheckAndNotifyLeaderChange(userId);
                    }
                }

                await Task.Delay(1000, stoppingToken);
            }
        }

        private async Task<double> GetCurrentBoost(string userId, string boostType)
        {
            var boostKey = $"boost:{userId}:{boostType}";
            var boostValue = await _redis.Db.StringGetAsync(boostKey);
            return boostValue.HasValue ? (double)boostValue : 1.0;
        }
    }
}