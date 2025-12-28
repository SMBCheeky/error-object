import { ErrorObject } from '@smbcheeky/error-object';

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

console.log('\n\n\n\n\n\n');

runSanityChecks();
