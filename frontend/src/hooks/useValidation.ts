import React, { useState } from "react";
type ValidatorFn<T> = (value: any, form: T) => string | null;

type ValidatorsMap<T> = {
  [K in keyof T]?: ValidatorFn<T>;
};

export function useValidation<T extends Record<string, any>>(
  validators: ValidatorsMap<T>
) {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = (
    name: keyof T,
    value: any,
    form: T
  ): string | null => {
    const validator = validators[name];
    const error = validator ? validator(value, form) : null;

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error;
  };

  const validateAll = (form: T): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    (Object.keys(validators) as (keyof T)[]).forEach((field) => {
      const error = validators[field]?.(form[field], form);

      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return {
    errors,
    validateField,
    validateAll,
  };
}