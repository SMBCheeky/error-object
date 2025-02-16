import { ErrorObjectBuildOptions, ErrorObjectErrorResult } from '../utils';
import { findNestedValueForPath } from './index';

export const __processAllValuesFromPaths = (
  objectToParse: any,
  options: ErrorObjectBuildOptions,
):
  | {
  codeBeforeTransform: string | undefined;
  codePath: string | undefined;
  numberCodeBeforeTransform: number | undefined;
  numberCodePath: string | undefined;
  messageBeforeTransform: string | undefined;
  messagePath: string | undefined;
  detailsBeforeTransform: string | undefined;
  detailsPath: string | undefined;
  domainBeforeTransform: string | undefined;
  domainPath: string | undefined;
}
  | ErrorObjectErrorResult => {
  let codeBeforeTransform: string | undefined;
  let codePath: string | undefined;
  if (!('pathToCode' in options)) {
    return 'pathToCodeIsInvalid';
  }
  if (!Array.isArray(options.pathToCode)) {
    return 'pathToCodeIsNotAnArray';
  }
  for (const path of options.pathToCode) {
    if (typeof path !== 'string') {
      return 'pathToCodeValuesAreNotStrings';
    }
    const found = findNestedValueForPath(objectToParse, path);
    if (found !== undefined && found !== null) {
      if (typeof found === 'string') {
        codePath = path;
        codeBeforeTransform = found;
        break;
      }
      if ((Array.isArray(found) || typeof found === 'object')) {
        codePath = path;
        codeBeforeTransform = JSON.stringify(found);
        break;
      }
    }
  }

  let numberCodeBeforeTransform: number | undefined;
  let numberCodePath: string | undefined;
  if (!('pathToNumberCode' in options)) {
    return 'pathToNumberCodeIsInvalid';
  }
  if (!Array.isArray(options.pathToNumberCode)) {
    return 'pathToNumberCodeIsNotAnArray';
  }
  for (const path of options.pathToNumberCode) {
    if (typeof path !== 'string') {
      return 'pathToNumberCodeValuesAreNotStrings';
    }
    const found = findNestedValueForPath(objectToParse, path);
    if (found !== undefined && found !== null && typeof found === 'number' && !isNaN(found)) {
      numberCodePath = path;
      numberCodeBeforeTransform = found;
      break;
    }
  }

  let messageBeforeTransform: string | undefined;
  let messagePath: string | undefined;
  if (!('pathToMessage' in options)) {
    return 'pathToMessageIsInvalid';
  }
  if (!Array.isArray(options.pathToMessage)) {
    return 'pathToMessageIsNotAnArray';
  }
  for (const path of options.pathToMessage) {
    if (typeof path !== 'string') {
      return 'pathToMessageValuesAreNotStrings';
    }
    const found = findNestedValueForPath(objectToParse, path);
    if (found !== undefined && found !== null) {
      if (typeof found === 'string') {
        messagePath = path;
        messageBeforeTransform = found;
        break;
      }
      if ((Array.isArray(found) || typeof found === 'object')) {
        messagePath = path;
        messageBeforeTransform = JSON.stringify(found);
        break;
      }
    }
  }

  let detailsBeforeTransform: string | undefined;
  let detailsPath: string | undefined;
  if (!('pathToDetails' in options)) {
    return 'pathToDetailsIsInvalid';
  }
  if (!Array.isArray(options.pathToDetails)) {
    return 'pathToDetailsIsNotAnArray';
  }
  for (const path of options.pathToDetails) {
    if (typeof path !== 'string') {
      return 'pathToDetailsValuesAreNotStrings';
    }
    const found = findNestedValueForPath(objectToParse, path);
    if (found !== undefined && found !== null) {
      if (typeof found === 'string') {
        detailsPath = path;
        detailsBeforeTransform = found;
        break;
      }
      if ((Array.isArray(found) || typeof found === 'object')) {
        detailsPath = path;
        detailsBeforeTransform = JSON.stringify(found);
        break;
      }
    }
  }

  let domainBeforeTransform: string | undefined;
  let domainPath: string | undefined;
  if (!('pathToDomain' in options)) {
    return 'pathToDomainIsInvalid';
  }
  if (!Array.isArray(options.pathToDomain)) {
    return 'pathToDomainIsNotAnArray';
  }
  for (const path of options.pathToDomain) {
    if (typeof path !== 'string') {
      return 'pathToDomainValuesAreNotStrings';
    }
    const found = findNestedValueForPath(objectToParse, path);
    if (found !== undefined && found !== null) {
      if (typeof found === 'string') {
        domainPath = path;
        domainBeforeTransform = found;
        break;
      }
      if ((Array.isArray(found) || typeof found === 'object')) {
        domainPath = path;
        domainBeforeTransform = JSON.stringify(found);
        break;
      }
    }
  }

  return {
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
  };
};
