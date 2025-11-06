using System;
using System.Collections.Generic;
using System.Linq;
using CoinMinerGame.Backend.Models.Shops;

namespace CoinMinerGame.Backend.Services
{
    public class ShopConfigService
    {
        public IReadOnlyList<Machine> Machines { get; }
        public IReadOnlyList<Boost> Boosts { get; }

        public ShopConfigService()
        {
            // Danh sách machine
            Machines = new List<Machine>
            {
                new Machine { Name = "Basic Miner", Cps = 1, Cost = 50 },
                new Machine { Name = "Advanced Rig", Cps = 5, Cost = 250 },
                new Machine { Name = "Mega Drill", Cps = 20, Cost = 1200 },
                new Machine { Name = "Quantum Harvester", Cps = 100, Cost = 7500 },
            };

            // Danh sách boost 
            Boosts = new List<Boost>
            {
                new Boost { Type = "click", Multiplier = 2, Duration = 30, Cost = 100,  Name = "x2 Click (30s)" },
                new Boost { Type = "click", Multiplier = 3, Duration = 20, Cost = 180,  Name = "x3 Click (20s)" },
                new Boost { Type = "passive", Multiplier = 2, Duration = 60, Cost = 300,  Name = "x2 Passive (60s)" },
                new Boost { Type = "passive", Multiplier = 3, Duration = 45, Cost = 500,  Name = "x3 Passive (45s)" },
            };
        }

        public Machine? GetMachine(string name) => Machines.FirstOrDefault(m => m.Name == name);

        public Boost? GetBoost(string type) =>
            Boosts.FirstOrDefault(b => b.Type.Equals(type, StringComparison.OrdinalIgnoreCase));

        public Boost? GetBoostByName(string name) =>
            Boosts.FirstOrDefault(b => b.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
    }
}

