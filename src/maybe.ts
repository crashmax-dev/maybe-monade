import { MaybeCallback } from './maybe-callback.js'
import { ErrorMessages, isNullOrUndefined } from './utils.js'
import type { Fn } from './types'

export class Maybe<T> {
  private constructor(private value: T | null) { }

  /**
   * Return an instance of Maybe wrapping an empty value
   */
  public static none<T>(): Maybe<T> {
    return new Maybe<T>(null)
  }

  /**
   * if the provided value is not null or undefined, return an instance of Maybe wrapping a nonempty value,
   * otherwise throw an error
   * @param value the value to wrap in an instance of Maybe
   */
  public static some<T>(value: T): Maybe<T> {
    if (!isNullOrUndefined(value)) {
      return new Maybe(value)
    }

    throw new Error(ErrorMessages.EMPTY_VALUE)
  }

  /**
   * return an instance of Maybe wrapping the provided value, otherwise return an instance of empty Maybe
   * @param value value to wrap into a Maybe
   */
  public static fromValue<T>(value: T): Maybe<T> {
    if (isNullOrUndefined(value)) {
      return Maybe.none<T>()
    } else {
      return Maybe.some(value)
    }
  }

  /**
   * return an instance of Maybe wrapping the provided callback, otherwise return an instance of empty Maybe
   * @param func callback to wrap into a Maybe
   */
  public static fromFunction<R>(func: Fn<R>): MaybeCallback<R> {
    if (typeof func === 'function') {
      return MaybeCallback.some<R>(func)
    }

    throw Error(ErrorMessages.EMPTY_CALLBACK)
  }

  /**
   * return true if the wrapped value is empty, false otherwise
   */
  public isEmpty(): boolean {
    return isNullOrUndefined(this.value)
  }

  /**
   * return true if the wrapped value is nonempty, false otherwise
   */
  public exists(): boolean {
    return !isNullOrUndefined(this.value)
  }

  /**
   * get the wrapped value if nonempty, otherwise throw an error
   */
  public get(): T {
    if (this.exists()) {
      return this.value!
    }

    throw new Error(ErrorMessages.GET_EMPTY_VALUE)
  }

  /**
   * return the wrapped value if nonempty, otherwise the provided default value.
   */
  public getOrElse(defaultValue: T): T {
    if (this.isEmpty()) {
      return defaultValue
    } else {
      return this.value!
    }
  }

  /**
   * return the value if nonempty, otherwise invoke alternative
   * and return the result of that invocation.
   * @param alternative the function to invoke
   */
  public orElse(alternative: () => Maybe<T>): Maybe<T> {
    if (this.exists()) {
      return Maybe.some(this.value!)
    } else {
      return alternative()
    }
  }

  /**
   * if the value exists, apply the provided mapping function to it,
   * return an instance of Maybe wrapping the result.
   * @param fmap the function to apply
   */
  public map<R>(fmap: (value: T) => R): Maybe<R> {
    if (this.exists()) {
      return Maybe.some(fmap(this.value!))
    } else {
      return Maybe.none()
    }
  }

  /**
   * if the wrapped value is nonempty, apply the provided mapping function to it,
   * return that result, otherwise return an instance of empty Maybe.
   * @param func the function to apply
   */
  public flatMap<R>(func: (value: T) => Maybe<R>): Maybe<R> {
    if (this.exists()) {
      return func(this.value!)
    } else {
      return Maybe.none()
    }
  }

  /**
   * apply func to the wrapped value then return an instance of Maybe wrapping
   * the value before applying the func function.
   * func could be console.log for example.
   * @param func function to apply
   */
  public do(func: (value: T) => void): Maybe<T> {
    if (this.exists() && func) {
      func(this.value!)
      return Maybe.fromValue(this.value!)
    } else {
      return Maybe.none()
    }
  }

  /**
   * if the wrapped value is nonempty, and the value matches the given predicate,
   * return a Maybe wrapping the value, otherwise return an instance of empty Maybe
   * @param predicate a predicate to apply to the value if nonempty
   */
  public filter(predicate: (x: T) => boolean): Maybe<T> {
    if (this.exists() && predicate(this.value!)) {
      return Maybe.some(this.value!)
    } else {
      return Maybe.none()
    }
  }
}
