import * as Debug from 'debug';
import { Promise } from 'es6-promise';
import { LAMBDA_SYMBOL } from './symbols';
import { LambdaConfig } from './types';
import {
  DefaultLambdaFunctionNameResolver as FunctionNameResolver,
} from './resolver';

const debug = Debug('annotations');

const extractArgs = event =>
  (arg: any) => {
    debug('parsing arg for injection:', arg);
    if (arg === 'event') return event;

    if (event && event.path && event.path.hasOwnProperty(arg)) return event.path[arg];

    return undefined;
  };

export const lambdaFunction = (config: LambdaConfig) => {
  debug('Creating function annotatition');

  config.integration = config.integration || 'lambda';

  debug(config);

  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    debug('function name:', key);
    debug('Running function annotation');
    debug('-----------------parent proto------------');
    debug(Object.getOwnPropertyNames(target.constructor.prototype));

    const targetProto = target.constructor.prototype;

    if (!targetProto[LAMBDA_SYMBOL]) targetProto[LAMBDA_SYMBOL] = [];

    // setting real function name
    const functionSymbol = 'functionName';
    (config as any)[functionSymbol] = key;

    config.name = new FunctionNameResolver().getFunctionName(key, config);
    target.constructor.prototype[LAMBDA_SYMBOL].push(config);

    debug('endpoint defined', target.constructor.prototype);

    // the annotated/targeted function
    const targetFunction = target[key];

    return target[key] = (event, context, callback) => {
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
    };
  };
};

const FN_ARGS = /^[a-zA_Z]\s*[^\(]*\(\s*([^\)]*)\)/m;
const FN_ARG_SPLIT = /,/;
const FN_ARG = /^\s*(_?)(.+?)\1\s*$/;
const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
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
