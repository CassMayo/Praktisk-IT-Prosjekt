using Microsoft.AspNetCore.Authorization;
public static class AuthorizationPolicies
{
    public static void AddAuthorizationPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // Default policy - requires authenticated user
            options.DefaultPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            // Admin policy
            options.AddPolicy("RequireAdminRole", policy =>
                policy.Requirements.Add(new RoleRequirement("Admin")));

            // User policy
            options.AddPolicy("RequireUserRole", policy =>
                policy.Requirements.Add(new RoleRequirement("User")));
        });

        // Register the authorization handler
        services.AddScoped<IAuthorizationHandler, RoleHandler>();
    }
}