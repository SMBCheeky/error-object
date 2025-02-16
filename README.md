## TL;DR

- Install the package `npm install @smbcheeky/error-object`
- Write `ErrorObject.from(<pick an api response with an error>).force?.verboseLog('LOG')`
- :tada:
- oh... and check the [playground](https://github.com/SMBCheeky/error-object/blob/main/playground/index.ts) file

## Opening words from SMBCheeky

The ErrorObject class was created to help developers deal with errors in a consistent and predictable way. Along the
years, and across tens of projects, it has gathered quite a few features, and it was time to share it with the world.

I've been maintaining some version of this library and/or its principles on every project I worked on in the past 10
years, across multiple languages and frameworks. But it has always been a copy-paste-modify-test-again cycle, and I am
tired :) I took a few days to write this package... then re-write it... then refactor it... then delete 80%... then
repeat everything 2 more times.

You may not like what I've shared here, but I think it's a good conversation starter.

I hope you find this library useful, and I'm looking forward to hearing your feedback.

## Installation

`npm install @smbcheeky/error-object`

`yarn add @smbcheeky/error-object`

## Compatibility

It should work with any modern Javascript or Typescript project. Let me know if I can do anything to improve the
compatibility even more. PRs are welcome.

## *Short* description

Pick a backend endpoint error response, a 3rd party library error response, or even an error and write this one line of
code:

```typescript
ErrorObject.from(response).force?.verboseLog('LOG')
```

-> you will have a smile on your face, but you may not understand what just happened.

Let's break it down:

- The ErrorObject class is made to extend `Error` enabling checks like `errorObject instanceof Error` or
  `errorObject instanceof ErrorObject`.
- It can be thrown or returned, you choose.
- `new ErrorObject()` still works as an Error object, but it has a few more features.
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
- It can be used to create errors from anything, using `ErrorObject.from(<anything>)`, which will return an
  `ErrorObject` instance, but there are a few things to know before starting:
    - you can pass an object or a caught error to it, and it will try its best to create an error from it
    - `ErrorObject.from(<anything>)` returns an object with two properties: `.error` and `.force`
    - `.error` represents the error, if it can be created, otherwise it is `undefined`
    - `.force` represents the error, if it can be created, otherwise it is going to return a `ErrorObject.fallback()`
      error
    - the processing of the ErrorObject is done in a few steps, based on the `ErrorObjectBuildOptions`:
        - first the initial object is checked via the options `checkInputObjectForValues` and `checkInputObjectForTypes`
          and `checkInputObjectForKeys`
        - then the objects checks for an object array at `pathToErrors`, which could be an array of errors
        - if an error array is found, the process will consider all other paths relative to the objects in the error
          array found
        - if an error array is not found, the process will consider all other paths absolute to the initial object
          passed to `ErrorObject.from()`
        - the `pathToCode`, `pathToNumberCode`, `pathToMessage`, `pathToDetails` and `pathToDomain` options are used to
          map values to their associated field, if found
        - for all fields other than `numberCode`, if a value is found and is a string, it is saved as is, but if it is
          an array or an object it will be JSON.stringify'ed and saved as a string
        - for `numberCode`, if a value is found and it is a number different than `NaN`, it is saved
        - the `transformCode`, `transformNumberCode`, `transformMessage`, `transformDetails` and `transformDomain`
          functions are used to transform the found values to the error object
        - the transform functions have access to each respective value, all other values, and the initial object (object
          inside the errors array or initial object)
        - everything gets processed into a list of `ErrorSummary | ErrorObjectErrorResult` array
        - it contains everything, from error strings custom-made to be as distinct and easy to read as possible, to self
          documenting summaries of what values are found, at which path, if an errors object was found, etc.
        - the count of the list is meant to be an indication of how many input objects were found and processed, as each
          of them should become an error object
        - in the last step of the process, the list is filtered down and a single error object is created, with
          everything baked in
        - think detailed `processingErrors` which includes the summaries and the errors that were triggered during
          the process, the `raw` object that was used as in input for the ErrorObject.from() call and the `nextErrors`
          array which allows for all errors to be saved on one single error object for later use

