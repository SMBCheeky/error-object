/**
 * For customizing the paths, please make sure to use the {@link addPrefixPathVariants} function to also add the `error.` prefixed paths to the pathTo... arrays used in the {@link ErrorObjectBuildOptions} type.
 */
export const addPrefixPathVariants = (
  prefix: string | string[],
  array: string[],
): string[] => {
  if (typeof prefix === 'string') {
    return array.concat(
      array.map((s) => (typeof s === 'string' ? `${prefix}.${s}` : s)),
    );
  }
  if (
    Array.isArray(prefix) &&
    prefix.length > 0 &&
    typeof prefix?.[0] === 'string'
  ) {
    const result = [...array];
    for (const p of prefix) {
      const temp = array.map((s) => (typeof s === 'string' ? `${p}.${s}` : s));
      result.push(...temp);
    }
    return result;
  }
  return array;
};

/**
 * The {@link DEFAULT_BUILD_OPTIONS} is a set of default options that can be used to customize the behavior of the {@link ErrorObject.from()} method.
 * It contains common paths and a transform function that automatically converts the error number code, if it exists, to a string and sets it as the error code.
 */
export const DEFAULT_BUILD_OPTIONS: ErrorObjectBuildOptions = {
  pathToErrors: ['errors', 'errs'],
  pathToCode: addPrefixPathVariants('error', [
    'code',
    'err_code',
    'errorCode',
    'error_code',
  ]),
  pathToNumberCode: addPrefixPathVariants('error', [
    'numberCode',
    'err_number_code',
    'errorNumberCode',
    'error_number_code',
  ]),
  pathToMessage: addPrefixPathVariants('error', [
    'message',
    'err_message',
    'errorMessage',
    'error_message',
  ]),
  pathToDetails: addPrefixPathVariants('error', [
    'details',
    'err_details',
    'errorDetails',
    'error_details',
  ]),
  pathToDomain: addPrefixPathVariants('error', [
    'domain',
    'errorDomain',
    'error_domain',
    'err_domain',
    'type',
  ]),
  transform: (
    beforeTransform: ErrorObjectTransformState,
  ): ErrorObjectTransformState => {
    let newCode = beforeTransform.code;
    if (beforeTransform.code === undefined || beforeTransform.code === null) {
      const value = beforeTransform.numberCode;
      if (value !== undefined && value !== null) {
        newCode = value.toString();
      }
    }
    return {
      ...beforeTransform,
      code: newCode,
    };
  },
};

/**
 * The {@link ErrorObjectTransformState} type contains the state of the error object before and after the transformation.
 */
export type ErrorObjectTransformState = {
  code?: string | undefined;
  numberCode?: number | undefined;
  message?: string | undefined;
  details?: string | undefined;
  domain?: string | undefined;
};

/**
 * The {@link ErrorObjectBuildOptions} type contains all the options that can be used to customize the behavior of the {@link ErrorObject.from()} method.
 * Options are self-explanatory and the code behind them is kept similar and very straightforward, by design.
 */
export type ErrorObjectBuildOptions = {
  /**
   * The {@link checkInputObjectForValues} option allows you to check if the input object contains specific values.
   */
  checkInputObjectForValues?: {
    [key: string]: {
      value: string | number | boolean | null;
      exists: boolean;
    };
  };

  /**
   * The {@link checkInputObjectForTypes} option allows you to check if the input object contains specific types.
   */
  checkInputObjectForTypes?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object';
      valueIsArray?: boolean;
      exists: boolean;
    };
  };

  /**
   * The {@link checkInputObjectForKeys} option allows you to check if the input object contains specific keys.
   */
  checkInputObjectForKeys?: {
    [key: string]: {
      exists: boolean;
    };
  };

  /**
   * All paths should be absolute, from the root of the input object, unless an array of errors is found.
   * When an array of errors is found, the paths are considered relative to the objects found in the errors array.
   * "[" and "]" chars are not allowed. Use paths like "errors.0.code" instead of "errors[0].code".
   */
  pathToErrors: string[];

  /**
   * Path to the error code. This is the main error code that is used to identify the error.
   */
  pathToCode: string[];

  /**
   * Path to the error number code. This is an optional property that can be used to provide a numeric error code.
   * The default options will automatically convert the number code to a string and set it as the error code + keep the original number code.
   */
  pathToNumberCode: string[];

  /**
   * Path to the error message. This is the main error message that is used to describe the error.
   */
  pathToMessage: string[];

  /**
   * Path to the error details. This is an optional property that can be used to provide additional details about the error.
   * A common pattern is to use this to keep extra information about the error.
   */
  pathToDetails: string[];

  /**
   * Path to the error domain. This is an optional property that can be used to provide a domain for the error.
   */
  pathToDomain: string[];

  /**
   * The transform function is used to transform the properties found during the process of building the error object.
   * This is useful for transforming a the message based on the error code, the domain based on the error code, etc. allowing
   * the developer to customize the final error object created.
   */
  transform?: (
    beforeTransform: ErrorObjectTransformState,
    inputObject: any,
  ) => ErrorObjectTransformState;
};

