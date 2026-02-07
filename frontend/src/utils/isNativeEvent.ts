import React from "react";

type NativeChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;

type ManualChange = {
  name: string;
  value: any;
};

export type ChangeArg = NativeChangeEvent | ManualChange;

export const isNativeEvent = (arg: ChangeArg): arg is NativeChangeEvent => {
  return (arg as NativeChangeEvent).target !== undefined;
};