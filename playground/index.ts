import { addPrefixPathVariants, ErrorObject, ErrorObjectTransformState } from '@smbcheeky/error-object';

/*
 *
 * If you reached this file, you probably didn't read the README.md file.
 * Just take 30 seconds and at least read this part.
 *
 * - use both `new ErrorObject() and `ErrorObject.from()` in your codebase, as they are both useful.
 * - wrap everything with and `ErrorObject.from()` call, and don't forget to use both `error` and `force` properties.
 * - use `.log(<TAG>)` and `.debugLog(<TAG>)` to log the error object inline and make it traceable with a unique tag.
 * - use checks like .isGeneric() and .isFallback() to check if the error object is a generic or fallback error.
 *
 * P.S. The examples below are written in with a naive approach, use them as reference and inspiration for your own solutions.
 *
 * Have a bit of fun, as error handling is not hard... just cheeky.
 * SMBCheeky
 *
 */

const runStoryExample = () => {
  console.log(
    '\n-Story Example------------------------------------------------------------------------------\n',
  );

  // {
  //     'errors': [
  //       {
  //         'message': 'Cannot query field "username" on type "User"',
  //         'locations': [
  //           {
  //             'line': 2,
  //             'column': 3,
  //           },
  //         ],
  //         'extensions': {
  //           'code': 'GRAPHQL_VALIDATION_FAILED',
  //         },
  //       },
  //     ],
  //     'data': null,
  //   }
  //
  // Here are a couple of easy steps to map out a new error object:
  // 1. Before you start, check the result of `ErrorObject.from(object)?.error?.log('LOG')` and see
  //    what it returns. This will help you understand if you need to make any adjustments.
  //      - It seems there is no log "[LOG]" in the console, so we continue with the next step.
  //
  // 2. Continue with `ErrorObject.from(object)?.force?.verboseLog('LOG')` and see what it returns.
  //  "processingErrors": [
  //     {
  //       "errorCode": "unknownCodeOrMessage",
  //       "summary": {
  //         "didDetectErrorsArray": true,
  //         "input": {
  //           "message": "Cannot query field \"username\" on type \"User\"",
  //           "locations": [
  //             {
  //               "line": 2,
  //               "column": 3
  //             }
  //           ],
  //           "extensions": {
  //             "code": "GRAPHQL_VALIDATION_FAILED"
  //           }
  //         },
  //         "path": "errors",
  //         "value": {
  //           "message": {
  //             "path": "message",
  //             "beforeTransform": "Cannot query field \"username\" on type \"User\"",
  //             "value": "Cannot query field \"username\" on type \"User\""
  //           }
  //         }
  //       }
  //     }
  //   ],
  //
  // 3. Observe the processingErrors object, returned by .debugLog(). You can see that the error object
  //    was able to find the error message, but couldn't find the code. But something seems weird.
  //    I can see `didDetectErrorsArray` is true and a `errorCode`
  //    of type `ErrorObjectErrorResult`. The error code is a string that describes the error that
  //    occurred during processing. In this case, it's `unknownCodeOrMessage`.
  //      - Looking at the object, we can see that our error is
  //      actually an array of errors of length 1 - meaning we could have multiple errors in the array.
  //
  // 4. Ok, so I have a choice to make... set pathToErrors to empty, and then
  //    map only the first error... Or, adjust the paths to be relative to the objects inside the
  //    detected errors array. Let's try and respect the library's design principles and recommendation
  //    and go with the second option :)
  //      - Setting the options to { pathToCode: ['extensions.code'], pathToMessage: ['message'], }
  //
  // 5. Now let's see:
  //  [1] Cannot query field "username" on type "User" [GRAPHQL_VALIDATION_FAILED]
  //  {
  //    "code": "GRAPHQL_VALIDATION_FAILED",
  //    "message": "Cannot query field \"username\" on type \"User\""
  //  }
  //
  // 6. Awesome, that's what we wanted. But what about the other information in the error object, like
  //    the `locations' field... it seems important. Let's try to save it as well.
  //      - Adding to options { ...options, pathToDetails: ['locations'] }
  //
  // 7. Now let's see:
  //  [1] Cannot query field "username" on type "User" [GRAPHQL_VALIDATION_FAILED]
  //  {
  //    "code": "GRAPHQL_VALIDATION_FAILED",
  //    "message": "Cannot query field \"username\" on type \"User\"",
  //    "details": "[{\"line\":2,\"column\":3}]"
  //  }
  // 8. That's better, but we can do better. Working with a few APIs, I can also see a `data` === null field.
  //    Now... I don't think I should save it, but what if the errors that are returned from the backend are
  //    supposed to be treated as warnings when data is not null? Always check with your API docs and your
  //    backend developer about this, as it should not be a guessing game.
  //
  // 9. 13 hours later... I was right! Now let's make sure we don't parse errors when data is not null. If we
  //    check the `ErrorObjectBuildOptions` we can see 3 options: `checkInputObjectForValues`, `checkInputObjectForTypes`
  //    and `checkInputObjectForKeys`. We can use `checkInputObjectForValues` to check if the `data` field is
  //    null, and if so.
  //      - Adding to options { ...options, checkInputObjectForValues: { data: { value: null, exists: true } } }
  //
  // 10. Nice! Now everything is set up and my error will only be parsed when data field is null. While the logic
  //     for it works, It seems odd that data object can influence the parsing of the error object. I'm not sure
  //     if this is a good practice... I know, I'll ask my backend developer to add an 'error: true' value so that
  //     I can know for sure if the response is an error or not.
  //      - He updated the backend! Now I can replace use the `error: true` value to know if the response is an error or not
  //      - Updating options { ...options, checkInputObjectForValues: { error: { value: true, exists: true } } }
  //
  // 11. Ok now I'm done right? Hmm, I want to know if my code will work with more errors
  //      - Added another error and everything works!
  //      - I think now I can also turn off the verbose logs :)
  //
  // 12. Output:
  //  [LOG][1] Cannot query field "username" on type "User" [GRAPHQL_VALIDATION_FAILED]
  //  {
  //    "code": "GRAPHQL_VALIDATION_FAILED",
  //    "message": "Cannot query field \"username\" on type \"User\"",
  //    "details": "[{\"line\":2,\"column\":3}]"
  //  }
  //  [LOG][2] Cannot query field "email" on type "User" [GRAPHQL_VALIDATION_FAILED]
  //  {
  //    "code": "GRAPHQL_VALIDATION_FAILED",
  //    "message": "Cannot query field \"email\" on type \"User\"",
  //    "details": "[{\"line\":5,\"column\":6}]"
  //  }
  //
  // 12. Stand-up and marvel at the code that should've taken 5 minutes at most to complete and instead took 2 days :/
  //     - I'm pretty sure next time we'll both do better ;)

  ErrorObject.from(
    {
      error: true, // added after speaking to the backend developer
      errors: [
        {
          message: 'Cannot query field "username" on type "User"',
          locations: [
            {
              line: 2,
              column: 3,
            },
          ],
          extensions: {
            code: 'GRAPHQL_VALIDATION_FAILED',
          },
        },
        // added another error object
        {
          message: 'Cannot query field "email" on type "User"',
          locations: [
            {
              line: 5,
              column: 6,
            },
          ],
          extensions: {
            code: 'GRAPHQL_VALIDATION_FAILED',
          },
        },
      ],
      data: null,
    },
    {
      pathToCode: ['extensions.code'], // changed to relative path to the error object in the array of errors
      pathToMessage: ['message'], // changed to relative path to the error object in the array of errors
      pathToDetails: ['locations'], // mapping locations to error object details, so that we can reference it later
      checkInputObjectForValues: { error: { value: true, exists: true } }, // updated from { data: { value: null, exists: true } }
    },
  )?.force?.debugLog('LOG'); // switched from verboseLog to log, after we finished debugging

  // Story Example output:
  // [LOG][1] Cannot query field "username" on type "User" [GRAPHQL_VALIDATION_FAILED]
  // {
  //   "code": "GRAPHQL_VALIDATION_FAILED",
  //   "message": "Cannot query field \"username\" on type \"User\"",
  //   "details": "[{\"line\":2,\"column\":3}]"
  // }
  // [LOG][2] Cannot query field "email" on type "User" [GRAPHQL_VALIDATION_FAILED]
  // {
  //   "code": "GRAPHQL_VALIDATION_FAILED",
  //   "message": "Cannot query field \"email\" on type \"User\"",
  //   "details": "[{\"line\":5,\"column\":6}]"
  // }
};

