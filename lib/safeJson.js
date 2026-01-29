export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");

    try {
      return JSON.parse(match[0]);
    } catch (err) {
      console.error("❌ Invalid JSON from AI:", match[0]);
      throw err;
    }
  }
}
