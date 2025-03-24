/**
 * Gets a user-friendly error message based on the error type
 */
export function getFriendlyErrorMessage(error: unknown): string {
  if (!error) return "An unknown error occurred"

  // Network errors
  if (error instanceof TypeError && error.message.includes("fetch")) {
    return "Unable to connect to the server. Please check your internet connection."
  }

  // API errors
  if (error instanceof Error) {
    if (error.message.includes("404")) {
      return "The requested resource was not found."
    }
    if (error.message.includes("timeout") || error.message.includes("timed out")) {
      return "The request took too long to complete. Please try again."
    }
    if (error.message.includes("rate limit")) {
      return "You've made too many requests. Please wait a moment and try again."
    }
    return error.message
  }

  // Default fallback
  return "Something went wrong. Please try again later."
}

/**
 * Checks if cached data is available for a given key
 */
export function hasCachedData(key: string): boolean {
  try {
    return localStorage.getItem(key) !== null
  } catch (error) {
    return false
  }
}

