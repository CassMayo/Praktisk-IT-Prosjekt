using Microsoft.AspNetCore.Authorization;
public class RoleHandler : AuthorizationHandler<RoleRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, 
        RoleRequirement requirement)
    {
        var roleClaim = context.User.FindFirst("Role");
        
        if (roleClaim != null && roleClaim.Value == requirement.RequiredRole)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}