Now, there are a few more features that I may have missed, but I think you get the idea - It does a lot of work
so that you can focus on the task at hand - keeping the user informed on what to do when things go wrong.

## Core concepts

- The code should be simple to understand and easily patchable or extended to suit any needs
- "Provide the best defaults possible, but don't block the developer from customizing it"
- "I shall not use generics" - If the result is 50x more readable, yeah sure, maybe...
- "Name everything like there is no documentation" - Do not open PRs with refactored code for anything until you
  understand this phrase
- "Do not practice black magic" - You can hide things for a bit, make them magic... but don't make any developer's
  life harder, they still have to deal with timezones on a self-hosted mysql database, that has "TODAY" as a valid
  date... don't ask, just don't...
- "Write code that is easily debuggable so fixes are easy as well" - Just common sense, if you ask me
- "The code you write is to help the end user, not you, your boss or your client" - Maybe once you see this, you will
  tell your users what "... went wrong" :)

## Usage & Examples

For a guide on how to use the library, please check the first detailed example in
the [playground](https://github.com/SMBCheeky/error-object/blob/main/playground/index.ts) file.

Some simple examples:

```typescript
new ErrorObject({ code: '', message: 'Something went wrong.', domain: 'auth' }).debugLog('LOG');

ErrorObject.from({ code: '', message: 'Something went wrong', domain: 'auth' })?.force?.debugLog('LOG');

// Example 12 output:
// 
// [LOG] Something went wrong. [auth]
// {
//   "code": "",
//   "message": "Something went wrong.",
//   "domain": "auth"
// }
// 
// [LOG] Something went wrong [auth]
// {
//   "code": "",
//   "message": "Something went wrong",
//   "domain": "auth"
// }
```

```typescript
const response = {
  statusCode: 400,
  headers: {
    'Content-Type': 'application/json',
  },
  body: '{"error":"Invalid input data","code":400}',
};

ErrorObject.from(JSON.parse(response?.body), {
  pathToNumberCode: ['code'],
  pathToMessage: ['error'],
}).force?.debugLog('LOG');

// Example 6 output:
//
// [LOG] Invalid input data [400]
// {
//   "code": "400",
//   "numberCode": 400,
//   "message": "Invalid input data"
// }
```

```typescript
/* 
 * You could have a file called `errors.ts` in each of your modules/folders and 
 * define a function like `createAuthError2()` that returns an error object with 
 * the correct message and domain.
 */
const AuthMessageResolver = (
  message: string | undefined,
  beforeTransform: ErrorObjectBeforeTransformState): string => {
  // Quick tip: Make all messages slightly different, to make it easy
  // to find the right one when debugging, even in production
  switch (beforeTransform.code) {
    case 'generic':
      return 'Something went wrong';
    case 'generic-again':
      return 'Something went wrong. Please try again.';
    case 'generic-network':
      return 'Something went wrong. Please check your internet connection and try again.';
    default:
      return 'Something went wrong.';
  }
};

const createAuthError2 = (code: string) => {
  return ErrorObject.from(
    {
      code,
      domain: 'auth',
    },
    {
      transformMessage: AuthMessageResolver,
    },
  );
};


createAuthError2('generic')?.error?.log('1');
createAuthError2('generic-again')?.error?.log('2');
createAuthError2('generic-network')?.error?.log('3');
createAuthError2('invalid-code')?.error?.log('4');

// Example 2 output:
//
// [1] Something went wrong [auth/generic]
// [2] Something went wrong. Please try again. [auth/generic-again]
// [3] Something went wrong. Please check your internet connection and try again. [auth/generic-network]
// [4] Something went wrong. [auth/invalid-code]
```
