"use strict";
// If you can, you obviously should.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Err = exports.Ok = exports.Result = exports.None = exports.Some = exports.Option = exports.constant = exports.id = void 0;
/**
 * The identity function. Returns its input unmodified.
 */
function id(value) {
    return value;
}
exports.id = id;
/**
 * Construct a function which always returns the provided value.
 */
function constant(value) {
    return () => value;
}
exports.constant = constant;
/**
 * A nullable value of type `A`.
 */
class Option {
    /**
     * Construct an [[Option]] from a nullable value of `A`.
     */
    constructor(value) {
        this.option = value;
    }
    /**
     * Convert a [[Thenable]] returning `A` into a [[Thenable]] returning an [[Option]] of `A`, or `None` if the [[Thenable]] fails.
     * The new [[Thenable]] always succeeds, reflecting an error condition in the `Option` instead of the failure callback.
     */
    static try(m) {
        return m.then(Some, constant(exports.None));
    }
    /**
     * In the absence of pattern matching in the language, the `match` function takes two callbacks, one for each possible
     * state of the [[Option]], and calls the one that matches the actual state.
     */
    match(onSome, onNone) {
        if (this.option === undefined) {
            return onNone();
        }
        else {
            return onSome(this.option);
        }
    }
    /**
     * Test if the [[Option]] contains a value.
     */
    isSome() {
        return this.option !== undefined;
    }
    /**
     * Test if the [[Option]] is null.
     */
    isNone() {
        return this.option === undefined;
    }
    /**
     * Test if the [[Option]] contains a value that's equal to `value`.
     */
    contains(value) {
        return this.option === value;
    }
    /**
     * Call the provided function with the contained value if the [[Option]] is non-null.
     */
    ifSome(onSome) {
        this.match(onSome, constant({}));
    }
    /**
     * Call the provided function if the [[Option]] is null.
     */
    ifNone(onNone) {
        this.match(constant({}), onNone);
    }
    /**
     * If the [[Option]] is non-null, call the provided function with the contained value and
     * return a new [[Option]] containing the result of the function, which must be another [[Option]].
     */
    andThen(f) {
        return this.match(f, constant(exports.None));
    }
    /**
     * If the [[Option]] is null, call the provided function and return its result, which must be another [[Option]] of `A`.
     */
    orElse(f) {
        return this.match(Some, f);
    }
    /**
     * If the [[Option]] is non-null, transform its contained value using the provided function.
     */
    map(f) {
        return this.andThen((v) => Some(f(v)));
    }
    /**
     * If the [[Option]] is non-null, return the provided [[Option]] of `B`, otherwise return [[None]].
     */
    and(option) {
        return this.andThen(constant(option));
    }
    /**
     * If the [[Option]] is null, return the provided [[Option]], otherwise return the original [[Option]].
     */
    or(option) {
        return this.orElse(constant(option));
    }
    /**
     * Return the value contained in the [[Option]] if it's non-null, or return `defaultValue` otherwise.
     */
    getOr(defaultValue) {
        return this.match(id, constant(defaultValue));
    }
    /**
     * Return the value contained in the [[Option]] if it's non-null, or call the provided function and return its result otherwise.
     */
    getOrElse(f) {
        return this.match(id, f);
    }
    /**
     * Convert the [[Option]] into a [[Result]], using the provided `error` value if the [[Option]] is null.
     */
    okOr(error) {
        return this.match(Ok, () => Err(error));
    }
    /**
     * Convert the [[Option]] into a [[Result]], calling the provided function to obtain an error value if the [[Option]] is null.
     */
    okOrElse(f) {
        return this.match(Ok, () => Err(f()));
    }
    /**
     * Convert the [[Option]] into a nullable value of `A`.
     */
    unwrap() {
        return this.option;
    }
    /**
     * Convert the [[Option]] into a value of `A`, using the provided default value if the [[Option]] is null.
     */
    unwrapOr(defaultValue) {
        return this.match(id, constant(defaultValue));
    }
    /**
     * Convert the [[Option]] into a value of `A`, calling the provided function to produce a default value if the [[Option]] is null.
     */
    unwrapOrElse(f) {
        return this.match(id, f);
    }
}
exports.Option = Option;
/**
 * Construct an [[Option]] containing the provided value.
 *
 * ```typescript
 * const option: Option<string> = Some("Hello Joe");
 * ```
 */
function Some(value) {
    return new Option(value);
}
exports.Some = Some;
/**
 * A null [[Option]].
 *
 * ```typescript
 * const option: Option<string> = None;
 * ```
 */
exports.None = new Option(undefined);
/**
 * A value which can be of either type `A` or type `E`.
 *
 * This is normally used as a return value for operations which can fail: `E` is short for `Error`.
 */
class Result {
    constructor(value) {
        this.result = value;
    }
    /**
     * Convert a [[Thenable]] returning `A` into a [[Thenable]] returning a [[Result]] of either `A` or the `Error` type.
     * The new [[Thenable]] always succeeds, reflecting an error condition in the `Result` instead of the failure callback.
     */
    static try(m) {
        return m.then(Ok, Err);
    }
    /**
     * In the absence of pattern matching in the language, the `match` function takes two callbacks, one for each possible
     * state of the [[Result]], and calls the one that matches the actual state.
     */
    match(onOk, onErr) {
        if (this.result.tag === "ok") {
            return onOk(this.result.value);
        }
        else {
            return onErr(this.result.value);
        }
    }
    isOk() {
        return this.result.tag === "ok";
    }
    isErr() {
        return this.result.tag === "err";
    }
    ifOk(onOk) {
        this.match(onOk, constant({}));
    }
    ifErr(onErr) {
        this.match(constant({}), onErr);
    }
    andThen(f) {
        return this.match(f, Err);
    }
    orElse(f) {
        return this.match(Ok, f);
    }
    map(f) {
        return this.andThen((value) => Ok(f(value)));
    }
    mapErr(f) {
        return this.orElse((value) => Err(f(value)));
    }
    and(result) {
        return this.andThen(constant(result));
    }
    or(result) {
        return this.orElse(constant(result));
    }
    getOr(defaultValue) {
        return this.match(id, constant(defaultValue));
    }
    getOrElse(f) {
        return this.match(id, f);
    }
    /**
     * Converts a [[Result]] into a nullable value of `A`, discarding any error value and returning `undefined` in place of the error.
     */
    unwrap() {
        return this.result.tag === "ok" ? this.result.value : undefined;
    }
    /**
     * Converts a [[Result]] into a nullable value of `E`, discarding any success value and returning `undefined` in place of the `A` value.
     */
    unwrapErr() {
        return this.result.tag === "err" ? this.result.value : undefined;
    }
}
exports.Result = Result;
/**
 * Construct a [[Result]] with a success value of `A`.
 *
 * ```typescript
 * const systemWorking: Result<string> = Ok("Seems to be!");
 * ```
 */
function Ok(value) {
    return new Result({ tag: "ok", value });
}
exports.Ok = Ok;
/**
 * Construct a [[Result]] with an error value of `E`.
 *
 * ```typescript
 * const systemWorking: Result<string> = Err("System down!");
 * ```
 */
function Err(value) {
    return new Result({ tag: "err", value });
}
exports.Err = Err;
//# sourceMappingURL=rust.js.map