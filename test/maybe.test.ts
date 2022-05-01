import test from 'ava'
import { Maybe } from '../src/maybe.js'
import { ErrorMessages } from '../src/utils.js'
import { getUserById, getUserToken } from './fixtures/user.js'
import type { IAppUser } from './fixtures/user.js'
import type { Fn } from 'src/types.js'

test('from some function', (t) => {
  const div = (a: number, b: number) => a / b
  const safeDiv = Maybe.fromFunction<number>(div)
  const just3 = safeDiv.apply(1, 2)
  t.deepEqual(just3, Maybe.some(0.5))
})

test('from some function returning null', (t) => {
  const square = (a: number | null): number | null => (a ? a * a : null)
  const maybe_square = Maybe.fromFunction(square)
  const maybe_result = maybe_square.apply(null)
  const mapped_result = maybe_result
    .map(x => x! + 1)
    .map(x => x + 2) // expected => { value: null }

  t.deepEqual(mapped_result, Maybe.none())
})

test('from undefined function', (t) => {
  // callback which could be empty
  // eslint-disable-next-line
  const callback: any = undefined
  const wrappedCallback = Maybe.fromFunction<number>(callback)

  // executing undefined function returns None
  // instead of throwing "undefined is not a function" Error
  const result = wrappedCallback.apply()
  t.deepEqual(result, Maybe.none())
})

test('from throwable function', (t) => {
  const throws = (): number => {
    throw new Error('error')
  }
  const wrapped = Maybe.fromFunction<number>(throws)
  const wrappedResult = wrapped.applySafe()
  t.deepEqual(wrappedResult, Maybe.none())
})

test('should be empty', (t) => {
  const intNum = Maybe.fromValue(null) as unknown as Maybe<number>
  const str = Maybe.fromValue(null)
  const strNotEmpty = Maybe.fromValue('hello')
  const noneValue = Maybe.none()

  t.truthy(intNum.isEmpty())
  t.falsy(intNum.exists())
  t.is(intNum.getOrElse(0), 0)
  t.truthy(str.isEmpty())
  t.falsy(strNotEmpty.isEmpty())
  t.truthy(noneValue.isEmpty())
})

test('should return the right value', (t) => {
  const intNum = Maybe.fromValue(12)
  const val = intNum.getOrElse(null as unknown as number)
  const str = Maybe.fromValue<string>('12')
  const strVal = str.getOrElse(null as unknown as string)

  t.is(val, 12)
  t.is(strVal, '12')
})

test('should throw error', (t) => {
  t.throws(
    () => Maybe.some(null),
    { message: ErrorMessages.EMPTY_VALUE }
  )
})

test('should throw an error', (t) => {
  t.throws(
    () => Maybe.some(null),
    { message: ErrorMessages.EMPTY_VALUE }
  )
})

test('should add one', (t) => {
  const just2 = Maybe.fromValue(3.0)
  const add = (x: number) => x + 1
  const just3 = just2.map(add)
  const div4 = (x: number) => '1' + x
  const addToTab = (tab: number[]) => tab.map(x => x + 1)
  const justTab = Maybe.fromValue([1, 2, 3])

  t.is(just3.get(), 3.0 + 1)
  t.is(just2.map(div4).get(), '13')
  t.deepEqual(justTab.map(addToTab).get(), [2, 3, 4])
})

test('orElse', (t) => {
  const num = Maybe
    .none()
    .orElse(() => Maybe.fromValue(2))

  t.deepEqual(num, Maybe.fromValue(2))
})

test('do', (t) => {
  const value = Maybe
    .fromValue(2)
    .do(null as unknown as Fn<number>)

  t.deepEqual(value, Maybe.none())
})

test('flatMap', (t) => {
  const value = Maybe
    .fromValue(2)
    .flatMap(() => Maybe.fromValue(2))

  t.deepEqual(value, Maybe.fromValue(2))
})

test('should filter', (t) => {
  const hello = Maybe.fromValue('hello')
  const filtered = hello.filter(t => t === 'hello')
  t.deepEqual(filtered, Maybe.fromValue('hello'))

  const none = hello.filter(t => t === 'not hello')
  t.deepEqual(none, Maybe.none())
})

test('example should work', (t) => {
  const appUser: IAppUser = {
    id: 1,
    email: 'bob@maybe.com',
    token: 'FOO_BAR_TOKEN',
    expire: new Date(2050, 1, 1)
  }

  const isUserAuthenticated: boolean = getUserById(2)
    .flatMap(getUserToken)
    .map<boolean>(({ expire }) => expire! > new Date())
    .do(x => console.log)
    .getOrElse(false)

  t.truthy(isUserAuthenticated)

  const defaultUser: IAppUser = {
    id: -1,
    email: '',
    token: '',
    expire: null
  }

  const users: IAppUser[] = [0, 1].map(n => {
    return getUserById(n)
      .flatMap<IAppUser>(getUserToken)
      .filter(({ expire }) => expire! > new Date())
      .orElse(() => Maybe.fromValue(defaultUser))
      .getOrElse(null as unknown as IAppUser)
  })

  t.deepEqual(users, [defaultUser, appUser])
})
