export const isNullOrUndefined = (value: unknown): boolean => {
  return value === null || typeof value === 'undefined'
}

export enum ErrorMessages {
  EMPTY_VALUE = 'Provided value must not be empty',
  EMPTY_CALLBACK = 'Provided value must be a function',
  GET_EMPTY_VALUE = 'You try to access an empty value'
}
