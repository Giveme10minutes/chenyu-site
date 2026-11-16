// Temporary blank covers for testing a full shelf.
export function withBlankBooks(entries) {
  const tones = ["sand", "green", "rust", "blue", "sand", "rust",
    "green", "sand", "blue", "rust", "green", "sand"];
  const blankBooks = tones.map((tone, index) => ({
    id: `blank-${index + 1}`,
    title: `空白书 ${index + 1}`,
    summary: "测试占位",
    tone,
    blank: true,
  }));
  const middle = blankBooks.length / 2;
  return [...blankBooks.slice(0, middle), ...entries, ...blankBooks.slice(middle)];
}
