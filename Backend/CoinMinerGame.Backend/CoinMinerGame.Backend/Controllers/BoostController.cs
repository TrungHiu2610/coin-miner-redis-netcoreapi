using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Models.Shops;
using CoinMinerGame.Backend.Models.Requests;
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
        private readonly ShopConfigService _shopConfig;

        public BoostController(RedisService redis, SessionService sessionService, ShopConfigService shopConfig)
        {
            _redis = redis;
            _sessionService = sessionService;
            _shopConfig = shopConfig;
        }

        [HttpPost("activate")]
        public async Task<IActionResult> ActivateBoost([FromBody] ActivateBoostRequest request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            Boost? boostConfig = null;
            if (!string.IsNullOrWhiteSpace(request.Name))
            {
                boostConfig = _shopConfig.GetBoostByName(request.Name);
            }

            if (boostConfig == null && !string.IsNullOrWhiteSpace(request.Type))
            {
                boostConfig = _shopConfig.GetBoost(request.Type);
            }

            if (boostConfig == null)
            {
                return BadRequest(new { message = "Invalid boost selection." });
            }
            var userStateKey = string.Format(RedisDbSchemaConstant.UserStateHash, userId);
            var currentCoins = (double)await _redis.Db.HashGetAsync(userStateKey, UserDbSchemaConstant.Coins);

            if (currentCoins < boostConfig.Cost)
            {
                return BadRequest(new { message = "Not enough coins." });
            }

            await _redis.Db.HashDecrementAsync(userStateKey, UserDbSchemaConstant.Coins, boostConfig.Cost);

            await _sessionService.UpdateUserLastActive(userId);

            var boostKey = $"boost:{userId}:{boostConfig.Type}";
            await _redis.Db.StringSetAsync(boostKey, boostConfig.Multiplier, TimeSpan.FromSeconds(boostConfig.Duration));

            var message = $"{boostConfig.Name} activated (x{boostConfig.Multiplier} {boostConfig.Type}) for {boostConfig.Duration} seconds.";

            var boostEventPayload = new BoostPayload(userId, boostConfig.Type, boostConfig.Multiplier, boostConfig.Duration,message);

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

