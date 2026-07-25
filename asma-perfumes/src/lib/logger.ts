const LOGS = import.meta.env.VITE_ENABLE_LOGS === "true";

export const log = (...args: unknown[]) => {
  if (LOGS) {
    console.log(...args);
  }
};

export const warn = (...args: unknown[]) => {
  if (LOGS) {
    console.warn(...args);
  }
};

export const error = (...args: unknown[]) => {
  console.error(...args);
};