import { ErrorObject, isErrorObject } from "@smbcheeky/error-object";

const runSanityChecks = () => {
  console.log(
    "\n-Sanity checks------------------------------------------------------------------------------\n",
  );

  const error = new Error("regular error");
  const errorObject = ErrorObject.generic();
  console.log(
    errorObject instanceof ErrorObject,
    "errorObject instanceof ErrorObject",
  );
  console.log(errorObject instanceof Error, "errorObject instanceof Error");
  console.log(error instanceof ErrorObject, "error instanceof ErrorObject");
  console.log(error instanceof Error, "error instanceof Error");

  class NewError extends ErrorObject {}
  console.log(
    "ErrorObject derived classes are all ErrorObjects?",
    new NewError({ code: "test", message: "test" }) instanceof ErrorObject,
  );

  // true errorObject instanceof ErrorObject
  // true errorObject instanceof Error
  // false error instanceof ErrorObject
  // true error instanceof Error
  // ErrorObject derived classes are all ErrorObjects?
};

const runTypeChecks = () => {
  console.log(
    "\n-Type checks------------------------------------------------------------------------------\n",
  );

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

  // result1 is not ErrorObject
  // result2 is not ErrorObject
  // result3 is ErrorObject
};

const runFieldChecks = () => {
  console.log(
    "\n-Field checks------------------------------------------------------------------------------\n",
  );

  new ErrorObject({ code: "regular error", message: "Something went wrong." })
    .log("LOG1")
    .setDomain("auth")
    .setTag("tag")
    .setDetails("details")
    .debugLog("LOG2")
    .setNumberCode(123)
    .setRaw({ foo: "bar" })
    .verboseLog("LOG3");

  // [LOG1] Something went wrong. [regular error]
  // [LOG2] Something went wrong. [auth/regular error]
  // {
  //   "code": "regular error",
  //   "message": "Something went wrong.",
  //   "details": "details",
  //   "domain": "auth",
  //   "tag": "tag"
  // }
  // [LOG3] Something went wrong. [auth/regular error]
  // {
  //   "code": "regular error",
  //   "numberCode": 123,
  //   "message": "Something went wrong.",
  //   "details": "details",
  //   "domain": "auth",
  //   "tag": "tag"
  // }
  // {
  //   "foo": "bar"
  // }
};

console.log("\n\n\n\n\n\n");

runSanityChecks();
runTypeChecks();
runFieldChecks();
