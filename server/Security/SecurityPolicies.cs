namespace server.Security;

public static class SecurityPolicies
{
    public const string AdminOnly = "AdminOnly";
    public const string ManagerOrAdmin = "ManagerOrAdmin";
}

public static class SamctRoles
{
    public const string Resident = "Resident";
    public const string VillageManager = "VillageManager";
    public const string CompanySecretary = "CompanySecretary";
    public const string FinancialAdvisor = "FinancialAdvisor";
    public const string FinancialAdministrator = "FinancialAdministrator";
    public const string Chairman = "Chairman";
    public const string Director = "Director";

    public static readonly string[] AdminRoles =
    [
        CompanySecretary,
        FinancialAdvisor,
        FinancialAdministrator,
        Chairman,
        Director
    ];

    public static readonly string[] ManagerOrAdminRoles =
    [
        VillageManager,
        .. AdminRoles
    ];

    public static readonly string[] AssignableRoles =
    [
        Resident,
        VillageManager,
        .. AdminRoles
    ];
}
