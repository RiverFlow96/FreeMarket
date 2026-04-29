export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Ocurrió un error inesperado. Por favor, inténtalo de nuevo.";
}

export function parseApiErrors(data: Record<string, unknown>): string {
  const errors: string[] = [];

  for (const [, messages] of Object.entries(data)) {
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        if (typeof msg === "string") {
          errors.push(msg);
        }
      }
    }
  }

  return errors.length > 0
    ? errors.join(". ")
    : "Ocurrió un error. Por favor, inténtalo de nuevo.";
}
