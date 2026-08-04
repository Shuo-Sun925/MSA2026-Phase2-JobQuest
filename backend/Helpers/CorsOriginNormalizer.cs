namespace backend.Helpers;

public static class CorsOriginNormalizer
{
    public static string? Normalize(string? origin)
    {
        if (string.IsNullOrWhiteSpace(origin))
        {
            return null;
        }

        origin = origin.Trim();

        if (!Uri.TryCreate(
                origin,
                UriKind.Absolute,
                out var uri
            ))
        {
            return null;
        }

        if (uri.Scheme != Uri.UriSchemeHttp
            && uri.Scheme != Uri.UriSchemeHttps)
        {
            return null;
        }

        var normalizedOrigin = new UriBuilder(
            uri.Scheme,
            uri.Host,
            uri.IsDefaultPort ? -1 : uri.Port
        );

        return normalizedOrigin.Uri.GetLeftPart(
            UriPartial.Authority
        );
    }
}