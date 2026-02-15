import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export const useCopyToClipboard = (timeout = 1500) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      setTimeout(() => setCopied(false), timeout);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Copy failed", err);
    }
  }, [timeout]);

  return { copy, copied };
};