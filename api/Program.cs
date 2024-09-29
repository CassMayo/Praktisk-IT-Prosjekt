using api.DAL.Models;
using api.DAL.Interfaces;
using api.DAL.Repositories;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;



var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers().AddNewtonsoftJson(options =>
{
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register the database context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddControllers();
builder.Services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy",
                builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
        });
// Register the UserRepository with Dependency Injection
builder.Services.AddScoped<IUserRepository, UserRepository>();


builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy",
        builder => builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

// Serilog configuration for logging
var loggerConfiguration = new LoggerConfiguration()
    .MinimumLevel.Information() // levels: Trace < Information < Warning < Error < Fatal
    .WriteTo.File($"APILogs/app_{DateTime.Now:yyyyMMdd_HHmmss}.log")
    .Filter.ByExcluding(e => e.Properties.TryGetValue("SourceContext", out var value) &&
                            e.Level == LogEventLevel.Information &&
                            e.MessageTemplate.Text.Contains("Executed DbCommand"));

var logger = loggerConfiguration.CreateLogger();
builder.Logging.AddSerilog(logger);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();  
    app.UseSwagger();
    app.UseSwaggerUI();
}


app.UseStaticFiles();
app.UseRouting();
app.UseCors("CorsPolicy");

app.MapControllerRoute(name: "api", pattern: "{controller}/{action=Index}/{id?}");

app.Run();