const runSanityChecks = () => {
  console.log(
    '-Sanity checks------------------------------------------------------------------------------\n',
  );

  const error = new Error('regular error');
  const errorObject = ErrorObject.generic();
  console.log(
    errorObject instanceof ErrorObject,
    'errorObject instanceof ErrorObject',
  );
  console.log(errorObject instanceof Error, 'errorObject instanceof Error');
  console.log(error instanceof ErrorObject, 'error instanceof ErrorObject');
  console.log(error instanceof Error, 'error instanceof Error');

  // Sanity check output:
  //
  // true errorObject instanceof ErrorObject
  // true errorObject instanceof Error
  // false error instanceof ErrorObject
  // true error instanceof Error
};

const runExample1 = () => {
  console.log(
    '\n-Example 1------------------------------------------------------------------------------\n',
  );

  // I encourage you to map out the error codes and messaged from your 3rd party dependencies or APIs.
  // This allows you to, at any moment in time, output a more human-readable error message.

  // Here is an example where I create an object with error codes as keys and error messages as values.
  // Notice the error codes are unique and maybe more importantly, they are human-readable
  // and easy to understand by non-technical people, your end-users.
  const ErrorObjectMessage1 = {
    generic: 'Something went wrong',
    'generic-again': 'Something went wrong. Please try again.',
    'generic-network':
      'Something went wrong. Please check your internet connection and try again.',
  } as const;

  type ErrorObjectCode1 = keyof typeof ErrorObjectMessage1;

  ErrorObject.from(
    { code: 'generic-again' },
    {
      transform: (beforeTransform) =>
        ({
          ...beforeTransform, message: beforeTransform.code
                                       ? ErrorObjectMessage1?.[beforeTransform.code as ErrorObjectCode1] ??
                                         'Something went wrong.'
                                       : 'Invalid error found.',
        }),
    },
  )
  ?.error?.setDomain?.('update')
  .verboseLog('1');

  // Example 1 output:
  //
  // [1] Something went wrong. Please try again. [update/generic-again]
  // {
  //   "code": "generic-again",
  //   "message": "Something went wrong. Please try again.",
  //   "domain": "update"
  // }
  // {
  //   "processingErrors": [],
  //   "summary": {
  //     "input": {
  //       "code": "generic-again"
  //     },
  //     "value": {
  //       "code": {
  //         "path": "code",
  //         "beforeTransform": "generic-again",
  //         "value": "generic-again"
  //       },
  //       "message": {
  //         "value": "Something went wrong. Please try again."
  //       },
  //     }
  //   },
  //   "raw": {
  //     "code": "generic-again"
  //   }
  // }
};

