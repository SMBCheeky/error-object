# Changelog

## 1.3.0

### Added

- `ResultObject<T>` class for wrapping success values or errors in a single type-safe container
  - `ResultObject.ok(data)` — create a success result
  - `ResultObject.err(error)` — create an error result
  - `.isOk()`, `.isErr()` — type-narrowing guards
  - `.hasData()`, `.isData()` — aliases for `.isOk()`
  - `.isError()` — alias for `.isErr()`
- Unit test suite with Vitest (67 tests, ~99% coverage)

## 1.2.1

### Breaking Changes

- Removed `toVerboseString()` and `verboseLog()` — use `toDebugString()` and `debugLog()` instead

### Added

- `INCLUDE_DOMAIN_IN_STRING` static property to control whether `toString()` includes the domain (default: `false`)
- `INCLUDE_CODE_IN_STRING` static property to control whether `toString()` includes the code (default: `true`)

### Changed

- `toDebugString()` now uses `JSON.stringify(this, ...)` to include all properties dynamically, prefixed with `[DEBUG]`
- `toString()` updated to respect `INCLUDE_DOMAIN_IN_STRING` and `INCLUDE_CODE_IN_STRING`

## 1.2.0

### Breaking Changes

- Renamed static constants: `DEFAULT_GENERIC_CODE` → `GENERIC_CODE`, `DEFAULT_GENERIC_MESSAGE` → `GENERIC_MESSAGE`,
  `DEFAULT_GENERIC_TAG` → `GENERIC_TAG`
- Removed `DEFAULT_DOMAIN` — domain is no longer autopopulated from a static default

### Added

- `LOG_METHOD` static property to override the default log function (default: `console.log`)

### Changed

- `_log()` is now `protected` instead of `private`, allowing subclasses to override logging behavior

## 1.1.9

### Changed

- `_log()` changed from `private` to `protected`

## 1.1.8

### Breaking Changes

- Removed `nextErrors` property and `setNextErrors()` method
- Removed multi-error logging in `_log()` (no longer iterates over `nextErrors`)

### Changed

- `toVerboseString()` simplified to `toDebugString()` + `JSON.stringify(this.raw)`
- Fixed `Object.setPrototypeOf` to use `new.target.prototype` for proper subclass `instanceof` support
- `isErrorObject()` now delegates to `ErrorObject.is()` instead of duplicating the check
- Cleaned up JSDoc comments

## 1.1.7

### Breaking Changes

- Removed `SHOW_ERROR_LOGS` static property
- Removed `fallback()` factory, `isFallback()` method, and `DEFAULT_FALLBACK_TAG`
- Removed `summary` property and `processingErrors` / `setProcessingErrors()`

### Added

- `__isErrorObjectTypeDiscriminator` readonly property for type discrimination
- `ErrorObject.is()` static type guard
- `isErrorObject()` standalone type guard function
- JSDoc for `withTag()`

### Changed

- `generic()` now uses `new this(...)` instead of `new ErrorObject(...)` for correct subclass support
- `nextErrors` type changed to `this[]`
- Code reformatted (single quotes → double quotes, indentation cleanup)

## 1.1.6

Version bump to serve as a clean dependency for `@smbcheeky/error-object-from-payload`.

## 1.1.5

### Breaking Changes

- Removed `.fromPayload()` static method and all builder/utils code — extracted
  to [@smbcheeky/error-object-from-payload](https://github.com/SMBCheeky/error-object-from-payload)
- Removed all exported utility types (`ErrorObjectBuildOptions`, `ErrorObjectProcessingError`, `ErrorSummary`, etc.)
