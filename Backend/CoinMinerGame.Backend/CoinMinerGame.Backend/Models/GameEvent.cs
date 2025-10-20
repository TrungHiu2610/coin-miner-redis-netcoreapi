using System.Text.Json;

namespace CoinMinerGame.Backend.Models
{
    public class GameEvent<T>
    {
        public string Type { get; set; } = default!;
        public T Payload { get; set; } = default!;

        public string Serialize()
        {
            return JsonSerializer.Serialize(this);
        }

        public static GameEvent<T> Deserialize(string json)
        {
            return JsonSerializer.Deserialize<GameEvent<T>>(json)!;
        }
    }

    public class BaseGameEventPayload
    {
        public string UserId { get; set; } = default!;
        public string Message { get; set; } = default!;
        // constructor
        public BaseGameEventPayload(string UserId, string Message)
        {
            this.UserId = UserId;
            this.Message = Message;
        }
    }

    public class CoinChangedPayload : BaseGameEventPayload
    {
        public double Coins { get; set; }
        public double? CoinsPerSecond { get; set; }

        // constructor
        public CoinChangedPayload(string UserId, double Coins, string Message, double? CoinsPerSecond = null)
            : base(UserId, Message)
        {
            this.Coins = Coins;
            this.CoinsPerSecond = CoinsPerSecond;
        }
    }

    public class BoostPayload : BaseGameEventPayload
    {
        public string Type { get; set; } = default!;
        public double Multiplier { get; set; }
        public int Duration { get; set; }

        // constructor
        public BoostPayload(string UserId, string Type, double Multiplier, int Duration, string Message)
            : base(UserId, Message)
        {
            this.Type = Type;
            this.Multiplier = Multiplier;
            this.Duration = Duration;
        }
    }

    public class OfflineEarningsPayload : BaseGameEventPayload
    {
        public double CoinsEarned { get; set; }
        public double TimeOfflineMinutes { get; set; }
        // constructor
        public OfflineEarningsPayload(string UserId, double CoinsEarned, double TimeOfflineMinutes, string Message)
            : base(UserId, Message)
        {
            this.CoinsEarned = CoinsEarned;
            this.TimeOfflineMinutes = TimeOfflineMinutes;
        }
    }
}
