using CoinMinerGame.Backend.Hubs;
using CoinMinerGame.Backend.Models;
using CoinMinerGame.Backend.Models.Shops;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using StackExchange.Redis;
using NReJSON;
using System.Text.Json;

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly RedisService _redis;
        private readonly JwtService _jwtService;

        public AuthController(RedisService redis, JwtService jwtService)
        {
            _redis = redis;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] AuthDto dto)
        {
            // check confirm password
            if (dto.Password != dto.ConfirmPassword)
            {
                return BadRequest("Password and Confirm Password do not match");
            }

            var usernameKey = string.Format(RedisDbSchemaConstant.UsernameToUserIdKey, dto.Username);
            if (await _redis.Db.KeyExistsAsync(usernameKey))
            {
                return BadRequest(new { message = "Username already exists" });
            }

            var userId = Guid.NewGuid().ToString();
            await _redis.Db.HashSetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, userId), new HashEntry[]
                {
                new HashEntry(UserDbSchemaConstant.Username, dto.Username),
                new HashEntry(UserDbSchemaConstant.PasswordHash, BCrypt.Net.BCrypt.HashPassword(dto.Password)),
                new HashEntry(UserDbSchemaConstant.CreatedAt, DateTimeOffset.UtcNow.ToUnixTimeSeconds())
                });

            // map username to userId
            await _redis.Db.StringSetAsync(string.Format(RedisDbSchemaConstant.UsernameToUserIdKey, dto.Username), userId);

            // initialize user state
            await _redis.Db.HashSetAsync(string.Format(RedisDbSchemaConstant.UserStateHash, userId), new HashEntry[]
            {
            new HashEntry(UserDbSchemaConstant.Coins, 0),
            new HashEntry(UserDbSchemaConstant.CoinsPerSecond, 0),
            new HashEntry(UserDbSchemaConstant.Level, 1),
            new HashEntry(UserDbSchemaConstant.LastUpdate, DateTime.UtcNow.ToString())
            });

            await _redis.Db.SetAddAsync(RedisDbSchemaConstant.UsersAllSet, userId);
            var initialInventory = new UserInventory();
            string jsonInitialInventory = JsonSerializer.Serialize(initialInventory);

            await _redis.Db.JsonSetAsync(
                string.Format(RedisDbSchemaConstant.UserInventoryKey, userId),
                json:jsonInitialInventory,
                path:"."
            );

            var token = _jwtService.GenerateToken(userId.ToString());
            return Ok(new { userId, token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthDto dto)
        {
            var userRedisId = await _redis.Db.StringGetAsync(string.Format(RedisDbSchemaConstant.UsernameToUserIdKey, dto.Username));
            if (userRedisId.IsNullOrEmpty)
            {
                return NotFound(new { message = "User not found" });
            }

            var hash = await _redis.Db.HashGetAsync(string.Format(RedisDbSchemaConstant.UserAuthHash, userRedisId), UserDbSchemaConstant.PasswordHash);
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, hash))
            {
                return BadRequest(new { message = "Invalid password" });
            }

            var userId = userRedisId.ToString();
            var token = _jwtService.GenerateToken(userId);
            return Ok(new { userId, token });
        }
    }
}
