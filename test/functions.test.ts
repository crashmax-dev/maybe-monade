import test from 'ava'
import { Maybe } from '../src/maybe.js'
import { ErrorMessages } from '../src/utils.js'
import type { Fn } from '../src/types'

test('getOrElse', (t) => {
  const value = Maybe
    .none()
    .getOrElse(0)

  t.is(value, 0)
})

test('fromValue', (t) => {
  t.deepEqual(Maybe.fromValue(0), Maybe.some(0))
  t.deepEqual(Maybe.fromValue(undefined), Maybe.none())
  t.deepEqual(Maybe.fromValue(null), Maybe.none())
})

test('orElse', (t) => {
  const value = Maybe
    .none()
    .orElse(() => Maybe.some(0))

  t.deepEqual(value, Maybe.some(0))
})

test('map', (t) => {
  const value = Maybe
    .some(2)
    .map(x => x + 1)

  t.deepEqual(value, Maybe.some(3))
})

test('flatMap', (t) => {
  const value = Maybe
    .some(2)
    .flatMap(x => Maybe.some(x).map(y => y + 1))

  t.deepEqual(value, Maybe.some(3))
})

test('get', (t) => {
  const value = Maybe
    .some(2)
    .get()

  t.is(value, 2)
  t.throws(() => Maybe.none().get())
})

test('do', (t) => {
  const noneValue = Maybe
    .fromValue(2)
    .do(null as unknown as Fn<number>)

  t.deepEqual(noneValue, Maybe.none())

  Maybe
    .some(2)
    .do((v) => t.is(v, 2))
})

test('filter', (t) => {
  const value = Maybe
    .some(2)
    .filter(x => x % 3 === 0)

  t.deepEqual(value, Maybe.none())
})

test('isEmpty', (t) => {
  const value = Maybe.none()
  t.truthy(value.isEmpty())
})

test('exists', (t) => {
  const value = Maybe.some(2)
  t.truthy(value.exists())
})

test('should throw an errors', (t) => {
  t.throws(
    () => Maybe.some(null),
    { message: ErrorMessages.EMPTY_VALUE }
  )

  t.throws(
    () => Maybe.none().get(),
    { message: ErrorMessages.GET_EMPTY_VALUE }
  )

  t.throws(
    () => Maybe.fromFunction(null as any),
    { message: ErrorMessages.EMPTY_CALLBACK }
  )
})
