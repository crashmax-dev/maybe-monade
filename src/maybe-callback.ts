import { Maybe } from './maybe.js'
import { ErrorMessages } from './utils.js'
import type { Fn } from './types'

export class MaybeCallback<T> {
  private constructor(private callback: Fn<T>) { }

  /**
   * return an instance of Maybe wrapping an empty value
   */
  public static none<R>(): MaybeCallback<R> {
    // @ts-ignore
    return new MaybeCallback(null)
  }

  /**
   * if the provided callback is not a function, return an instance of Maybe wrapping a nonempty value,
   * otherwise throw an error
   * @param callback
   */
  public static some<R>(callback: Fn<R>): MaybeCallback<R> {
    if (typeof callback !== 'function') {
      throw new Error(ErrorMessages.EMPTY_CALLBACK)
    }
    return new MaybeCallback(callback)
  }

  /**
   * return true if the wrapped value is empty, false otherwise
   */
  public isEmpty(): boolean {
    return this.callback === null
  }

  /**
   * Call the wrapped function in unsafe mode (could throw errors)
   * if the wrapped function is empty return empty Maybe,
   * otherwise return an instance of Maybe wrapping the function result
   * @param args arguments to pass to the wrapped function
   */
  public apply(...args: unknown[]): Maybe<T> {
    if (!this.isEmpty() && typeof this.callback === 'function') {
      return Maybe.fromValue<T>(this.callback.apply(null, args))
    } else {
      return Maybe.none()
    }
  }

  /**
   * call the wrapped function in a safe mode,
   * wrap the execution in a try catch bloc. in case of error return empty Maybe,
   * otherwise return an instance of Maybe wrapping the function result
   * @param args arguments to pass to the wrapped function
   */
  public applySafe(...args: unknown[]): Maybe<T> {
    if (this.isEmpty() || typeof this.callback !== 'function') {
      return Maybe.none<T>()
    }

    try {
      return Maybe.fromValue<T>(this.callback.apply(null, args))
    } catch (ex) {
      return Maybe.none<T>()
    }
  }
}
