import { LAMBDA_SYMBOL } from '../symbols';
import { LambdaFunctionConfig } from './types';
import { createDecoratedConfig } from './factories';
import { handle } from '@mttrbit/lambda-handler';

const getPathParam = (event, arg) => {
  const pathParamExists = event && event.path && event.path.hasOwnProperty(arg);

  return pathParamExists ? event.path[arg] : undefined;
};

const extractArgs = event => {
  return (arg: any) => {
    if (arg === 'event') return event;

    return getPathParam(event, arg);
  };
};

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
    return <any>(target[key] = handle((event, context, callback) => {
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

          // reject(e);
          resolve({ message: e.toString() });
        }
      });

      promise.then((response: any) => {
        callback(null, response);
      });

      promise.catch((err: any) => {
        // same as comment above
        // cb(err);
        callback(null, err);
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
