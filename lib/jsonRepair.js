export function extractAndParseJSON(text) {

  if (!text) return null

  // try direct parse
  try {
    return JSON.parse(text)
  } catch {}

  // try bracket extraction
  const start = text.indexOf("{")
  const end = text.lastIndexOf("}")

  if (start === -1 || end === -1) return null

  const candidate = text.slice(start, end + 1)

  try {
    return JSON.parse(candidate)
  } catch {}

  return null
}