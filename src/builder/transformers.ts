import { ErrorObjectBeforeTransformState, ErrorObjectBuildOptions, ErrorObjectErrorResult } from '../utils';

export const __transformAllValues = (props: {
  codeBeforeTransform?: string | undefined;
  numberCodeBeforeTransform?: number | undefined;
  messageBeforeTransform?: string | undefined;
  detailsBeforeTransform?: string | undefined;
  domainBeforeTransform?: string | undefined;
  options: ErrorObjectBuildOptions;
  objectToParse: any;
}):
  | {
  code: string | undefined;
  numberCode: number | undefined;
  message: string | undefined;
  details: string | undefined;
  domain: string | undefined;
}
  | ErrorObjectErrorResult => {
  const { options, objectToParse, ...rawBeforeTransform } = props;
  const beforeTransform: ErrorObjectBeforeTransformState = {
    code: rawBeforeTransform.codeBeforeTransform,
    numberCode: rawBeforeTransform.numberCodeBeforeTransform,
    message: rawBeforeTransform.messageBeforeTransform,
    details: rawBeforeTransform.detailsBeforeTransform,
    domain: rawBeforeTransform.domainBeforeTransform,
  };

  let code = beforeTransform.code;
  if ('transformCode' in options) {
    if (typeof options.transformCode !== 'function') {
      return 'transformCodeIsNotAFunction';
    }
    code =
      'transformCode' in options
      ? options?.transformCode?.(code, beforeTransform, objectToParse)
      : beforeTransform.code;
    if (code && typeof code !== 'string') {
      return 'transformCodeResultIsNotString';
    }
  }

  let numberCode = beforeTransform.numberCode;
  if ('transformNumberCode' in options) {
    if (typeof options.transformNumberCode !== 'function') {
      return 'transformNumberCodeIsNotAFunction';
    }
    numberCode =
      'transformNumberCode' in options
      ? options?.transformNumberCode?.(numberCode, beforeTransform, objectToParse)
      : beforeTransform.numberCode;
    if (
      numberCode !== undefined &&
      numberCode !== null &&
      typeof numberCode !== 'number'
    ) {
      return 'transformNumberCodeResultIsNotNumber';
    }
    if (numberCode !== undefined && numberCode !== null && isNaN(numberCode)) {
      return 'transformNumberCodeResultIsNaN';
    }
  }

  let message = beforeTransform.message;
  if ('transformMessage' in options) {
    if (typeof options.transformMessage !== 'function') {
      return 'transformMessageIsNotAFunction';
    }
    message =
      'transformMessage' in options
      ? options?.transformMessage?.(message, beforeTransform, objectToParse)
      : beforeTransform.message;
    if (message && typeof message !== 'string') {
      return 'transformMessageResultIsNotString';
    }
  }

  let details = beforeTransform.details;
  if ('transformDetails' in options) {
    if (typeof options.transformDetails !== 'function') {
      return 'transformDetailsIsNotAFunction';
    }
    details =
      'transformDetails' in options
      ? options?.transformDetails?.(details, beforeTransform, objectToParse)
      : beforeTransform.details;
    if (details && typeof details !== 'string') {
      return 'transformDetailsResultIsNotString';
    }
  }

  let domain = beforeTransform.domain;
  if ('transformDomain' in options) {
    if (typeof options.transformDomain !== 'function') {
      return 'transformDomainIsNotAFunction';
    }
    domain =
      'transformDomain' in options
      ? options?.transformDomain?.(domain, beforeTransform, objectToParse)
      : beforeTransform.domain;
    if (domain && typeof domain !== 'string') {
      return 'transformDomainResultIsNotString';
    }
  }

  return {
    code,
    numberCode,
    message,
    details,
    domain,
  };
};
