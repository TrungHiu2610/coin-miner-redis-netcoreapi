using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Models.Shops;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims; 

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] 
    public class BoostController : ControllerBase
    {
        private readonly RedisService _redis;
        private readonly SessionService _sessionService;

        public BoostController(RedisService redis, SessionService sessionService)
        {
            _redis = redis;
            _sessionService = sessionService;
        }

        [HttpPost("activate")]
        public async Task<IActionResult> ActivateBoost([FromBody] Boost boost)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var userStateKey = string.Format(RedisDbSchemaConstant.UserStateHash, userId);
            var currentCoins = (double)await _redis.Db.HashGetAsync(userStateKey, UserDbSchemaConstant.Coins);

            if (currentCoins < boost.Cost)
            {
                return BadRequest(new { message = "Not enough coins." });
            }
            await _redis.Db.HashDecrementAsync(userStateKey, UserDbSchemaConstant.Coins, boost.Cost);
            await _sessionService.UpdateUserLastActive(userId);

            var boostKey = $"boost:{userId}:{boost.Type}";
            await _redis.Db.StringSetAsync(boostKey, boost.Multiplier, TimeSpan.FromSeconds(boost.Duration));

            var message = $"Boost x{boost.Multiplier} for {boost.Type} activated for {boost.Duration} seconds.";
            var boostEventPayload = new BoostPayload(userId, boost.Type, boost.Multiplier,boost.Duration, message);
            var boostEvent = new GameEvent<BoostPayload>
            {
                Type = GameEventTypeConstant.BoostActivated,
                Payload = boostEventPayload
            };
            await _redis.Subscriber.PublishAsync("game-events", boostEvent.Serialize());

            return Ok();
        }
    }
}