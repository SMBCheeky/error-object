[![License](https://img.shields.io/npm/l/@smbcheeky/error-object)](LICENSE_FILE)
[![deno.bundlejs.com](https://deno.bundlejs.com/badge?q=@smbcheeky/error-object&treeshake=[*])](https://deno.bundlejs.com/?q=@smbcheeky/error-object&treeshake=[*])
[![npm downloads](https://img.shields.io/npm/dm/@smbcheeky/error-object)](https://www.npmjs.com/package/@smbcheeky/error-object)
[![GitHub last commit](https://img.shields.io/github/last-commit/smbcheeky/error-object)](https://github.com/smbcheeky/error-object)
[![GitHub stars](https://img.shields.io/github/stars/smbcheeky/error-object)](https://img.shields.io/github/stars/smbcheeky/error-object)

# ErrorObject

A lightweight `Error` subclass for structured, chainable error handling in JavaScript and TypeScript. Errors that can be
both thrown and returned with built-in type guards, chainable setters, and logging.

## Installation

```bash
npm install @smbcheeky/error-object
```

```bash
yarn add @smbcheeky/error-object
```

## Why ErrorObject?

`ErrorObject` extends `Error`, so it works everywhere a regular `Error` does (`instanceof Error`, `try/catch`, etc.)
while adding structure and ergonomics:

- **Throw or return** — use whichever pattern fits your codebase
- **Type guards** — `isErrorObject()`, `ErrorObject.is()`, and `instanceof` all work for narrowing types
- **Structured properties** — `code`, `message`, `numberCode`, `details`, `domain`, `tag`, and `raw`
- **Chainable setters** — modify any property inline with `.setCode()`, `.setMessage()`, etc.
- **Setters accept transforms** — pass a function to access the current value while modifying it
- **Built-in logging** — `.log(tag)` and `.debugLog(tag)` for inline logging
- **Subclass-friendly** — works correctly with `extends ErrorObject`

## Quick Start

```typescript
import { ErrorObject, isErrorObject, ResultObject, ErrorObjectParams } from "@smbcheeky/error-object";

// Create an error
const error = new ErrorObject({
  code: "auth/invalid-token",
  message: "Your session has expired.",
  domain: "auth",
});

// Chain setters and log inline
error
.setDetails("Please sign in again.")
.setNumberCode(401)
.debugLog("AUTH");

// [AUTH] Your session has expired. [auth/invalid-token]
// [DEBUG] { "code": "auth/invalid-token", "numberCode": 401, ... }
```

## Creating Errors

```typescript
// From explicit properties
new ErrorObject({ code: "not-found", message: "User not found." });

// Generic error (uses configurable defaults)
ErrorObject.generic();

// Generic error with a tag
ErrorObject.withTag("network-timeout");

// Clone an existing error
existingError.clone();
// .new() also works but is deprecated in favor of .clone()
```

## Type Guards

All three approaches narrow the type correctly in TypeScript:

```typescript
const result: { success: true } | ErrorObject = someFn();

// Option 1: standalone function
if (isErrorObject(result)) {
  result.code; // TypeScript knows this is ErrorObject
  return;
}

// Option 2: static method
if (ErrorObject.is(result)) {
  result.code;
  return;
}

// Option 3: instanceof
if (result instanceof ErrorObject) {
  result.code;
  return;
}

result; // TypeScript knows this is { success: true }
```

## Chainable Setters

Every setter returns `this`, so you can chain them. Each setter accepts either a value or a transform function:

```typescript
ErrorObject.generic()
.setCode("upload/too-large")
.setMessage("File exceeds the size limit.")
.setDomain("storage")
.setNumberCode(413)
.setDetails("Maximum file size is 10MB.")
.setTag("upload-validation")
.setRaw(originalError);

// Transform function — access the current value
error.setMessage((old) => `${old} Please try again.`);
```

## Properties

| Property     | Type     | Required | Description                                          |
|--------------|----------|----------|------------------------------------------------------|
| `code`       | `string` | Yes      | Identifier for the error, ideally human-readable     |
| `message`    | `string` | Yes      | Primary error message                                |
| `numberCode` | `number` | No       | Numeric code (e.g. HTTP status)                      |
| `details`    | `string` | No       | Extended description, suitable for showing to users  |
| `domain`     | `string` | No       | Category grouping (e.g. `"auth"`, `"storage"`)       |
| `tag`        | `string` | No       | Finer-grained label for filtering or identification  |
| `raw`        | `any`    | No       | Original error or payload used to create this object |

The constructor accepts an `ErrorObjectParams` object, which is exported for use in wrapper functions and utilities.

## Logging

`.log(tag)` outputs `toString()`, `.debugLog(tag)` outputs `toDebugString()` which includes a full JSON dump:

```typescript
new ErrorObject({ code: "timeout", message: "Request timed out.", domain: "api" })
.log("NET")
.debugLog("NET");

// [NET] Request timed out. [api/timeout]
// [NET] Request timed out. [api/timeout]
// [DEBUG] { "code": "timeout", "message": "Request timed out.", "domain": "api" }
```

Both methods return `this` so they can be chained inline.

## Tag Checks

```typescript
const error = ErrorObject.generic();

error.isGeneric();   // true — checks if tag matches GENERIC_TAG
error.hasTag();      // true — checks if any tag is set
error.hasTag("foo"); // false — checks for a specific tag
```

## Serialization

`.toJSON()` returns a clean object with only ErrorObject properties (no inherited `Error` fields or internal discriminators):

```typescript
const error = new ErrorObject({ code: "not-found", message: "User not found.", domain: "users" });
JSON.stringify(error);
// {"code":"not-found","message":"User not found.","domain":"users"}
```

## String Output

`.toString()` produces a clean, user-facing string. `.toDebugString()` appends a full JSON dump prefixed with `[DEBUG]`. What `.toString()` includes is configurable:

```typescript
ErrorObject.INCLUDE_CODE_IN_STRING = true;   // default
ErrorObject.INCLUDE_DOMAIN_IN_STRING = false; // default

new ErrorObject({ code: "not-found", message: "User not found.", domain: "users" }).toString();
// "User not found. [not-found]"

ErrorObject.INCLUDE_DOMAIN_IN_STRING = true;
// "User not found. [users/not-found]"
```

## Static Configuration

Override these static properties to customize defaults across your app:

```typescript
// Change the generic error defaults
ErrorObject.GENERIC_CODE = "error";
ErrorObject.GENERIC_MESSAGE = "An unexpected error occurred";
ErrorObject.GENERIC_TAG = "generic-error-object";

// Control what toString() includes
ErrorObject.INCLUDE_CODE_IN_STRING = true;
ErrorObject.INCLUDE_DOMAIN_IN_STRING = false;

// Replace the log method (default is console.log)
ErrorObject.LOG_METHOD = myLogger.error;

// Disable logging entirely
ErrorObject.LOG_METHOD = null;
```

## Subclassing

`ErrorObject` is designed to be extended. `instanceof` checks work correctly for derived classes:

```typescript
class ApiError extends ErrorObject {
}

const err = new ApiError({ code: "500", message: "Internal server error" });
err instanceof ApiError;     // true
err instanceof ErrorObject;  // true
err instanceof Error;        // true
```

## ResultObject

`ResultObject<T>` wraps either a success value or an `ErrorObject`, giving you a type-safe way to return errors instead of throwing them:

```typescript
import { ResultObject, ErrorObject } from "@smbcheeky/error-object";

function getUser(id: string): ResultObject<User> {
  if (!id) return ResultObject.err(new ErrorObject({ code: "invalid-id", message: "Missing ID" }));
  return ResultObject.ok({ name: "Alice" });
}

const result = getUser("123");

if (result.isOk()) {
  result.data;  // User — TypeScript narrows the type
}

if (result.isErr()) {
  result.error; // ErrorObject
}
```

### Guards

All guards narrow the type correctly in TypeScript:

| Method       | Narrows to                               |
|--------------|------------------------------------------|
| `.isOk()`    | `{ data: T; error: undefined }`          |
| `.hasData()` | same as `.isOk()`                        |
| `.isData()`  | same as `.isOk()`                        |
| `.isErr()`   | `{ data: undefined; error: ErrorObject }` |
| `.isError()` | same as `.isErr()`                       |

## Parsing Errors from Any Payload

To create an `ErrorObject` from API responses, caught exceptions, or other unknown payloads,
see [@smbcheeky/error-object-from-payload](https://github.com/SMBCheeky/error-object-from-payload).

## More Examples

See the [playground](https://github.com/SMBCheeky/error-object/blob/main/playground/index.ts) for runnable examples.
