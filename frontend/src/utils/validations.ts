export const isRequired = (value: string) => {
  if (!value) return "This field is required";
  return null;
}

export const minLength = (value: string, min: number) => {
  if (!value) return "This field is required";
  return value.length < min ? `Must be at least ${min} characters` : null;
}

export const isEmail = (value: string) => {
  if (!value) return "Email is required";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value) ? null : "Invalid email address";
}

export const isPassword = (value: string) => {
  if (!value) return "Password is required";
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(value) ? null : "Password must be at least 8 characters long, contain at least 1 uppercase letter, 1 lowercase letter, 1 number and 1 special character";
}

export const isRepeatPassword = (value: string, password: string) => {
  if (!value) return "Repeat password is required";
  return value === password ? null : "Passwords do not match";
}

export const isSecret = (value: string) => {
  if (!value) return "Secret is required";
  return value !== process.env.REACT_APP_SECRET_ADMIN ? "Secret phrase is not correct" : null;
}
