export const isRequired = (value: string) => {
  if (!value) return "This field is required";
  return null;
}

export const isBoolean = (value: unknown): string | null => {
  return typeof value === "boolean" ? null : "Value must be boolean";
};

export const isRequiredArray = (value: []) => {
  if (Array.isArray(value) && !value.length) return "This field is required";
  return null;
}

export const isArray = (value: []) => {
  if (!Array.isArray(value)) return "This field should be an array";
  return null;
}

export const minLength = (value: string, min: number) => {
  if (!value) return "This field is required";
  return value.length < min ? `Must be at least ${min} characters` : null;
}

export const exactLength = (value: string, length: number) => {
  if (!value) return "This field is required";
  return value.length !== length ? `Must be exactly ${length} characters` : null;
}

export const isEmail = (value: string) => {
  if (!value) return "Email is required";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(value) ? null : "Invalid email address";
}

export const isPhoneNumber = (value: string) => {
  if (!value) return "Phone number is required";
  const regex = /^[+]?[\d\s().-]{9,20}$/;
  return regex.test(value) ? null : "Invalid phone number";
};

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

export const isPositiveNumber = (value: number) => {
  if (!value) return "This field is required";
  return value < 0 ? "Must be positive number" : null;
}

export const isString = (value: unknown): string | null => {
  return typeof value === "string" ? null : "Value must be string";
};

export const isValidPhoto = (file: File): void => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  const maxSize = 5;

  if (file.size > maxSize * 1024 * 1024) {
    throw new Error('This photo should be less than 5MB');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only PNG images are allowed');
  }
};


