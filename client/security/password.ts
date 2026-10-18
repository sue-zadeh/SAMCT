
export const PASSWORD_HELP =
  "At least 8 characters, including 1 uppercase letter, " +
  "1 lowercase letter, 1 number and 1 symbol (like ! or @).";

export function passwordError(password: string): string {
  const valid =
    password.length >= 8 &&
    new TextEncoder().encode(password).length <= 72 &&
    /\p{Lu}/u.test(password) &&
    /\p{Ll}/u.test(password) &&
    /\p{Nd}/u.test(password) &&
    /[\p{P}\p{S}]/u.test(password);

  return valid ? "" : PASSWORD_HELP;
}
