using CoinMinerGame.Backend.Hubs;
using CoinMinerGame.Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using StackExchange.Redis;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;

// Add services to the container.

services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
services.AddEndpointsApiExplorer();
services.AddSwaggerGen();

// inject services
services.AddSingleton<RedisService>();
services.AddSingleton<LeaderboardService>();
services.AddSingleton<JwtService>();
services.AddSingleton<SessionService>();
services.AddSignalR();
services.AddHostedService<TickService>();
services.AddHostedService<RedisHubBridgeService>();
services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var host = builder.Configuration["Redis:Host"];
    var port = builder.Configuration["Redis:Port"];

    var configuration = ConfigurationOptions.Parse($"{host}:{port}");
    configuration.User = builder.Configuration["Redis:Username"];       
    configuration.Password = builder.Configuration["Redis:Password"];
    return ConnectionMultiplexer.Connect(configuration);
});

// jwt
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["JWT:Key"])),
            ValidateIssuer = false,
            ValidateAudience = false
        };
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/gamehub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
services.AddAuthorization();


var app = builder.Build();

app.UseCors(x => x
    .WithOrigins("http://localhost:5173") // FE origin
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials());

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapHub<GameHub>("/gamehub");

app.Run();
