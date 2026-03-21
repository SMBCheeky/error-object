/**
 * The {@link ErrorObject} is designed to:
 * - be both thrown and returned at the same time.
 * - become a wrapper around all error objects
 * - help provide a better overall user experience
 * - remove day-to-day boilerplate code
 * - improve error handling
 *
 * How to check if an object is an ErrorObject:
 *
 *
 *     const errorObject = ErrorObject.generic();
 *     errorObject instanceof ErrorObject => true
 *     errorObject instanceof Error => true
 *
 *     const error = new Error('regular error');
 *     error instanceof ErrorObject => false
 *     error instanceof Error => true
 *
 *
 * @extends {Error}
 */

export interface ErrorObjectParams {
  /** The error code used to identify and resolve the error. It is recommended codes are written to be human-readable, especially for the end-user. */
  code: string;
  /** Optional numeric identifier for the error, for cases when the string error code is not sufficient. */
  numberCode?: number;
  /** The primary error message. */
  message: string;
  /** A detailed error description created for user consumption. */
  details?: string;
  /** Optional property to categorize the error based on a domain. */
  domain?: string;
  /** Optional property to categorize the error based on a tag. */
  tag?: string;
  /** Can store anything used to create the error. */
  raw?: any;
}

export class ErrorObject extends Error {
  readonly __isErrorObjectTypeDiscriminator = true;

  static LOG_METHOD: ((...data: any[]) => void) | null = console.log;

  static GENERIC_CODE = "generic";
  static GENERIC_MESSAGE = "Something went wrong";
  static GENERIC_TAG = "generic-error-object";

  static INCLUDE_DOMAIN_IN_STRING = false;
  static INCLUDE_CODE_IN_STRING = true;

  static generic() {
    return new this({
      code: ErrorObject.GENERIC_CODE,
      message: ErrorObject.GENERIC_MESSAGE,
      tag: ErrorObject.GENERIC_TAG,
    });
  }

  code: string;
  numberCode?: number;
  message: string;
  details?: string;
  domain?: string;
  tag?: string;
  raw?: any;

