import { validateForm } from "./validateForm";

if (!(window as any).utils) {
  (window as any).utils = {};
}

(window as any).utils.validateForm = validateForm;

declare global {
  interface Window {
    utils: {
      validateForm: typeof validateForm;
    };
  }
}