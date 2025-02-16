import { ErrorObject } from '../index';
import { DEFAULT_BUILD_OPTIONS, ErrorObjectBuildOptions, ErrorObjectErrorResult, ErrorSummary } from '../utils';
import { __transformAllValues } from './transformers';
import { __processAllValuesFromPaths } from './valuesFromPaths';

export const buildSummariesFromObject = (
  input: any,
  withOptions?: ErrorObjectBuildOptions,
): (ErrorSummary | ErrorObjectErrorResult)[] => {
  try {
    const options: ErrorObjectBuildOptions = withOptions ?? {
      ...DEFAULT_BUILD_OPTIONS,
    };
    if (input === undefined || input === null) {
      return ['isNullish'];
    }
    if (typeof input !== 'object') {
      return ['isNotAnObject'];
    }

    // Find an array of errors using `pathToErrors`
    let errors: any[] = [];
    let errorsPath: string | undefined;
    let didDetectErrorsArray = false;
    if ('pathToErrors' in options) {
      if (!Array.isArray(options.pathToErrors)) {
        return ['pathToErrorsIsNotAnArray'];
      }
      for (const path of options.pathToErrors) {
        if (typeof path !== 'string') {
          return ['pathToErrorsValuesAreNotStrings'];
        }
        const found = findNestedValueForPath(input, path);
        if (found && Array.isArray(found)) {
          errors = found;
          errorsPath = path;
          didDetectErrorsArray = true;
          break;
        }
      }
    }
    if (errors.length === 0) {
      errors = [input];
    }

    let summaries: (ErrorSummary | ErrorObjectErrorResult)[] = [];
    for (const errorMaybeObject of errors) {
      const summary = buildSummaryFromObject(
        errorMaybeObject,
        errorsPath,
        didDetectErrorsArray,
        options,
      );
      summaries.push(summary);
    }

    return summaries;
  }
  catch (generalError) {
    ErrorObject.SHOW_ERROR_LOGS &&
    console.log(
      '[ErrorObject]',
      'Error during buildSummariesFromObject():',
      generalError,
    );
    return ['generalBuildSummariesFromObjectError'];
  }
};

export const buildSummaryFromObject = (
  maybeObject: any,
  errorsPath: string | undefined,
  didDetectErrorsArray: boolean,
  withOptions?: ErrorObjectBuildOptions,
): ErrorSummary | ErrorObjectErrorResult => {
  try {
    const options: ErrorObjectBuildOptions = withOptions ?? {
      ...DEFAULT_BUILD_OPTIONS,
    };
    if (maybeObject === undefined || maybeObject === null) {
      return 'buildSummaryIsNullish';
    }

    let objectToParse: any;
    if (typeof maybeObject === 'string') {
      try {
        const json = JSON.parse(maybeObject);
        if (json !== undefined && json !== null && typeof json === 'object') {
          objectToParse = json;
        }
      }
      catch {
        // At least we tried :)
      }
      if (objectToParse === maybeObject) {
        objectToParse = { code: 'unknown', message: maybeObject };
      }
    }
    if (objectToParse === undefined || objectToParse === null) {
      objectToParse = maybeObject;
    }

    if (typeof objectToParse !== 'object') {
      return 'buildSummaryIsNotAnObject';
    }

    const valuesResult = __processAllValuesFromPaths(objectToParse, options);
    if (typeof valuesResult === 'string') {
      return valuesResult;
    }
    const {
      codeBeforeTransform,
      codePath,
      numberCodeBeforeTransform,
      numberCodePath,
      messageBeforeTransform,
      messagePath,
      detailsBeforeTransform,
      detailsPath,
      domainBeforeTransform,
      domainPath,
    } = valuesResult;

    const transformedResult = __transformAllValues({
      codeBeforeTransform,
      numberCodeBeforeTransform,
      messageBeforeTransform,
      detailsBeforeTransform,
      domainBeforeTransform,
      options,
      objectToParse,
    });
    if (typeof transformedResult === 'string') {
      return transformedResult;
    }
    const { code, numberCode, message, details, domain } = transformedResult;

    const tellDevsAboutTheirPaths =
      'To support inputs containing arrays of errors as well as single errors,' +
      ' all paths are treated as absolute (from the input root), but if an array of errors' +
      ' is detected, it will consider each element the new root input object. Devs have a' +
      ' choice: set the "pathToErrors" option as empty, and then map only the first error' +
      ' (highly not recommended), or adjust the paths to be relative to the objects inside' +
      ' the detected errors array.';

    return {
      didDetectErrorsArray: didDetectErrorsArray ? true : undefined,
      errorsArrayNotice: didDetectErrorsArray
                         ? tellDevsAboutTheirPaths
                         : undefined,
      input: objectToParse,
      path: errorsPath,
      value: {
        code:
          codePath || codeBeforeTransform || code
          ? {
              path: codePath,
              beforeTransform: codeBeforeTransform,
              value: code,
            }
          : undefined,
        numberCode:
          numberCodePath ||
          (numberCodeBeforeTransform !== undefined &&
           numberCodeBeforeTransform !== null) ||
          (numberCode !== undefined && numberCode !== null)
          ? {
              path: numberCodePath,
              beforeTransform: numberCodeBeforeTransform,
              value: numberCode,
            }
          : undefined,
        message:
          messagePath || messageBeforeTransform || message
          ? {
              path: messagePath,
              beforeTransform: messageBeforeTransform,
              value: message,
            }
          : undefined,
        details:
          detailsPath || detailsBeforeTransform || details
          ? {
              path: detailsPath,
              beforeTransform: detailsBeforeTransform,
              value: details,
            }
          : undefined,
        domain:
          domainPath || domainBeforeTransform || domain
          ? {
              path: domainPath,
              beforeTransform: domainBeforeTransform,
              value: domain,
            }
          : undefined,
      },
    };
  }
  catch (generalError) {
    ErrorObject.SHOW_ERROR_LOGS &&
    console.log(
      '[ErrorObject]',
      'Error during buildSummaryFromObject():',
      generalError,
    );
    return 'generalBuildSummaryFromObjectError';
  }
};

export const findNestedValueForPath = (value: any, path: string): any => {
  if (!path || !value) {
    return undefined;
  }
  const normalizedPath = path?.replace('[', '')?.replace(']', '');
  return !normalizedPath
         ? undefined
         : normalizedPath.split('.').reduce((acc, key) => {
      if (key.length === 0) {
        return acc;
      }
      const numericKey = Number(key);
      const resolvedKey = isNaN(numericKey) ? key : numericKey;
      return acc && typeof acc === 'object' ? acc[resolvedKey] : undefined;
    }, value);
};
