import { ErrorObject, isErrorObject } from "@smbcheeky/error-object";

const runSanityChecks = () => {
  console.log(
    "-Sanity checks------------------------------------------------------------------------------\n",
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

  // Sanity check output:
  //
  // true errorObject instanceof ErrorObject
  // true errorObject instanceof Error
  // false error instanceof ErrorObject
  // true error instanceof Error
};

const runTypeChecks = () => {
  console.log(
    "-Type checks------------------------------------------------------------------------------\n",
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
  // result1.code;
  console.log("result1 is not ErrorObject");

  const result2 = fooError();
  if (result2 instanceof ErrorObject) {
    result2;
    result2.code;
    console.log("result2 is ErrorObject");
    return;
  }
  result2;
  // result2.code;
  console.log("result2 is not ErrorObject");

  const result3 = foo();
  if (ErrorObject.is(result3)) {
    result3;
    result3.code;
    console.log("result3 is ErrorObject");
    return;
  }
  result3;
  // result3.code;
  console.log("result3 is not ErrorObject");
};

console.log("\n\n\n\n\n\n");

runSanityChecks();
runTypeChecks();
