using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaderboardController : ControllerBase
    {
        private readonly RedisService _redis;
        public LeaderboardController(RedisService redis) => _redis = redis;

        [HttpGet]
        public async Task<IActionResult> GetTop10()
        {
            var top = await _redis.Db.SortedSetRangeByScoreWithScoresAsync(
                        RedisDbSchemaConstant.LeaderboardCoinsZSet,
                        order: Order.Descending,
                        take: 10);
            var result = new List<object>();
            foreach (var item in top)
            {
                var userKey = string.Format(RedisDbSchemaConstant.UserAuthHash, item.Element);
                var username = await _redis.Db.HashGetAsync(userKey, "username");
                result.Add(new
                {
                    userId = item.Element.ToString(),
                    username = username.ToString(),
                    coins = (int)item.Score
                });
            }

            return Ok(result);
        }
    }
}
