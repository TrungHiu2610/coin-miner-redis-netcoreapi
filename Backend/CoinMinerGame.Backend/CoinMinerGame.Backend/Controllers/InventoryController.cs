using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Models.Shops;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NReJSON;
using System.Security.Claims;

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InventoryController : ControllerBase
    {
        private readonly RedisService _redis;
        private readonly SessionService _sessionService;

        public InventoryController(RedisService redis, SessionService sessionService)
        {
            _redis = redis;
            _sessionService = sessionService;
        }

        [HttpPost("buy")]
        public async Task<IActionResult> BuyMachine([FromBody] Machine machine)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var userStateKey = string.Format(RedisDbSchemaConstant.UserStateHash, userId);

            var currentCoins = (double)await _redis.Db.HashGetAsync(userStateKey, UserDbSchemaConstant.Coins);

            if (currentCoins < machine.Cost)
            {
                return BadRequest(new { message = "Not enough coins." });
            }

            var newTotalCoins = await _redis.Db.HashDecrementAsync(userStateKey, UserDbSchemaConstant.Coins, machine.Cost);
            await _sessionService.UpdateUserLastActive(userId);

            var inventoryKey = string.Format(RedisDbSchemaConstant.UserInventoryKey, userId);

            // parse machine to json string
            string jsonMachine = System.Text.Json.JsonSerializer.Serialize(machine);

            await _redis.Db.JsonArrayAppendAsync(inventoryKey, path:".Machines", json: jsonMachine);

            var newCoinsPerSecond = await _redis.Db.HashIncrementAsync(userStateKey, UserDbSchemaConstant.CoinsPerSecond, machine.Cps);

            var coinEventPayload = new CoinChangedPayload(userId, newTotalCoins, $"Purchased {machine.Name}.", newCoinsPerSecond);
            var coinEvent = new GameEvent<CoinChangedPayload>
            {
                Type = GameEventTypeConstant.PurchaseMade,
                Payload = coinEventPayload
            };
            await _redis.Subscriber.PublishAsync("game-events", coinEvent.Serialize());

            return Ok(new { message = $"Successfully purchased {machine.Name}" });
        }
    }
}