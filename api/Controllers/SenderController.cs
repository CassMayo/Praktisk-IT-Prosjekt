using Microsoft.AspNetCore.Mvc;
using api.Models;

namespace api.Controllers;

public class SenderController : Controller
{
    private readonly SenderDbContext _Sendercontext;

    public SenderController(SenderDbContext Sendercontext)
    {
        _Sendercontext = Sendercontext;
    }
}