[![License](https://img.shields.io/npm/l/@smbcheeky/error-object)](LICENSE_FILE)
[![deno.bundlejs.com](https://deno.bundlejs.com/badge?q=@smbcheeky/error-object&treeshake=[*])](https://deno.bundlejs.com/?q=@smbcheeky/error-object&treeshake=[*])
[![npm downloads](https://img.shields.io/npm/dm/@smbcheeky/error-object)](https://www.npmjs.com/package/@smbcheeky/error-object)
[![GitHub last commit](https://img.shields.io/github/last-commit/smbcheeky/error-object)](https://github.com/smbcheeky/error-object)
[![GitHub stars](https://img.shields.io/github/stars/smbcheeky/error-object)](https://img.shields.io/github/stars/smbcheeky/error-object)

## Installation

`npm install @smbcheeky/error-object`

`yarn add @smbcheeky/error-object`

## Description

The ErrorObject class is made to extend `Error` enabling type guard checks like `errorObject instanceof Error`,
`errorObject instanceof ErrorObject`, ErrorObject.is() and isErrorObject(). The `ErrorObject` class is backwards
compatible with `Error` and introduces a few new features:

- It can be thrown or returned, you choose.
- It can be valid only if it contains a `code` and a `message` values
- Intuitive type guards which help narrow down the type of JS objects
- It can have a numberCode, not just a string code
- set default values for the generic error objects via `ErrorObject.DEFAULT_GENERIC_CODE` and
  `ErrorObject.DEFAULT_GENERIC_MESSAGE`
- set a default domain for all errors via `ErrorObject.DEFAULT_DOMAIN`
- Use `ErrorObject.generic()` or `ErrorObject.withTag('TAG')` to create an error from thin air
- Use `.isGeneric()`, and `.hasTag()` to check if the error is a generic error or has a specific tag
- Chain call setters like `.setCode()`, `.setNumberCode()`, `.setMessage()`, `.setDetails()`, `.setDomain()`,
  `.setTag()` to modify the error
  object at any moment
- Setters can receive a value or a transform function, facilitating access to the current value while you modify the
  property
- Chain logs like `.log(tag)`, `.debugLog(tag)`, `.verboseLog(tag)` to log information about the error object
  inline
- Use `.description()` or `.toString()` to get a human-readable description of the error
- Use `details`, `domain` and `tag` to customize the error object and help easily distinguish between different
  errors

## Override default log method (default is `console.log`)

To override the default log method, set the static property `LOG_METHOD` to a function that accepts any number of
arguments and returns nothing. The default log method is `console.log`.

## Override default generic error code and message

To override the default generic error code and message, set the static properties `GENERIC_CODE` and `GENERIC_MESSAGE`.

## new ErrorObjectFromPayload(payload, options)

To parse errors from any payload, check
out [@smbcheeky/error-object-from-payload](https://github.com/SMBCheeky/error-object-from-payload).

## Usage & Examples

You can find examples in the [playground](https://github.com/SMBCheeky/error-object/blob/main/playground/index.ts) file.

```typescript
new ErrorObject({
  code: "",
  message: "Something went wrong.",
  domain: "auth",
}).debugLog("LOG");

// [LOG] Something went wrong [auth]
// {
//   "code": "",
//   "message": "Something went wrong",
//   "domain": "auth"
// }
```

```typescript
const foo = (): { success: true } | ErrorObject => {
  return { success: true };
};

const fooError = (): { success: true } | ErrorObject => {
  return ErrorObject.generic();
};

const result1 = foo();
if (isErrorObject(result1)) {
  result1;
  result1.code;
  console.log("result1 is ErrorObject");
  return;
}
result1;
// result1.code; // triggers a type error
console.log("result1 is not ErrorObject");

const result2 = foo();
if (result2 instanceof ErrorObject) {
  result2;
  result2.code;
  console.log("result2 is ErrorObject");
  return;
}
result2;
// result2.code; // triggers a type error
console.log("result2 is not ErrorObject");

const result3 = fooError();
if (ErrorObject.is(result3)) {
  result3;
  result3.code;
  console.log("result3 is ErrorObject");
  return;
}
result3;
// result3.code; // triggers a type error
console.log("result3 is not ErrorObject");
```
