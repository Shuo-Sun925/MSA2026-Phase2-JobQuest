using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace backend.Tests.TestHelpers;

internal static class ControllerTestHelper
{
    public static ControllerContext CreateControllerContext(
        int? userId)
    {
        var identity = userId.HasValue
            ? new ClaimsIdentity(
                [
                    new Claim(
                        ClaimTypes.NameIdentifier,
                        userId.Value.ToString()
                    )
                ],
                "Test"
            )
            : new ClaimsIdentity();

        return new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = new ClaimsPrincipal(identity)
            }
        };
    }
}