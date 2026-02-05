import React, { useState } from "react";

type ChangeEvent =
  | React.ChangeEvent<HTMLInputElement>
  | React.ChangeEvent<HTMLTextAreaElement>
  | React.ChangeEvent<HTMLSelectElement>;

export function useForm<T extends Record<string, any>>(initialState: T) {
  const [form, setForm] = useState<T>(initialState);

  const handleChange = (e: ChangeEvent) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => setForm(initialState);

  return {
    form,
    setForm,
    handleChange,
    resetForm,
  };
}