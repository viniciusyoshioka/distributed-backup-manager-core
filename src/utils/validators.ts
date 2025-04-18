export function isEnum(enumObject: object, value: unknown): boolean {
  const enumValues: unknown[] = Object.values(enumObject)
  return enumValues.includes(value)
}
