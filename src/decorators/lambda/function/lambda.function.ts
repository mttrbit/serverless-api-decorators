import { LAMBDA_SYMBOL } from '../symbols';
import { LambdaFunctionConfig } from './types';
import { createDecoratedConfig } from './factories';
import { handle } from '@mttrbit/lambda-handler';
import { backbasify } from '../../../utils';

const getPathParam = (event, arg) => {
  // const pathParamExists = event && event.path && event.path.hasOwnProperty(arg);
  const pathParamExists =
    event && event.pathParameters && event.pathParameters.hasOwnProperty(arg);
  return pathParamExists ? event.pathParameters[arg] : undefined;
};

const extractArgs = event => {
  return (arg: any) => {
    if (arg === 'event') return event;

    return getPathParam(event, arg);
  };
};

/**
 * Defines the type of the handler passed by the service.
 * The parameter callback represents the original callback
 * passed from AWS to the service
 */
export type ServiceHandler = (
  event, // an AWS event
  context, // the corresponding index
  callback, // AWS callback
) => void;

const proxiedHandler = (handler: ServiceHandler) =>
  handle(handler, {
    onBefore: (event, context) => {
      context.log.info({ event }, 'processing event');
    },
    onAfter: (result, event, context) => {
      context.log.info({ result }, 'event processed');
      // if (!config.resolveWithFullResponse) {
      // if (result.hasOwnProperty('options')) delete result.options;
      // if (result.hasOwnProperty('response')) delete result.response;
      // }{
      if (result.statusCode) {
        return Object.assign(
          {
            statusCode: 200,
            headers: {},
            body: '',
            isBase64Encoded: false,
          },
          result,
        );
      } else {
        return {
          statusCode: 200,
          headers: {},
          body:
            Object.prototype.toString.call(result) === '[object String]'
              ? result
              : JSON.stringify(result),
          isBase64Encoded: false,
        };
      }
    },
    onError: (error, event, context) => {
      context.log.error({ err: error }, 'error occurred');
      return {
        statusCode: error.httpStatus,
        body: JSON.stringify({
          name: error.name,
          message: error.message,
          errorType: error.name,
          errors: error.errors,
        }),
      };
    },
  });

export const lambdaFunction = (config: LambdaFunctionConfig) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const targetProto = target.constructor.prototype;

    if (!targetProto[LAMBDA_SYMBOL]) targetProto[LAMBDA_SYMBOL] = [];

    const decoratedConfig = createDecoratedConfig({ config, key });
    target.constructor.prototype[LAMBDA_SYMBOL].push(decoratedConfig);

    // the annotated/targeted function
    const targetFunction = target[key];

    // see:
    // https://stackoverflow.com/questions/36446480/
    // typescript-decorator-reports-unable-to-resolve-signature-of-class-decorator-whe
    return <any>(target[key] = proxiedHandler((event, context, callback) => {
      const targetArgs = annotate(targetFunction);
      // function should only handle the event and resolve, reject of a promise
      const promise = new Promise((resolve, reject) => {
        try {
          const args = targetArgs.map(extractArgs(event));
          const response = targetFunction.apply(target, args);
          resolve(response);
        } catch (e) {
          // in development mode we always want to resolve
          // this will avoid the 'watched' function execution
          // to be interrupted
          // in prod/staging etc... etc... we want to reject
          // so AWS will be informed of the error

          // TODO: need to get enviroment info

          reject(e);
          // resolve({ message: e.toString() });
        }
      });

      promise.then((response: any) => {
        if (
          event &&
          event['headers'] &&
          event['headers']['x-middleware-type'] === 'mw/backbase-forms'
        ) {
          response = { data: backbasify(response) };
        }
        callback(null, response);
      });
      promise.catch((err: any) => {
        // same as comment above
        // cb(err);
        callback(err);
        // callback(null, err);
      });
    }));
  };
};

const FN_ARGS = /^[a-zA_Z]\s*[^\(]*\(\s*([^\)]*)\)/m;
const FN_ARG_SPLIT = /,/;
const FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
function annotate(fn: any) {
  const $inject: string[] = [];
  let fnText;
  let argDecl;
  // let last;

  if (typeof fn === 'function') {
    fnText = fn.toString().replace(STRIP_COMMENTS, '');
    argDecl = fnText.match(FN_ARGS);
    argDecl[1].split(FN_ARG_SPLIT).forEach((arg: any) => {
      arg.replace(FN_ARG, (all: any, underscore: any, name: any) => {
        $inject.push(name);
      });
    });
  } else if (false) {
    // last = fn.length - 1;
    // assertArgFn(fn[last], 'fn')
    // $inject = fn.slice(0, last);
  } else {
    // assertArgFn(fn, 'fn', true);
  }
  return $inject;
}
