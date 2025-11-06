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
        private readonly ShopConfigService _shopConfig;


        public InventoryController(RedisService redis, SessionService sessionService, ShopConfigService shopConfig)
        {
            _redis = redis;
            _sessionService = sessionService;
            _shopConfig = shopConfig;
        }

        [HttpPost("buy")]
        public async Task<IActionResult> BuyMachine([FromBody] Machine clientMachine)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var userStateKey = string.Format(RedisDbSchemaConstant.UserStateHash, userId);

            var machineConfig = _shopConfig.GetMachine(clientMachine.Name);
            if (machineConfig == null)
            {
                return BadRequest(new { message = "Invalid machine." });
            }

            var currentCoins = (double)await _redis.Db.HashGetAsync(userStateKey, UserDbSchemaConstant.Coins);

            if (currentCoins < machineConfig.Cost)
            {
                return BadRequest(new { message = "Not enough coins." });
            }

            var newTotalCoins = await _redis.Db.HashDecrementAsync(userStateKey, UserDbSchemaConstant.Coins, machineConfig.Cost);

            await _sessionService.UpdateUserLastActive(userId);

            var inventoryKey = string.Format(RedisDbSchemaConstant.UserInventoryKey, userId);

            string jsonMachine = System.Text.Json.JsonSerializer.Serialize(machineConfig);
            await _redis.Db.JsonArrayAppendAsync(inventoryKey, path: ".Machines", json: jsonMachine);

            var newCoinsPerSecond = await _redis.Db.HashIncrementAsync(userStateKey, UserDbSchemaConstant.CoinsPerSecond, machineConfig.Cps);

            var coinEventPayload = new CoinChangedPayload(userId, newTotalCoins, $"Purchased {machineConfig.Name}.", newCoinsPerSecond);

            var coinEvent = new GameEvent<CoinChangedPayload>
            {
                Type = GameEventTypeConstant.PurchaseMade,
                Payload = coinEventPayload
            };

            await _redis.Subscriber.PublishAsync("game-events", coinEvent.Serialize());

            return Ok(new { message = $"Successfully purchased {machineConfig.Name}" });
        }
    }
}