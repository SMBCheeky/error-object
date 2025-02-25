import { ErrorObject, ErrorObjectTransformState } from '../index';
import { DEFAULT_BUILD_OPTIONS, ErrorObjectBuildOptions, ErrorObjectErrorResult, ErrorSummary } from '../utils';
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

    if ('transform' in options && typeof options.transform !== 'function') {
      return 'transformIsNotAFunction';
    }

    const beforeTransform: ErrorObjectTransformState = {
      code: codeBeforeTransform,
      numberCode: numberCodeBeforeTransform,
      message: messageBeforeTransform,
      details: detailsBeforeTransform,
      domain: domainBeforeTransform,
    };

    const values = options.transform ? options.transform(beforeTransform, objectToParse) : beforeTransform;
    if (values === undefined || values === null || typeof values !== 'object') {
      return 'transformResultIsNotAValidObject';
    }
    if (values.code && typeof values.code !== 'string') {
      return 'transformCodeResultIsNotString';
    }

    if (
      values.numberCode !== undefined &&
      values.numberCode !== null &&
      typeof values.numberCode !== 'number'
    ) {
      return 'transformNumberCodeResultIsNotNumber';
    }
    if (values.numberCode !== undefined && values.numberCode !== null && isNaN(values.numberCode)) {
      return 'transformNumberCodeResultIsNaN';
    }
    if (values.message && typeof values.message !== 'string') {
      return 'transformMessageResultIsNotString';
    }
    if (values.details && typeof values.details !== 'string') {
      return 'transformDetailsResultIsNotString';
    }
    if (values.domain && typeof values.domain !== 'string') {
      return 'transformDomainResultIsNotString';
    }

    return {
      didDetectErrorsArray: didDetectErrorsArray ? true : undefined,
      input: objectToParse,
      path: errorsPath,
      value: {
        code:
          codePath || codeBeforeTransform || values.code
          ? {
              path: codePath,
              beforeTransform: codeBeforeTransform,
              value: values.code,
            }
          : undefined,
        numberCode:
          numberCodePath ||
          (numberCodeBeforeTransform !== undefined &&
           numberCodeBeforeTransform !== null) ||
          (values.numberCode !== undefined && values.numberCode !== null)
          ? {
              path: numberCodePath,
              beforeTransform: numberCodeBeforeTransform,
              value: values.numberCode,
            }
          : undefined,
        message:
          messagePath || messageBeforeTransform || values.message
          ? {
              path: messagePath,
              beforeTransform: messageBeforeTransform,
              value: values.message,
            }
          : undefined,
        details:
          detailsPath || detailsBeforeTransform || values.details
          ? {
              path: detailsPath,
              beforeTransform: detailsBeforeTransform,
              value: values.details,
            }
          : undefined,
        domain:
          domainPath || domainBeforeTransform || values.domain
          ? {
              path: domainPath,
              beforeTransform: domainBeforeTransform,
              value: values.domain,
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
