/**
 * Logs debug information with a timestamp
 */
export function debugLog(message: string, data?: any): void {
  if (process.env.NODE_ENV !== "production") {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    console.log(`[${timestamp}] ${message}`, data || "")
  }
}

