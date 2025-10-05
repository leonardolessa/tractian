export const extractErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object") {
    if (
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
    ) {
      return (error as { message: string }).message;
    }

    if ("status" in error) {
      const body = (error as { data?: unknown }).data;

      if (typeof body === "string") {
        return body;
      }

      if (body && typeof body === "object" && "message" in body) {
        const message = (body as { message?: unknown }).message;

        if (typeof message === "string") {
          return message;
        }
      }

      return `Erro ao carregar dados (${String((error as { status: unknown }).status)})`;
    }
  }

  return "Erro desconhecido";
};
