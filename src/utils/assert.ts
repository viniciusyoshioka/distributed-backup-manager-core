import { isEnum } from './validators'


export function assertIsEnum<T>(enumObject: T, value: unknown): asserts value is T[keyof T] {
  const isValidEnumValue = isEnum(enumObject as object, value)
  if (!isValidEnumValue) {
    throw new Error(`${String(value)} is not a valid enum value`)
  }
}
