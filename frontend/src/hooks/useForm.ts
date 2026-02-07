import React, { useState, useEffect } from "react";

type ChangeArg =
  | React.ChangeEvent<
  HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
>
  | {
  name: string;
  value: any;
  type?: string;
};

export function useForm<T extends Record<string, any>>(initialState: T) {
  const [form, setForm] = useState<T>(initialState);

  useEffect(() => {
    setForm(initialState);
  }, [initialState]);

  const handleChange = (arg: ChangeArg) => {
    let name: string;
    let type: string | undefined;
    let value: any;
    let checked: boolean | undefined;

    if ("target" in arg) {
      const target = arg.target as HTMLInputElement;
      name = target.name;
      type = target.type;
      value = target.value;
      checked = target.checked;
    } else {
      name = arg.name;
      value = arg.value;
      type = arg.type;
    }

    let newValue = value;

    if (name === "phoneNumber" && typeof value === "string") {
      newValue = value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*)\./g, "$1");
    }

    if (type === "checkbox") {
      newValue = checked ?? value;
    }

    if (type === "number") {
      newValue = newValue === "" ? "" : Number(newValue);
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
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