const runExample2 = () => {
  console.log(
    '\n-Example 2------------------------------------------------------------------------------\n',
  );

  // As opposed to the previous example, this one uses a simple switch statement to resolve the
  // error message from the code.
  // Both have their pros and cons, but this version is much more straightforward and readable
  // for all levels of developers.
  // You could have a file called `errors.ts` in each of your modules/folders and define a function
  // like `createAuthError2()` that returns an error object with the correct message and domain.
  const AuthMessageResolver = (
    beforeTransform: ErrorObjectTransformState,
  ): ErrorObjectTransformState => {
    // Quick tip: Make all messages slightly different to make it easier to find the right one when debugging
    let message: string | undefined;
    switch (beforeTransform.code) {
      case 'generic':
        message = 'Something went wrong';
        break;
      case 'generic-again':
        message = 'Something went wrong. Please try again.';
        break;
      case 'generic-network':
        message = 'Something went wrong. Please check your internet connection and try again.';
        break;
      default:
        message = 'Something went wrong.';
    }
    return { ...beforeTransform, message };
  };

  const createAuthError2 = (code: string) => {
    return ErrorObject.from(
      {
        code,
        domain: 'auth',
      },
      {
        transform: AuthMessageResolver,
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
};

const runExample3 = () => {
  console.log(
    '\n-Example 3------------------------------------------------------------------------------\n',
  );

  const rawPaths = ['context.reason'];
  const pathToCode = addPrefixPathVariants('error', ['context.reason']);
  console.log(
    'The method addPrefixPathVariants helps generate possible paths from',
    rawPaths,
  );
  console.log('into the final list of paths', pathToCode, '\n');

  ErrorObject.from(
    {
      code: 'declined',
      error: {
        message:
          'Please make sure your battery charge is above 75% before proceeding.',
        context: {
          reason: 'battery-low',
        },
      },
    },
    {
      pathToCode,
    },
  )
  ?.error?.setDomain('update-software')
  .verboseLog('');

  // Example 3 output:
  //
  // The method addPrefixPathVariants helps generate possible paths from [ 'context.reason' ]
  // into the final list of paths [ 'context.reason', 'error.context.reason' ]
  //
  // [] Please make sure your battery charge is above 75% before proceeding. [update-software/battery-low]
  // {
  //   "code": "battery-low",
  //   "message": "Please make sure your battery charge is above 75% before proceeding.",
  //   "domain": "update-software"
  // }
  // {
  //   "processingErrors": [],
  //   "summary": {
  //     "input": {
  //       "code": "declined",
  //       "error": {
  //         "message": "Please make sure your battery charge is above 75% before proceeding.",
  //         "context": {
  //           "reason": "battery-low"
  //         }
  //       }
  //     },
  //     "value": {
  //       "code": {
  //         "path": "error.context.reason",
  //         "beforeTransform": "battery-low",
  //         "value": "battery-low"
  //       },
  //       "message": {
  //         "path": "error.message",
  //         "beforeTransform": "Please make sure your battery charge is above 75% before proceeding.",
  //         "value": "Please make sure your battery charge is above 75% before proceeding."
  //       },
  //     }
  //   },
  //   "raw": {
  //     "code": "declined",
  //     "error": {
  //       "message": "Please make sure your battery charge is above 75% before proceeding.",
  //       "context": {
  //         "reason": "battery-low"
  //       }
  //     }
  //   }
  // }
};

const runExample4 = () => {
  console.log(
    '\n-Example 4------------------------------------------------------------------------------\n',
  );

  ErrorObject.from(
    {
      error: {
        message: 'battery-low',
        code: 'Internal Server Error', // Really backend?
      },
    },
    {
      transform: (beforeTransform) => {
        let message: string | undefined;
        switch (beforeTransform.code) {
          case 'battery-low':
            message = 'Please make sure your battery charge is above 75% before proceeding.';
        }
        return {
          ...beforeTransform,
          message: message ?? 'Invalid status code. Please make sure your device is up to date and charged.',
        };
      },
      pathToCode: ['error.message'],
      pathToDomain: ['error.code'],
    },
  )
  ?.error?.setDomain?.('update')
  .debugLog('?');

  // Example 4 output:
  //
  // [?] Please make sure your battery charge is above 75% before proceeding. [update/battery-low]
  // {
  //   "code": "battery-low",
  //   "message": "Please make sure your battery charge is above 75% before proceeding.",
  //   "domain": "update"
  // }
};

const runExample5 = () => {
  console.log(
    '\n-Example 5------------------------------------------------------------------------------\n',
  );

  // Recommended approach, very simple and to the point
  ErrorObject.from(
    {
      status: 'error',
      message: 'Validation failed',
      data: {
        username: 'Username is required',
        email: 'Email is required',
        password: 'Password is required',
        confirmPassword: 'Confirm password is required',
      },
    },
    {
      pathToCode: ['message'],
      pathToMessage: [
        'data.username',
        'data.email',
        'data.password',
        'data.confirmPassword',
      ],
      checkInputObjectForValues: { status: { value: 'error', exists: true } },
    },
  )?.force?.debugLog('1');

  // Second approach, possible, but very involved
  ErrorObject.from(
    {
      status: 'error',
      message: 'Validation failed',
      data: {
        username: 'Username is required',
        email: 'Email is required',
        password: 'Password is required',
        confirmPassword: 'Confirm password is required',
      },
    },
    {
      pathToCode: ['message'],
      pathToMessage: ['data'],
      transform: (beforeTransform) => {
        let message = beforeTransform.message;
        try {
          const data = message && JSON.parse(message);
          const list =
            data && typeof data === 'object'
            ? Object.values(data)
            .map((t) => t?.toString())
            .filter((t) => t)
            : [];
          message = list?.[0] ?? message;
        }
        catch (error) {
          console.log(ErrorObject.from(error)?.force?.debugLog('PARSE1'));
        }
        // I choose to say something went wrong here instead of sending back an unknown value
        return {
          ...beforeTransform,
          message: message ?? 'Something went wrong during sign up. Please try again later.',
        };
      },
      checkInputObjectForValues: { status: { value: 'error', exists: true } },
    },
  )?.force?.debugLog('2');

  // or another way to write the above
  ErrorObject.from(
    {
      status: 'error',
      message: 'Validation failed',
      data: {
        username: 'Username is required',
        email: 'Email is required',
        password: 'Password is required',
        confirmPassword: 'Confirm password is required',
      },
    },
    {
      checkInputObjectForValues: {
        status: { value: 'error', exists: true },
      },
      checkInputObjectForTypes: {
        data: { type: 'object', valueIsArray: false, exists: true },
      },
      pathToCode: ['message'],
      pathToMessage: ['data'],
    },
  )
  .force?.setMessage((old) => {
    try {
      return Object.values(JSON.parse(old))?.[0]?.toString() ?? old;
    }
    catch (error) {
      console.log(ErrorObject.from(error)?.force?.debugLog('PARSE1'));
    }
    return old;
  })
  .debugLog('3'); // ?.force?.verboseLog('LOG');

  // I could probably make this easier on you, but this is where the end of the library lies.
  // When dynamic fields are involved it is your job to decide how to handle them.
  // This library won't do black magic, by design, but it can hide a lot of things in plain sight :)

  // Story Example output:
  // [1] Username is required [Validation failed]
  // {
  //   "code": "Validation failed",
  //   "message": "Username is required"
  // }
  // [2] Username is required [Validation failed]
  // {
  //   "code": "Validation failed",
  //   "message": "Username is required"
  // }
  // [3] Username is required [Validation failed]
  // {
  //   "code": "Validation failed",
  //   "message": "Username is required"
  // }
};

const runExample6 = () => {
  console.log(
    '\n-Example 6------------------------------------------------------------------------------\n',
  );

  try {
    const response = {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{"error":"Invalid input data","code":400}',
    };

    // First approach is to feed only the body to the error object builder - simple, elegant, recommended
    ErrorObject.from(JSON.parse(response?.body), {
      pathToNumberCode: ['code'],
      pathToMessage: ['error'],
    }).force?.debugLog('LOG');

    // Second approach is to use a transform function to parse the body
    // You can access both the input object, or you can use the fact that the library stringifies the value found at any path, if it's an object/array.
    ErrorObject.from(response, {
      pathToMessage: ['body'],
      transform: (beforeTransform, inputObject): ErrorObjectTransformState => {
        let numberCode = beforeTransform.numberCode;
        let code = beforeTransform.code;

        if (
          numberCode === undefined ||
          numberCode === null ||
          typeof numberCode !== 'number' ||
          isNaN(numberCode)
        ) {
          try {
            const possibleNumberCode = JSON.parse(inputObject?.body)?.code;
            if (
              possibleNumberCode !== undefined &&
              possibleNumberCode !== null &&
              typeof possibleNumberCode === 'number' &&
              !isNaN(possibleNumberCode)
            ) {
              numberCode = possibleNumberCode;
              code = possibleNumberCode.toString();
            }
          }
          catch {
            // We tried :)
          }
        }
        let message = beforeTransform.message;
        if (message) {
          const possibleMessage = JSON.parse(message)?.error;
          if (
            possibleMessage !== undefined &&
            possibleMessage !== null &&
            typeof possibleMessage === 'string'
          ) {
            message = possibleMessage;
          }
        }
        return {
          ...beforeTransform,
          numberCode,
          code,
          message,
        };
      },
    }).force?.debugLog('LOG');

    // Now, which one do you prefer :) ?
  }
  catch (error) {

    new ErrorObject({
      code: 'invalid-data',
      message: 'Server response is invalid. Please try again.',
    }).log('PARSER');
  }

  // Example 6 output:
  //
  // [LOG] Invalid input data [400]
  // {
  //   "code": "400",
  //   "numberCode": 400,
  //   "message": "Invalid input data"
  // }
  // [LOG] Invalid input data [400]
  // {
  //   "code": "400",
  //   "numberCode": 400,
  //   "message": "Invalid input data"
  // }
};

const runExample7 = () => {
  console.log(
    '\n-Example 7------------------------------------------------------------------------------\n',
  );

  ErrorObject.from(
    {
      'error': {
        'code': 'auth/invalid-email',
        'message': 'The email address is badly formatted.',
        'errors': [],
      },
    })
  .force?.debugLog('LOG');

  // Now what if the errors looked like this?
  // How will you parse it? Simple... use `pathToErrors` - you will have access to all 3 errorObjects via .nextErrors property.
  ErrorObject.from(
    {
      'error': {
        'code': 'auth/invalid-email',
        'message': 'The email address is badly formatted.',
        'errors': [{
          'code': 'auth/invalid-email',
          'message': 'The email address is badly formatted.',
        }, {
          'code': 'auth/invalid-phone number',
          'message': 'The phone number is invalid.',
        }, {
          'code': 'unauthorized',
          'message': 'Access unauthorized.',
        },
        ],
      },
    }, {
      pathToErrors: ['error.errors'],
    })
  .force?.debugLog('LOG');

  // Example 7 output:
  //
  // [LOG] The email address is badly formatted. [auth/invalid-email]
  // {
  //   "code": "auth/invalid-email",
  //   "message": "The email address is badly formatted."
  // }
  // [LOG][1] The email address is badly formatted. [auth/invalid-email]
  // {
  //   "code": "auth/invalid-email",
  //   "message": "The email address is badly formatted."
  // }
  // [LOG][2] The phone number is invalid. [auth/invalid-phone number]
  // {
  //   "code": "auth/invalid-phone number",
  //   "message": "The phone number is invalid."
  // }
  // [LOG][3] Access unauthorized. [unauthorized]
  // {
  //   "code": "unauthorized",
  //   "message": "Access unauthorized."
  // }
};

const runExample8 = () => {
  console.log(
    '\n-Example 8------------------------------------------------------------------------------\n',
  );

  ErrorObject.from({
    'title': 'Unauthorized',
    'detail': 'Invalid or expired token.',
    'type': 'https://api.twitter.com/2/problems/invalid-auth',
  }, {
    pathToCode: ['type'],
    pathToDomain: [],
    pathToDetails: ['type'],
    transform: (beforeTransform, inputObject): ErrorObjectTransformState => {
      const type = inputObject?.type && typeof inputObject?.type === 'string' ? inputObject?.type : undefined;
      const parts = type?.split('/');

      return {
        ...beforeTransform,
        code: parts?.[parts.length - 1] ?? beforeTransform.code,
        message: inputObject?.title?.length > 0 && inputObject?.detail?.length > 0
                 ? `${inputObject?.title} - ${inputObject?.detail}`
                 : inputObject?.title?.length > 0 ? inputObject?.title : inputObject?.detail,
      };
    },
  }).force?.debugLog('LOG');

  // Example 8 output:
  //
  // [LOG] Unauthorized - Invalid or expired token. [invalid-auth]
  // {
  //   "code": "invalid-auth",
  //   "message": "Unauthorized - Invalid or expired token.",
  //   "details": "https://api.twitter.com/2/problems/invalid-auth"
  // }
};

const runExample9 = () => {
  console.log(
    '\n-Example 9------------------------------------------------------------------------------\n',
  );

  ErrorObject.from({
    'message': 'The given data was invalid.',
    'errors': {
      'email': [
        'The email field is required.',
        'The email must be a valid email address.',
      ],
      'password': ['The password field is required.'],
    },
  }, {
    transform: (beforeTransform) => ({ ...beforeTransform, code: 'invalid-data' }),
    pathToMessage: ['errors.email.0', 'errors.password.0'],
  })?.force?.debugLog('LOG');

  // or maybe

  ErrorObject.from({
    'message': 'The given data was invalid.',
    'errors': {
      'email': [
        'The email field is required.',
        'The email must be a valid email address.',
      ],
      'password': ['The password field is required.'],
    },
  }, {
    pathToDetails: ['errors'],
    transform: (beforeTransform) => ({ ...beforeTransform, code: 'invalid-data' }),
  })?.force?.debugLog('LOG');

  // As I wrote before, the library does not do black magic. You can easily write a reducer to get all the values
  // in email and then merge it with the password values. And you don't need to open an Issue on GitHub to ask why
  // your code, unrelated to this library, doesn't work right? :)

  // Example 9 output:
  //
  // [LOG] The email field is required. [invalid-data]
  // {
  //   "code": "invalid-data",
  //   "message": "The email field is required."
  // }
  // [LOG] The given data was invalid. [invalid-data]
  // {
  //   "code": "invalid-data",
  //   "message": "The given data was invalid.",
  //   "details": "{\"email\":[\"The email field is required.\",\"The email must be a valid email address.\"],\"password\":[\"The password field is required.\"]}"
  // }
};

const runExample10 = () => {
  console.log(
    '\n-Example 10------------------------------------------------------------------------------\n',
  );

  // Fun fact: This example was 100% written by AI. This means that once you write 2-3 examples, it will be able to
  // write the next one without any help from you...
  // On a serious note: Please triple check the AI output...
  ErrorObject.from({
    'kind': 'AdmissionReview',
    'apiVersion': 'admission.k8s.io/v1',
    'response': {
      'uid': '12345',
      'allowed': false,
      'status': {
        'code': 403,
        'message': 'Admission webhook denied the request due to policy violation.',
      },
    },
  }, {
    pathToCode: ['response.status.code'],
    pathToMessage: ['response.status.message'],
    transform: (beforeTransform, inputObject): ErrorObjectTransformState => {
      return {
        ...beforeTransform,
        code: inputObject?.kind?.length > 0 && inputObject?.apiVersion?.length > 0
              ? `${inputObject?.kind}/${inputObject?.apiVersion}`
              : inputObject?.kind?.length > 0 ? inputObject?.kind : inputObject?.apiVersion,
      };
    },
  }).force?.debugLog('LOG');

  // Example 10 AI output:
  //
  // [LOG] AdmissionReview/admission.k8s.io [403]
  // {
  //   "code": "403",
  //   "message": "Admission webhook denied the request due to policy violation."
  // }

  // Example 10 actual output:
  //
  // [LOG] Admission webhook denied the request due to policy violation. [AdmissionReview/admission.k8s.io/v1]
  // {
  //   "code": "AdmissionReview/admission.k8s.io/v1",
  //   "message": "Admission webhook denied the request due to policy violation."
  // }
};

const runExample11 = () => {
  console.log(
    '\n-Example 11------------------------------------------------------------------------------\n',
  );

  // Even if the library detects an array of errors, if there are not more than 1 error, it will return as if it was a single error.
  ErrorObject.from({
    'response': {
      'data': {
        'message': 'Not Found',
        'errors': [
          {
            'message': 'User not found',
            'code': 'USER_NOT_FOUND',
          },
        ],
      },
      'status': 404,
      'statusText': 'Not Found',
    },
  }, { pathToErrors: ['response.data.errors'] }).force?.debugLog('LOG');

  // Example 11 output:
  //
  // [LOG] User not found [USER_NOT_FOUND]
  // {
  //   "code": "USER_NOT_FOUND",
  //   "message": "User not found"
  // }
};

const runExample12 = () => {
  console.log(
    '\n-Example 12------------------------------------------------------------------------------\n',
  );

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
  // [LOG] Something went wrong [auth]
  // {
  //   "code": "",
  //   "message": "Something went wrong",
  //   "domain": "auth"
  // }
};

console.log('\n\n\n\n\n\n');

// runStoryExample();
// runSanityChecks();
// runExample1();
// runExample2();
// runExample3();
// runExample4();
// runExample5();
// runExample6();
// runExample7();
// runExample8();
// runExample9();
// runExample10();
// runExample11();
runExample12();