import * as Debug from 'debug';
import { LAMBDA_SYMBOL } from '../symbols';
import { LambdaFunctionConfig } from './types';
import { createDecoratedConfig } from './factories';

const debug = Debug('annotations');

const getPathParam = (event, arg) => {
  const pathParamExists = event && event.path && event.path.hasOwnProperty(arg);

  return pathParamExists ? event.path[arg] : undefined;
};

const extractArgs = event => {
  return (arg: any) => {
    debug('parsing arg for injection:', arg);
    if (arg === 'event') return event;

    return getPathParam(event, arg);
  };
};

export const lambdaFunction = (config: LambdaFunctionConfig) => {
  debug('Creating function annotatition');

  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    debug('function name:', key);
    debug('Running function annotation');
    debug('-----------------parent proto------------');
    debug(Object.getOwnPropertyNames(target.constructor.prototype));

    const targetProto = target.constructor.prototype;

    if (!targetProto[LAMBDA_SYMBOL]) targetProto[LAMBDA_SYMBOL] = [];

    const decoratedConfig = createDecoratedConfig({ config, key });
    debug(decoratedConfig);
    target.constructor.prototype[LAMBDA_SYMBOL].push(decoratedConfig);

    debug('endpoint defined', target.constructor.prototype);

    // the annotated/targeted function
    const targetFunction = target[key];

    // see:
    // https://stackoverflow.com/questions/36446480/
    // typescript-decorator-reports-unable-to-resolve-signature-of-class-decorator-whe
    return <any>(target[key] = (event, context, callback) => {
      debug('hijacked function');
      debug('original function:', targetFunction);
      const targetArgs = annotate(targetFunction);
      debug('function arguments', targetArgs);

      debug('event', event);
      debug('context', context);
      debug('callback', callback);
      // function should only handle the event and resolve, reject of a promise
      const promise = new Promise((resolve, reject) => {
        debug('promising sanitation');
        try {
          const args = targetArgs.map(extractArgs(event));
          debug('new arguments:', args);
          const response = targetFunction.apply(target, args);
          resolve(response);
        } catch (e) {
          debug('error calling handler', e.toString());

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
        debug('handling response', response);
        callback(null, response);
      });

      promise.catch((err: any) => {
        debug('promise cought error', err);
        // same as comment above
        // cb(err);
        callback(null, err);
      });
    });
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

  debug('extracting arguments from fn:', fn);

  if (typeof fn === 'function') {
    debug('function is a function!');
    fnText = fn.toString().replace(STRIP_COMMENTS, '');
    debug('fnText', fnText);
    argDecl = fnText.match(FN_ARGS);
    debug('argDecl', argDecl);
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
