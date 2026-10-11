export type typeValidatePassword = (data: { hash: string, password: string }) => Promise<boolean>;

export const validatePassword: typeValidatePassword = async ({ hash, password }) => {
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  if (!/[a-z]/.test(password)) {
    return false;
  }

  if (!/[0-9]/.test(password)) {
    return false;
  }

  return true;
}