type PathValueAndTransform<V> = {
  path: string | undefined;
  beforeTransform: V | undefined;
  value: V | undefined;
};

/**
 * The {@link ErrorSummary} helps with debugging and troubleshooting the error object building process.
 * It contains the input object and the properties found during the process of building the error object.
 */
export type ErrorSummary = {
  didDetectErrorsArray?: boolean;
  input: NonNullable<Record<string, any>>;
  path?: string;
  value: {
    code?: PathValueAndTransform<string>;
    numberCode?: PathValueAndTransform<number>;
    message?: PathValueAndTransform<string>;
    details?: PathValueAndTransform<string>;
    domain?: PathValueAndTransform<string>;
  };
};

/**
 * The {@link ErrorObjectErrorResult} type contains all the possible error results that can be returned by the {@link ErrorObject.from()} method.
 * The error results are used to identify the type of error that occurred during the process of building the error object.
 */
export type ErrorObjectErrorResult =
  | 'isNullish'
  | 'isNotAnObject'
  | 'checkIsNullish'
  | 'checkIsNotAnObject'
  | 'isNotAnArray'
  | 'checkInputObjectForValuesIsNotAnObject'
  | 'checkInputObjectForValuesFailed'
  | 'checkInputObjectForTypesIsNotAnObject'
  | 'checkInputObjectForTypesFailed'
  | 'checkInputObjectForTypesValueIsArrayFailed'
  | 'checkInputObjectForKeysIsNotAnObject'
  | 'checkInputObjectForKeysFailed'
  | 'pathToErrorsIsNotAnArray'
  | 'pathToErrorsValuesAreNotStrings'
  | 'pathToCodeIsInvalid'
  | 'pathToCodeIsNotAnArray'
  | 'pathToCodeValuesAreNotStrings'
  | 'pathToNumberCodeIsInvalid'
  | 'pathToNumberCodeIsNotAnArray'
  | 'pathToNumberCodeValuesAreNotStrings'
  | 'pathToMessageIsInvalid'
  | 'pathToMessageIsNotAnArray'
  | 'pathToMessageValuesAreNotStrings'
  | 'pathToDetailsIsInvalid'
  | 'pathToDetailsIsNotAnArray'
  | 'pathToDetailsValuesAreNotStrings'
  | 'pathToDomainIsInvalid'
  | 'pathToDomainIsNotAnArray'
  | 'pathToDomainValuesAreNotStrings'
  | 'transformIsNotAFunction'
  | 'transformResultIsNotAValidObject'
  | 'transformCodeResultIsNotString'
  | 'transformNumberCodeResultIsNotNumber'
  | 'transformNumberCodeResultIsNaN'
  | 'transformMessageResultIsNotString'
  | 'transformDetailsResultIsNotString'
  | 'transformDomainResultIsNotString'
  | 'buildSummaryIsNullish'
  | 'buildSummaryIsNotAnObject'
  | 'generalBuildSummariesFromObjectError'
  | 'generalBuildSummaryFromObjectError'
  | 'generalCheckInputObjectForValuesError'
  | 'unknownCodeOrMessage'
  | 'invalidSummary';

/**
 * The {@link ErrorObjectProcessingError} type contains the error result and the error summary.
 * It provides all the information needed to identify and troubleshoot the error that occurred during the process of building the error object.
 */
export type ErrorObjectProcessingError = {
  errorCode: ErrorObjectErrorResult;
  summary?: ErrorSummary;
};
