import { describe, expect, it } from "vitest";

import { extractErrorMessage } from "../../helpers/errors";

describe("extractErrorMessage", () => {
  it("returns the message from a standard error", () => {
    const error = new Error("Network is down");

    expect(extractErrorMessage(error)).toBe("Network is down");
  });

  it("reads the plain string body from an RTK Query error", () => {
    const error = {
      status: 503,
      data: "Service temporarily unavailable",
    };

    expect(extractErrorMessage(error)).toBe("Service temporarily unavailable");
  });

  it("returns the nested message when the body wraps it", () => {
    const error = {
      status: 500,
      data: { message: "Sensors cannot be loaded" },
    };

    expect(extractErrorMessage(error)).toBe("Sensors cannot be loaded");
  });

  it("falls back to the status message when body lacks details", () => {
    const error = {
      status: 404,
      data: { reason: "Missing message field" },
    };

    expect(extractErrorMessage(error)).toBe("Erro ao carregar dados (404)");
  });

  it("returns the generic message for unknown inputs", () => {
    expect(extractErrorMessage(null)).toBe("Erro desconhecido");
    expect(extractErrorMessage(undefined)).toBe("Erro desconhecido");
  });
});
