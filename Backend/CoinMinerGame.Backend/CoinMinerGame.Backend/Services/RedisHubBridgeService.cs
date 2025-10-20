using CoinMinerGame.Backend.Hubs;
using CoinMinerGame.Backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace CoinMinerGame.Backend.Services
{
    public class RedisHubBridgeService : BackgroundService
    {
        private readonly RedisService _redis;
        private readonly IHubContext<GameHub> _hubContext;

        public RedisHubBridgeService(RedisService redis, IHubContext<GameHub> hubContext)
        {
            _redis = redis;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            await _redis.Subscriber.SubscribeAsync("game-events", async (channel, message) =>
            {
                var gameEvent = GameEvent<object>.Deserialize(message!);
                if (gameEvent == null) return;

                switch (gameEvent.Type)
                {
                    case GameEventTypeConstant.CoinChanged:
                        var coinEvent = GameEvent<CoinChangedPayload>.Deserialize(message!);
                        await _hubContext.Clients.All.SendAsync("CoinChanged", coinEvent.Payload);
                        break;
                    case GameEventTypeConstant.LeaderboardChanged:
                        var leaderboardEvent = GameEvent<string>.Deserialize(message!);
                        await _hubContext.Clients.All.SendAsync("LeaderboardChanged", leaderboardEvent.Payload);
                        break;
                    case GameEventTypeConstant.BoostActivated:
                        var boostEvent = GameEvent<BoostPayload>.Deserialize(message!);
                        await _hubContext.Clients.All.SendAsync("BoostActivated", boostEvent.Payload);
                        break;
                    case GameEventTypeConstant.PurchaseMade:
                        var purchaseEvent = GameEvent<CoinChangedPayload>.Deserialize(message!);
                        await _hubContext.Clients.All.SendAsync("PurchaseMade", purchaseEvent.Payload);
                        break;
                }
            });
        }
    }
}
