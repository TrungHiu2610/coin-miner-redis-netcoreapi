using CoinMinerGame.Backend.Models.Shops;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoinMinerGame.Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class ShopController : ControllerBase
    {
        private readonly ShopConfigService _shopConfig;

        public ShopController(ShopConfigService shopConfig)
        {
            _shopConfig = shopConfig;
        }

        [HttpGet("machines")]
        public ActionResult<IEnumerable<Machine>> GetMachines()
        {
            return Ok(_shopConfig.Machines);
        }

        [HttpGet("boosts")]
        public ActionResult<IEnumerable<Boost>> GetBoosts()
        {
            return Ok(_shopConfig.Boosts);
        }
    }
}
