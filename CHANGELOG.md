# Changelog

## 1.2.1

### Added

- Exported `ErrorObjectParams` interface for the constructor parameter type
- `clone()` method to create a copy of an existing `ErrorObject`
- `toJSON()` method for clean serialization (excludes internal discriminator and inherited `Error` fields)
- `LOG_METHOD` now accepts `null` to disable logging entirely

### Changed

- `generic()` is now a regular static method instead of an arrow function, for consistency with `withTag()`
- Simplified `toString()` — removed redundant optional chaining and nested ternaries
- `toString()` no longer suppresses code via substring match (`domain.includes(code)`), uses exact equality instead
- `toDebugString()` JSON replacer broken out for readability
- Constructor `raw` → `name`/`stack` extraction logic cleaned up with a helper function

### Deprecated

- `new()` — use `clone()` instead

## 1.2.0

### Breaking Changes

- Renamed static constants: `DEFAULT_GENERIC_CODE` → `GENERIC_CODE`, `DEFAULT_GENERIC_MESSAGE` → `GENERIC_MESSAGE`, `DEFAULT_GENERIC_TAG` → `GENERIC_TAG`
- Removed `DEFAULT_DOMAIN` — domain is no longer auto-populated from a static default
- Removed `toVerboseString()` and `verboseLog()` — use `toDebugString()` and `debugLog()` instead (debug output now includes all properties via `JSON.stringify`)

### Added

- `LOG_METHOD` static property to override the default log function (default: `console.log`)
- `INCLUDE_DOMAIN_IN_STRING` static property to control whether `toString()` includes the domain
- `INCLUDE_CODE_IN_STRING` static property to control whether `toString()` includes the code
- `_log()` is now `protected` instead of `private`, allowing subclasses to override logging behavior