  constructor({ code, numberCode, message, details, domain, tag, raw }: ErrorObjectParams) {
    super(message);

    this.code = code;
    this.numberCode = numberCode;
    this.message = message;
    this.details = details;
    this.domain = domain;
    this.tag = tag;
    this.raw = raw;

    // If you pass another ErrorObject or Error as raw, preserve its name and stack
    const rawObj = typeof raw === "object" && raw !== null ? raw : undefined;
    this.name = hasNonEmptyString(rawObj, "name") ? rawObj.name : this.code;
    this.stack = hasNonEmptyString(rawObj, "stack") ? rawObj.stack : undefined;

    // Enable `instanceof` checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * The {@link ErrorObject.isGeneric()} method allows users to check if an error is a generic error, usually used for quick iteration.
   */
  isGeneric(): boolean {
    return this.tag === ErrorObject.GENERIC_TAG;
  }

  /**
   * The {@link ErrorObject.hasTag()} method allows users to check if an error has a specific tag.
   */
  hasTag(tag?: string): boolean {
    return tag ? this.tag === tag : !!this.tag;
  }

  /**
   * Creates a new ErrorObject with the same properties as this one.
   */
  clone() {
    return new ErrorObject(this);
  }

  /**
   * @deprecated Use {@link ErrorObject.clone()} instead.
   */
  new() {
    return this.clone();
  }

  // Setters
  setCode(value: string | ((old: string) => string)) {
    this.code = typeof value === "function" ? value(this.code) : value;
    return this;
  }

  setNumberCode(value?: number | ((old?: number) => number | undefined)) {
    this.numberCode =
      typeof value === "function" ? value(this.numberCode) : value;
    return this;
  }

  setMessage(value: string | ((old: string) => string)) {
    this.message = typeof value === "function" ? value(this.message) : value;
    return this;
  }

  setDetails(value?: string | ((old?: string) => string | undefined)) {
    this.details = typeof value === "function" ? value(this.details) : value;
    return this;
  }

  setDomain(value?: string | ((old?: string) => string | undefined)) {
    this.domain = typeof value === "function" ? value(this.domain) : value;
    return this;
  }

  setTag(value?: string | ((old?: string) => string | undefined)) {
    this.tag = typeof value === "function" ? value(this.tag) : value;
    return this;
  }

  setRaw(value?: any | ((old?: any) => any)) {
    this.raw = typeof value === "function" ? value(this.raw) : value;
    return this;
  }

  // Logging helpers
  toString() {
    const showDomain = ErrorObject.INCLUDE_DOMAIN_IN_STRING && !!this.domain;
    const showCode =
      ErrorObject.INCLUDE_CODE_IN_STRING &&
      this.code.length > 0 &&
      (!showDomain || this.domain !== this.code);

    if (!showDomain && !showCode) return this.message;

    const suffix = showDomain && showCode
      ? `${this.domain}/${this.code}`
      : showDomain
        ? this.domain
        : this.code;

    return `${this.message} [${suffix}]`;
  }

  toDebugString() {
    const json = JSON.stringify(
      this,
      (key, value) => {
        if (typeof value === "function") return undefined;
        if (key === "__isErrorObjectTypeDiscriminator") return undefined;
        return value;
      },
      2,
    );
    return `${this.toString()}\n[DEBUG] ${json}`;
  }

  toJSON() {
    const obj: Record<string, unknown> = {
      code: this.code,
      message: this.message,
    };
    if (this.numberCode !== undefined) obj.numberCode = this.numberCode;
    if (this.details !== undefined) obj.details = this.details;
    if (this.domain !== undefined) obj.domain = this.domain;
    if (this.tag !== undefined) obj.tag = this.tag;
    if (this.raw !== undefined) obj.raw = this.raw;
    return obj;
  }

  // Log methods
  log(logTag: string) {
    return this._log(logTag, "log");
  }

  debugLog(logTag: string) {
    return this._log(logTag, "debug");
  }

  protected _log(logTag: string, logLevel: "log" | "debug") {
    if (!ErrorObject.LOG_METHOD) return this;
    const logForThis =
      logLevel === "debug" ? this.toDebugString() : this.toString();
    ErrorObject.LOG_METHOD(`[${logTag}]`, logForThis);
    return this;
  }

  /**
   * The {@link ErrorObject.withTag()} method allows users to create
   * a new generic error object with a specific tag.
   */
  static withTag(tag: string) {
    return ErrorObject.generic().setTag(tag);
  }

  /**
   * Type guard to check if an object is an instance of ErrorObject
   */
  static is(object: any): object is ErrorObject {
    return (
      object instanceof ErrorObject ||
      (object && object?.__isErrorObjectTypeDiscriminator === true)
    );
  }
}

/**
 * Type guard to check if an object is an instance of ErrorObject
 */
export function isErrorObject(object: any): object is ErrorObject {
  return ErrorObject.is(object);
}

/**
 * A {@link ResultObject} wraps either a success value or an {@link ErrorObject}.
 *
 *     const result = ResultObject.ok({ name: "Alice" });
 *     if (result.isOk()) result.data; // { name: "Alice" }
 *
 *     const error = ResultObject.err(ErrorObject.generic());
 *     if (error.isErr()) error.error; // ErrorObject
 */
export class ResultObject<T> {
  readonly data?: T;
  readonly error?: ErrorObject;

  private constructor(data?: T, error?: ErrorObject) {
    this.data = data;
    this.error = error;
  }

  static ok<T>(data: T): ResultObject<T> {
    return new ResultObject(data, undefined);
  }

  static err<T = never>(error: ErrorObject): ResultObject<T> {
    return new ResultObject<T>(undefined, error);
  }

  isOk(): this is ResultObject<T> & { data: T; error: undefined } {
    return this.error === undefined;
  }

  hasData(): this is ResultObject<T> & { data: T; error: undefined } {
    return this.isOk();
  }

  isData(): this is ResultObject<T> & { data: T; error: undefined } {
    return this.isOk();
  }

  isErr(): this is ResultObject<T> & { data: undefined; error: ErrorObject } {
    return this.error !== undefined;
  }

  isError(): this is ResultObject<T> & { data: undefined; error: ErrorObject } {
    return this.isErr();
  }
}

function hasNonEmptyString<K extends string>(
  obj: object | undefined,
  key: K,
): obj is Record<K, string> {
  return (
    obj !== undefined &&
    key in obj &&
    typeof (obj as any)[key] === "string" &&
    (obj as any)[key].length > 0
  );
}
