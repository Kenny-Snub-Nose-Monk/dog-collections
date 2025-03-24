/**
 * Gets a query parameter value from the URL
 */
export function getQueryParam(paramName: string): string | null {
  if (typeof window === "undefined") return null

  const params = new URLSearchParams(window.location.search)
  return params.get(paramName)
}

/**
 * Sets a query parameter in the URL without navigation
 */
export function setQueryParam(paramName: string, value: string | null): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)

  if (value === null || value === "") {
    url.searchParams.delete(paramName)
  } else {
    url.searchParams.set(paramName, value)
  }

  window.history.replaceState({ path: url.toString() }, "", url.toString())
}

/**
 * Updates multiple query parameters at once
 */
export function updateQueryParams(params: Record<string, string | null>): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)

  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === "") {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, value)
    }
  })

  window.history.replaceState({ path: url.toString() }, "", url.toString())
}

/**
 * Creates a URL with the current parameters plus any additional ones
 */
export function createUrlWithParams(baseUrl: string, additionalParams: Record<string, string | null> = {}): string {
  if (typeof window === "undefined") return baseUrl

  const url = new URL(baseUrl, window.location.origin)

  // First, copy existing query params
  const currentParams = new URLSearchParams(window.location.search)
  currentParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  // Then add/update with additional params
  Object.entries(additionalParams).forEach(([key, value]) => {
    if (value === null || value === "") {
      url.searchParams.delete(key)
    } else {
      url.searchParams.set(key, value)
    }
  })

  return url.toString()
}

/**
 * Clears a specific query parameter from the URL
 */
export function clearQueryParam(paramName: string): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  url.searchParams.delete(paramName)
  window.history.replaceState({ path: url.toString() }, "", url.toString())
}

/**
 * Clears all query parameters from the URL
 */
export function clearAllQueryParams(): void {
  if (typeof window === "undefined") return

  const url = new URL(window.location.href)
  url.search = ""
  window.history.replaceState({ path: url.toString() }, "", url.toString())
}

