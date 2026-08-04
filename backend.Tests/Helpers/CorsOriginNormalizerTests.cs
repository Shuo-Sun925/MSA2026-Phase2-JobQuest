using backend.Helpers;

namespace backend.Tests.Helpers;

public class CorsOriginNormalizerTests
{
    [Theory]
    [InlineData(
        "https://jobquest-frontend.vercel.app",
        "https://jobquest-frontend.vercel.app"
    )]
    [InlineData(
        "https://jobquest-frontend.vercel.app/",
        "https://jobquest-frontend.vercel.app"
    )]
    [InlineData(
        "https://jobquest-frontend.vercel.app/dashboard",
        "https://jobquest-frontend.vercel.app"
    )]
    [InlineData(
        "https://jobquest-frontend.vercel.app:443/dashboard",
        "https://jobquest-frontend.vercel.app"
    )]
    [InlineData(
        "  https://jobquest-frontend.vercel.app/  ",
        "https://jobquest-frontend.vercel.app"
    )]
    [InlineData(
        "http://localhost:5173",
        "http://localhost:5173"
    )]
    [InlineData(
        "http://localhost:5173/jobs",
        "http://localhost:5173"
    )]
    public void Normalize_ReturnsAuthorityOrigin(
        string origin,
        string expected)
    {
        var result = CorsOriginNormalizer.Normalize(origin);

        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-a-url")]
    [InlineData("/dashboard")]
    [InlineData("ftp://jobquest-frontend.vercel.app")]
    public void Normalize_ReturnsNullForInvalidOrigin(
        string? origin)
    {
        var result = CorsOriginNormalizer.Normalize(origin);

        Assert.Null(result);
    }
}