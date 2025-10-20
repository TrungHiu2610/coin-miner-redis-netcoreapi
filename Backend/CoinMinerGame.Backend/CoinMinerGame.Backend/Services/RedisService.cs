using StackExchange.Redis;

namespace CoinMinerGame.Backend.Services
{
    public class RedisService
    {
        private readonly IConnectionMultiplexer _redis;
        public IDatabase Db => _redis.GetDatabase();
        public ISubscriber Subscriber => _redis.GetSubscriber();

        public RedisService(IConnectionMultiplexer redis)
        {
            _redis = redis;
        }
    }
}
