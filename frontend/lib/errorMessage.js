export function getApiErrorMessage(error, fallback = "Something went wrong") {
  if (!error) return fallback;

  const data = error.response?.data || error.data;

  // Handle Zod-style errors: errors[field]._errors = [ ... ]
  if (data?.errors && typeof data.errors === "object") {
    const zodMessages = Object.values(data.errors)
      .flatMap((err) => (Array.isArray(err?._errors) ? err._errors : []))
      .filter(Boolean);
    if (zodMessages.length) return zodMessages.join(", ");
  }

  if (data?.message) return data.message;

  if (typeof error === "string") return error;
  if (error.message) return error.message;

  return fallback;
}
