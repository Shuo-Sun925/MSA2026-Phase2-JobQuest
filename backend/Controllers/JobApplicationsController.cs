using System.Security.Claims;
using backend.Data;
using backend.DTOs.JobApplications;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class JobApplicationsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public JobApplicationsController(
        ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: /api/jobapplications
    [HttpGet]
    public async Task<ActionResult<
        IEnumerable<JobApplicationResponse>>> GetAll()
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var applications = await _context.JobApplications
            .AsNoTracking()
            .Where(application =>
                application.UserId == userId
            )
            .OrderByDescending(application =>
                application.UpdatedAt
            )
            .Select(application =>
                MapToResponse(application)
            )
            .ToListAsync();

        return Ok(applications);
    }

    // GET: /api/jobapplications/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<JobApplicationResponse>>
        GetById(int id)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var application = await _context.JobApplications
            .AsNoTracking()
            .FirstOrDefaultAsync(application =>
                application.Id == id
                && application.UserId == userId
            );

        if (application is null)
        {
            return NotFound(new
            {
                message = "Job application was not found."
            });
        }

        return Ok(MapToResponse(application));
    }

    // POST: /api/jobapplications
    [HttpPost]
    public async Task<ActionResult<JobApplicationResponse>>
        Create(CreateJobApplicationRequest request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var application = new JobApplication
        {
            UserId = userId,
            CompanyName = request.CompanyName.Trim(),
            JobTitle = request.JobTitle.Trim(),
            Location = NormalizeOptionalText(
                request.Location
            ),
            JobLink = NormalizeOptionalText(
                request.JobLink
            ),
            Status = request.Status,
            AppliedDate = request.AppliedDate,
            NextFollowUpDate = request.NextFollowUpDate,
            Notes = NormalizeOptionalText(
                request.Notes
            ),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.JobApplications.Add(application);

        await _context.SaveChangesAsync();

        var response = MapToResponse(application);

        return CreatedAtAction(
            nameof(GetById),
            new
            {
                id = application.Id
            },
            response
        );
    }

    // PUT: /api/jobapplications/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<JobApplicationResponse>>
        Update(
            int id,
            UpdateJobApplicationRequest request)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var application = await _context.JobApplications
            .FirstOrDefaultAsync(application =>
                application.Id == id
                && application.UserId == userId
            );

        if (application is null)
        {
            return NotFound(new
            {
                message = "Job application was not found."
            });
        }

        application.CompanyName =
            request.CompanyName.Trim();

        application.JobTitle =
            request.JobTitle.Trim();

        application.Location =
            NormalizeOptionalText(request.Location);

        application.JobLink =
            NormalizeOptionalText(request.JobLink);

        application.Status = request.Status;

        application.AppliedDate =
            request.AppliedDate;

        application.NextFollowUpDate =
            request.NextFollowUpDate;

        application.Notes =
            NormalizeOptionalText(request.Notes);

        application.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(MapToResponse(application));
    }

    // DELETE: /api/jobapplications/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new
            {
                message = "Invalid authentication token."
            });
        }

        var application = await _context.JobApplications
            .FirstOrDefaultAsync(application =>
                application.Id == id
                && application.UserId == userId
            );

        if (application is null)
        {
            return NotFound(new
            {
                message = "Job application was not found."
            });
        }

        _context.JobApplications.Remove(application);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    private bool TryGetCurrentUserId(
        out int userId)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier
        );

        return int.TryParse(userIdClaim, out userId);
    }

    private static JobApplicationResponse MapToResponse(
        JobApplication application)
    {
        return new JobApplicationResponse
        {
            Id = application.Id,
            CompanyName = application.CompanyName,
            JobTitle = application.JobTitle,
            Location = application.Location,
            JobLink = application.JobLink,
            Status = application.Status,
            AppliedDate = application.AppliedDate,
            NextFollowUpDate =
                application.NextFollowUpDate,
            Notes = application.Notes,
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt
        };
    }

    private static string? NormalizeOptionalText(
        string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }
}