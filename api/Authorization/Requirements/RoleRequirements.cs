using Microsoft.AspNetCore.Authorization;
public class RoleRequirement : IAuthorizationRequirement
{
    public string RequiredRole { get; }

    public RoleRequirement(string requiredRole)
    {
        RequiredRole = requiredRole;
    }
}
