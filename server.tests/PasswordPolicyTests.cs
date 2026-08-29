using server.Security;

namespace server.tests;

public class PasswordPolicyTests
{
    [Theory]
    [InlineData("")]
    [InlineData("Short1!")]
    [InlineData("alllowercase1!")]
    [InlineData("ALLUPPERCASE1!")]
    [InlineData("NoNumbersHere!")]
    [InlineData("NoSpecial1234")]
    public void RejectsWeakPasswords(string password)
    {
        Assert.NotNull(PasswordPolicy.Validate(password));
    }

    [Fact]
    public void AcceptsAComplexTwelveCharacterPassword()
    {
        Assert.Null(PasswordPolicy.Validate("Portal!Shield9"));
    }
}
