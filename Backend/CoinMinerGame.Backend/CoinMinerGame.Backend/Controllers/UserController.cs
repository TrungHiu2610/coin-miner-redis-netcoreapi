using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly RedisService _redis;
        private readonly SessionService _sessionService;

        public UserController(RedisService redis, SessionService sessionService)
        {
            _redis = redis;
            _sessionService = sessionService;
        }

        [HttpGet("state")] 
        public async Task<IActionResult> GetCurrentUserState()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var username = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, userId), UserDbSchemaConstant.Username);

            var stateKey = string.Format(RedisDbSchemaConstant.UserStateHash, userId);
            if (!await _redis.Db.KeyExistsAsync(stateKey)) return NotFound();

            var lastUpdateString = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserStateHash, userId), UserDbSchemaConstant.LastUpdate);
            var coinsPerSecond = (double)await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserStateHash, userId), UserDbSchemaConstant.CoinsPerSecond);

            long newTotalCoins = (long)await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserStateHash, userId), UserDbSchemaConstant.Coins);

            // calculate offline earnings
            if (DateTime.TryParse(lastUpdateString, out var lastUpdateTime) && coinsPerSecond > 0)
            {
                var timeOffline = DateTime.UtcNow - lastUpdateTime;
                if (timeOffline.TotalSeconds > 1)
                {
                    var coinsEarnedOffline = (long)(timeOffline.TotalSeconds * coinsPerSecond);
                    newTotalCoins = await _redis.Db.HashIncrementAsync(stateKey, UserDbSchemaConstant.Coins, coinsEarnedOffline);

                    // update coin history
                    var historyKey = string.Format(RedisDbSchemaConstant.UserCoinHistoryList, userId);
                    await _redis.Db.ListLeftPushAsync(historyKey, newTotalCoins);
                    await _redis.Db.ListTrimAsync(historyKey, 0, 49);

                    // update leaderboard
                    await _redis.Db.SortedSetIncrementAsync(RedisDbSchemaConstant.LeaderboardCoinsZSet, userId, coinsEarnedOffline);

                    // update last active time
                    await _sessionService.UpdateUserLastActive(userId);

                    var message = $"User {username.ToString()} earned {coinsEarnedOffline} coins while offline for {timeOffline.TotalMinutes:F1} minutes.";
                    var offlineEarningPayload = new OfflineEarningsPayload(userId, coinsEarnedOffline, timeOffline.TotalSeconds, message);
                    // publish coin changed event
                    var offlineEarningEvent = new GameEvent<OfflineEarningsPayload>
                    {
                        Type = GameEventTypeConstant.CoinChanged,
                        Payload = offlineEarningPayload
                    };
                    await _redis.Subscriber.PublishAsync("game-events", offlineEarningEvent.Serialize());
                }
            }

            return Ok(new
            {
                userId,
                coins = newTotalCoins,
                coins_per_second = coinsPerSecond,
                username = username.ToString()
            });
        }

        [HttpGet("history")] 
        public async Task<IActionResult> GetCurrentUserCoinHistory()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var historyKey = string.Format(RedisDbSchemaConstant.UserCoinHistoryList, userId);
            var history = await _redis.Db.ListRangeAsync(historyKey, 0, 49);

            var result = history.Select(v => (double)v).Reverse().ToList();

            return Ok(new { history = result });
        }
    }
}
