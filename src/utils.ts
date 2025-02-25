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

// The {@link ErrorObjectBuildOptions} type contains all the options that can be used to customize the behavior of the {@link ErrorObject.from()} method.
// Options are self-explanatory and the code behind them is kept similar and very straightforward, by design.
// For customizing the paths, please make sure to use the {@link addPrefixPathVariants} function to also add the `error.` prefixed paths to the array provided.
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

export type ErrorObjectTransformState = {
  code?: string | undefined;
  numberCode?: number | undefined;
  message?: string | undefined;
  details?: string | undefined;
  domain?: string | undefined;
};

export type ErrorObjectBuildOptions = {
  checkInputObjectForValues?: {
    [key: string]: {
      value: string | number | boolean | null;
      exists: boolean;
    };
  };
  checkInputObjectForTypes?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'object';
      valueIsArray?: boolean;
      exists: boolean;
    };
  };
  checkInputObjectForKeys?: {
    [key: string]: {
      exists: boolean;
    };
  };

  // All paths should be absolute, from the root of the input object, unless an array of errors is found.
  // When an array of errors is found, the paths are considered relative to the objects found in the errors array.
  // "[" and "]" chars are not allowed.
  pathToErrors: string[];
  pathToCode: string[];
  pathToNumberCode: string[];
  pathToMessage: string[];
  pathToDetails: string[];
  pathToDomain: string[];

  transform?: (
    beforeTransform: ErrorObjectTransformState,
    inputObject: any,
  ) => ErrorObjectTransformState;
};

export type PathValueAndTransform<V> = {
  path: string | undefined;
  beforeTransform: V | undefined;
  value: V | undefined;
};

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

export type ErrorObjectProcessingError = {
  errorCode: ErrorObjectErrorResult;
  summary?: ErrorSummary;
};
