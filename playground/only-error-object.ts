/**
 * The {@link ErrorObject} is designed to:
 * - be both thrown and returned at the same time.
 * - become a wrapper around all error objects
 * - help provide a better overall user experience
 * - remove day-to-day boilerplate code
 * - improve error handling
 *
 * How to check if object is an ErrorObject:
 *
 *
 *     const errorObject = new ErrorObject.generic();
 *     errorObject instanceof ErrorObject => true
 *     errorObject instanceof Error => true
 *
 *     const error = new Error('regular error');
 *     error instanceof ErrorObject => false
 *     error instanceof Error => true
 *
 *
 * @extends {Error}
 *
 * @property {string} code - The error code used to identify and resolve the error. It is recommended codes are written to be human-readable, especially for the end-user.
 * @property {string} message - The primary error message.
 * @property {number} [numberCode] - Optional numeric identifier for the error, for cases when the string error code is not sufficient.
 * @property {string} [details] - A detailed error description created for user consumption.
 * @property {string} [domain] - Optional property to categorize the error based on a domain.
 * @property {string} [tag] - Optional property to categorize the error based on a tag.
 * @property {ErrorObject[]} [nextErrors] - Related error objects. usually populated when `pathToErrors` is used.
 * Allows grouping multiple errors under a single main error.
 * @property [raw] - Can store the input object that was used to create the error.
 * @property {string} description - A description generated from the error object. Make an effort to make it a human-readable error message,
 * as this way you can just show the description directly to the user.
 */
export class ErrorObject extends Error {
  // Used for try catch blocks. I recommend keeping this on at all times
  static SHOW_ERROR_LOGS = true;

  // Used to instantiate the utility .generic and .fallback error objects
  static DEFAULT_GENERIC_CODE = 'generic';
  static DEFAULT_GENERIC_MESSAGE = 'Something went wrong';

  static DEFAULT_GENERIC_TAG = 'generic-error-object';
  static DEFAULT_FALLBACK_TAG = 'fallback-error-object';

  // Used to customize all error objects
  static DEFAULT_DOMAIN = undefined;

  // Check `isGeneric()` and `isFallback()` for details.
  static generic = () =>
    new ErrorObject({
      code: ErrorObject.DEFAULT_GENERIC_CODE,
      message: ErrorObject.DEFAULT_GENERIC_MESSAGE,
      tag: ErrorObject.DEFAULT_GENERIC_TAG,
    });
  static fallback = () =>
    new ErrorObject({
      code: ErrorObject.DEFAULT_GENERIC_CODE,
      message: ErrorObject.DEFAULT_GENERIC_MESSAGE,
      tag: ErrorObject.DEFAULT_FALLBACK_TAG,
    });

  code: string;
  numberCode?: number;
  message: string;
  details?: string;
  domain?: string;

  tag?: string;
  nextErrors?: ErrorObject[];
  raw?: any;

  constructor({
                code,
                numberCode,
                message,
                details,
                domain,
                tag,
                nextErrors,
                raw,
              }: {
    code: string;
    numberCode?: number;
    message: string;
    details?: string;
    domain?: string;
    tag?: string;
    nextErrors?: ErrorObject[];
    raw?: any;
  } | ErrorObject) {
    super(message);

    this.code = code;
    this.numberCode = numberCode;
    this.message = message;
    this.details = details;
    this.domain =
      typeof domain === 'string' && domain
      ? domain
      : ErrorObject.DEFAULT_DOMAIN;

    // Add logging information
    this.tag = tag;
    this.nextErrors = nextErrors;
    this.raw = raw;

    // If you pass another ErrorObject or Error, these may also be useful
    this.name =
      this.raw &&
      typeof this.raw === 'object' &&
      'name' in this.raw &&
      typeof this.raw.name === 'string' &&
      this.raw.name.length > 0
      ? this.raw.name
      : this.code;
    this.stack =
      this.raw &&
      typeof this.raw === 'object' &&
      'stack' in this.raw &&
      typeof this.raw.stack === 'string' &&
      this.raw.stack.length > 0
      ? this.raw.stack
      : undefined;

    // Enable `instanceof` checks
    Object.setPrototypeOf(this, ErrorObject.prototype);
  }

  /**
   * The {@link ErrorObject.isGeneric()} method allows users to check if an error is a generic error, usually used for quick iteration.
   */
  isGeneric(): boolean {
    return this.tag === ErrorObject.DEFAULT_GENERIC_TAG;
  }

