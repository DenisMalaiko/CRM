import { StylesConfig } from "react-select";

export const centeredSelectStyles: StylesConfig = {
  control: (base) => ({
    ...base,
    textAlign: "left",
  }),
  singleValue: (base) => ({
    ...base,
    textAlign: "left",
    width: "100%",
  }),
  placeholder: (base) => ({
    ...base,
    textAlign: "left",
    width: "100%",
  }),
  option: (base) => ({
    ...base,
    textAlign: "left",
  }),
};