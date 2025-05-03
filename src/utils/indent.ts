export function indent(stringToIndent: string, count = 2, char = ' '): string {
  if (count < 0) {
    throw new Error('Count must be a non-negative integer')
  }

  if (char.length > 1) {
    throw new Error('Character must be a single character')
  }

  const indentationChars = char.repeat(count)
  return stringToIndent
    .split('\n')
    .map(line => `${indentationChars}${line}`)
    .join('\n')
}