  /**
   * The {@link ErrorObject.isFallback()} method allows users to check if an error is a fallback error, returned when an error could not be created.
   */
  isFallback(): boolean {
    return this.tag === ErrorObject.DEFAULT_FALLBACK_TAG;
  }

  /**
   * The {@link ErrorObject.hasTag()} method allows users to check if an error has a specific tag.
   */
  hasTag(tag?: string): boolean {
    return tag ? this.tag === tag : !!this.tag;
  }

  /**
   * The {@link ErrorObject.new()} method allows users to create a new error object from an existing one, useful when you want to just change the error message.
   */
  new() {
    return new ErrorObject(this);
  }

  // Setters
  setCode(value: string | ((old: string) => string)) {
    this.code = typeof value === 'function' ? value(this.code) : value;
    return this;
  }

  setNumberCode(value?: number | ((old?: number) => number | undefined)) {
    this.numberCode =
      typeof value === 'function' ? value(this.numberCode) : value;
    return this;
  }

  setMessage(value: string | ((old: string) => string)) {
    this.message = typeof value === 'function' ? value(this.message) : value;
    return this;
  }

  setDetails(value?: string | ((old?: string) => string | undefined)) {
    this.details = typeof value === 'function' ? value(this.details) : value;
    return this;
  }

  setDomain(value?: string | ((old?: string) => string | undefined)) {
    this.domain = typeof value === 'function' ? value(this.domain) : value;
    return this;
  }

  setTag(value?: string | ((old?: string) => string | undefined)) {
    this.tag = typeof value === 'function' ? value(this.tag) : value;
    return this;
  }

  setRaw(value?: any | ((old?: any) => any | undefined)) {
    this.raw = typeof value === 'function' ? value(this.raw) : value;
    return this;
  }

  setNextErrors(
    value?: ErrorObject[] | ((old?: ErrorObject[]) => ErrorObject[] | undefined),
  ) {
    this.nextErrors =
      typeof value === 'function' ? value(this.nextErrors) : value;
    return this;
  }

  // Logging helpers
  toString() {
    // Create clean user facing description for error; you might even use it directly in your UI...
    let extraDomainAndCode = '';
    let extraDomain = this.domain && this.domain?.length > 0 ? this.domain : '';
    let extraCode =
      this.code.length > 0 &&
      (this.domain
       ? this.domain?.length > 0 && !this.domain.includes(this.code)
       : true)
      ? this.code
      : '';
    if (extraCode?.length > 0 || extraDomain?.length > 0) {
      extraDomainAndCode = `[${extraDomain}${
        extraDomain?.length > 0 && extraCode?.length > 0 ? '/' : ''
      }${extraCode}]`;
    }
    return `${this.message}${
      extraDomainAndCode?.length > 0 ? ' ' : ''
    }${extraDomainAndCode}`;
  }

  toDebugString() {
    return (
      this.toString() +
      `\n${JSON.stringify(
        {
          code: this.code,
          numberCode: this.numberCode,
          message: this.message,
          details: this.details,
          domain: this.domain,
          tag: this.tag,
        },
        null,
        2,
      )}`
    );
  }

  toVerboseString() {
    return (
      this.toDebugString() +
      `\n${JSON.stringify(
        {
          raw: this.raw,
          nextErrors: this.nextErrors,
        },
        null,
        2,
      )}`
    );
  }

  // Log methods
  log(logTag: string) {
    return this._log(logTag, 'log');
  }

  debugLog(logTag: string) {
    return this._log(logTag, 'debug');
  }

  verboseLog(logTag: string) {
    return this._log(logTag, 'verbose');
  }

  private _log(
    logTag: string,
    logLevel: 'log' | 'debug' | 'verbose',
  ) {
    const logForThis =
      logLevel === 'verbose'
      ? this.toVerboseString()
      : logLevel === 'debug'
        ? this.toDebugString()
        : this.toString();
    if (Array.isArray(this.nextErrors) && this.nextErrors.length > 0) {
      let row = 1;
      console.log(`[${logTag}][${row}]`, logForThis);
      for (const error of this.nextErrors) {
        row++;
        console.log(
          `[${logTag}][${row}]`,
          logLevel === 'verbose'
          ? error.toVerboseString()
          : logLevel === 'debug'
            ? error.toDebugString()
            : error.toString(),
        );
      }
    }
    else {
      console.log(`[${logTag}]`, logForThis);
    }
    return this;
  }

  // Just a shortcut to create a generic error object with a specific tag
  static withTag(tag: string) {
    return ErrorObject.generic().setTag(tag);
  }
}
