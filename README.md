[![License](https://img.shields.io/npm/l/@smbcheeky/error-object)](LICENSE_FILE)
[![deno.bundlejs.com](https://deno.bundlejs.com/badge?q=@smbcheeky/error-object&treeshake=[*])](https://deno.bundlejs.com/?q=@smbcheeky/error-object&treeshake=[*])
[![npm downloads](https://img.shields.io/npm/dm/@smbcheeky/error-object)](https://www.npmjs.com/package/@smbcheeky/error-object)
[![GitHub last commit](https://img.shields.io/github/last-commit/smbcheeky/error-object)](https://github.com/smbcheeky/error-object)
[![GitHub stars](https://img.shields.io/github/stars/smbcheeky/error-object)](https://img.shields.io/github/stars/smbcheeky/error-object)

## Installation

`npm install @smbcheeky/error-object`

`yarn add @smbcheeky/error-object`

## Description

The ErrorObject class is made to extend `Error` enabling checks like `errorObject instanceof Error` or
`errorObject instanceof ErrorObject`. The `ErrorObject` class is backwards compatible with `Error` and introduces a few
new features:

- It can be thrown or returned, you choose.
- It can be valid only if it contains a `code` and a `message` values
- It can have a numberCode, not just a string code
- set default values for the generic and fallback error objects via `ErrorObject.DEFAULT_GENERIC_CODE` and
  `ErrorObject.DEFAULT_GENERIC_MESSAGE`
- set a default domain for all errors via `ErrorObject.DEFAULT_DOMAIN`
- Use `ErrorObject.generic()` or `ErrorObject.withTag('TAG')` to create an error from thin air
- Use `.isGeneric()`, `.isFallback()` and `.hasTag()` to check if the error is a generic error, a fallback error or
  has a specific tag
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

## fromPayload()

To parse errors from any payload, check
out [@smbcheeky/error-object-from-payload](https://github.com/SMBCheeky/error-object-from-payload).

## Usage & Examples

For a guide on how to use the library, please check the first detailed example in
the [playground](https://github.com/SMBCheeky/error-object/blob/main/playground/index.ts) file.

```typescript
new ErrorObject({ code: '', message: 'Something went wrong.', domain: 'auth' }).debugLog('LOG');

// [LOG] Something went wrong [auth]
// {
//   "code": "",
//   "message": "Something went wrong",
//   "domain": "auth"
// }
```
