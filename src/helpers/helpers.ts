import assert from 'assert'
// @ts-ignore
const okk: <T>(val: T) => Exclude<T, void> = val => {
  assert.strict.ok(val)

  return val
}

export { okk }
