using System.Net;
using System.Net.Http.Json;
using backend.DTOs.JobApplications;
using backend.Models;

namespace backend.Tests.Integration;

public class JobApplicationsIntegrationTests(
    TestWebApplicationFactory factory)
    : IntegrationTestBase(factory)
{
    [Fact]
    public async Task AuthenticatedUser_CanCreateApplication()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var response = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreatedApplication_CanBeFetchedByOwner()
    {
        var auth = await RegisterAsync("alice");
        SetBearerToken(Client, auth.Token);

        var createResponse = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        var created = await ReadFromJsonAsync<JobApplicationResponse>(
            createResponse.Content
        );

        var getResponse = await Client.GetAsync(
            $"/api/jobapplications/{created!.Id}"
        );

        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);
    }

    [Fact]
    public async Task User_CanOnlyReadOwnApplication()
    {
        var alice = await RegisterAsync("alice");
        SetBearerToken(Client, alice.Token);

        var createResponse = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        var created = await ReadFromJsonAsync<JobApplicationResponse>(
            createResponse.Content
        );

        using var bobClient = Factory.CreateClient();
        var bob = await RegisterWithClientAsync(bobClient, "bob");
        SetBearerToken(bobClient, bob.Token);

        var getResponse = await bobClient.GetAsync(
            $"/api/jobapplications/{created!.Id}"
        );

        Assert.Equal(HttpStatusCode.NotFound, getResponse.StatusCode);
    }

    [Fact]
    public async Task User_CannotUpdateOtherUsersApplication()
    {
        var alice = await RegisterAsync("alice");
        SetBearerToken(Client, alice.Token);

        var createResponse = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        var created = await ReadFromJsonAsync<JobApplicationResponse>(
            createResponse.Content
        );

        using var bobClient = Factory.CreateClient();
        var bob = await RegisterWithClientAsync(bobClient, "bob");
        SetBearerToken(bobClient, bob.Token);

        var updateResponse = await bobClient.PutAsJsonAsync(
            $"/api/jobapplications/{created!.Id}",
            new
            {
                CompanyName = "Changed",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        Assert.Equal(HttpStatusCode.NotFound, updateResponse.StatusCode);
    }

    [Fact]
    public async Task User_CannotDeleteOtherUsersApplication()
    {
        var alice = await RegisterAsync("alice");
        SetBearerToken(Client, alice.Token);

        var createResponse = await Client.PostAsJsonAsync(
            "/api/jobapplications",
            new
            {
                CompanyName = "Contoso",
                JobTitle = "Engineer",
                Status = JobApplicationStatus.Saved
            }
        );

        var created = await ReadFromJsonAsync<JobApplicationResponse>(
            createResponse.Content
        );

        using var bobClient = Factory.CreateClient();
        var bob = await RegisterWithClientAsync(bobClient, "bob");
        SetBearerToken(bobClient, bob.Token);

        var deleteResponse = await bobClient.DeleteAsync(
            $"/api/jobapplications/{created!.Id}"
        );

        Assert.Equal(HttpStatusCode.NotFound, deleteResponse.StatusCode);
    }
}