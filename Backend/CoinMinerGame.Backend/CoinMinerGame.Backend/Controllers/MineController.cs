using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; 

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class MineController : ControllerBase
    {
        private readonly RedisService _redis;
        private readonly LeaderboardService _leaderboardService;
        private readonly SessionService _sessionService;

        public MineController(RedisService redis, LeaderboardService leaderboardService, SessionService sessionService)
        {
            _redis = redis;
            _leaderboardService = leaderboardService;
            _sessionService = sessionService;
        }

        [HttpPost] 
        public async Task<IActionResult> Mine()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var boostMultiplier = await GetCurrentBoost(userId, "click"); 
            var coinsToAdd = GameConstant.BaseCoinsPerClick * boostMultiplier;

            var newTotalCoins = await _redis.Db.HashIncrementAsync(string.Format(RedisDbSchemaConstant.UserStateHash, userId), UserDbSchemaConstant.Coins, coinsToAdd);
            await _sessionService.UpdateUserLastActive(userId);

            var historyKey = string.Format(RedisDbSchemaConstant.UserCoinHistoryList, userId);
            await _redis.Db.ListLeftPushAsync(historyKey, newTotalCoins);
            await _redis.Db.ListTrimAsync(historyKey, 0, 49);

            await _redis.Db.SortedSetIncrementAsync(RedisDbSchemaConstant.LeaderboardCoinsZSet, userId, coinsToAdd);

            var username = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, userId), UserDbSchemaConstant.Username);

            string message = $"User {username} has just mined {coinsToAdd} coins from clicking";
            var coinEventPayload = new CoinChangedPayload(userId, newTotalCoins, message);

            var coinEvent = new GameEvent<CoinChangedPayload>
            {
                Type = GameEventTypeConstant.CoinChanged,
                Payload = coinEventPayload
            };
            await _redis.Subscriber.PublishAsync("game-events", coinEvent.Serialize());

            await _leaderboardService.CheckAndNotifyLeaderChange(userId);

            return Ok();
        }

        private async Task<double> GetCurrentBoost(string userId, string boostType)
        {
            var boostKey = $"boost:{userId}:{boostType}";
            var boostValue = await _redis.Db.StringGetAsync(boostKey);
            return boostValue.HasValue ? (double)boostValue : 1.0;
        }
    }
}