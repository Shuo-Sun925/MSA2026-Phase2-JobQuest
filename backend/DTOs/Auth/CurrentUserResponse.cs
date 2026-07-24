namespace backend.DTOs.Auth;

public class CurrentUserResponse
{
    public int UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}