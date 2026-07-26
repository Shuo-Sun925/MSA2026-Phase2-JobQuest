using System.ComponentModel.DataAnnotations;

namespace backend.Tests.TestHelpers;

internal static class ValidationTestHelper
{
    public static IReadOnlyList<ValidationResult> Validate(
        object model)
    {
        var results = new List<ValidationResult>();

        Validator.TryValidateObject(
            model,
            new ValidationContext(model),
            results,
            validateAllProperties: true
        );

        return results;
    }
}