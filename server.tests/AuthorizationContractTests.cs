using Microsoft.AspNetCore.Authorization;
using server.Controllers;
using server.Security;

namespace server.tests;

public class AuthorizationContractTests
{
    [Fact]
    public void RegistrationRequiresTheAdminPolicy()
    {
        var method = typeof(AuthController).GetMethod(nameof(AuthController.Register));
        var authorize = Assert.Single(method!.GetCustomAttributes(typeof(AuthorizeAttribute), true)
            .Cast<AuthorizeAttribute>());

        Assert.Equal(SecurityPolicies.AdminOnly, authorize.Policy);
    }

    [Theory]
    [InlineData(typeof(MaintenanceController))]
    [InlineData(typeof(DocumentNoticeController))]
    public void SensitiveResourceControllersRequireAuthentication(Type controllerType)
    {
        Assert.NotEmpty(controllerType.GetCustomAttributes(typeof(AuthorizeAttribute), true));
    }

    [Fact]
    public void PurchaseOrdersRequireManagerOrAdminPolicy()
    {
        var authorize = Assert.Single(
            typeof(PurchaseOrderController)
                .GetCustomAttributes(typeof(AuthorizeAttribute), true)
                .Cast<AuthorizeAttribute>());

        Assert.Equal(SecurityPolicies.ManagerOrAdmin, authorize.Policy);
    }
}
