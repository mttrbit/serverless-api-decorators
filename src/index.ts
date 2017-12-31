import * as fs from 'fs';
import * as Debug from 'debug';
import * as path from 'path';
import tsSimpleAst from 'ts-simple-ast';
import * as ts from 'typescript';
import { ENDPOINT_SYMBOL, LAMBDA_SYMBOL } from './decorators/lambda';

const debug = Debug('sls-plugin');

// const d = Debug('auto-conf');

const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));

const until = (cond, time) =>
  cond().then((result) => result || delay(time).then(() => until(cond, time)));

class Serverless {
  public hooks: any = {};

  constructor(serverless: any, options: any) {
    // debug('serverless', serverless.pluginManager);
    debug('initing plugin');

    debug('hooks');

    debug(serverless.hooks);
    // define sls hooks
    this.hooks = {
      'before:package:initialize': () =>
        delay(2000).then((res: any) => res(true)),
    };

    const ast = new tsSimpleAst({
      compilerOptions: {
        target: ts.ScriptTarget.ES2016,
      },
    });

    const handlerjs = [
      `import { App } from './api/app';\n`,
      'const app = new App();\n',
    ];

    const servicePath = serverless.config.servicePath;
    debug('servicePath:', servicePath);

    // const services = serverless.service.custom.services;
    const artifactsPath = serverless.service.custom.artifactsFolder;
    debug('articafacts folder', artifactsPath);
    debug('cwd', __dirname);

    const functions = serverless.service.functions;

    try {
      const req = path.join(servicePath, artifactsPath);
      debug('requiring: ', req);

      const serviceInstances: any = require(req).services;
      debug('serviceInstances: ', serviceInstances);

      for (const serviceName of Object.keys(serviceInstances)) {
        debug('serviceName: ', serviceName);
        const service = serviceInstances[serviceName];
        debug('service:', service[ENDPOINT_SYMBOL]);
        const serviceDescription = service[ENDPOINT_SYMBOL];
        debug('serviceDescription', serviceDescription);
        const endpoints = service[LAMBDA_SYMBOL];
        debug('endpoints', endpoints);

        debug('adding functions');

        const destructEndpoint = ({ keys }: { keys: [string] }) => (endpoint) => {
          const reducer = (accumulator, key) => {
            accumulator[key] = endpoint[key];
            return accumulator;
          };
          return keys.reduce(reducer, {});
        };

        const updateProperty = ({ key }, fn) => (obj) =>
          Object.assign(obj, { [key]: fn(obj[key]) });

        const createFunction = (handlerName) => (obj) => {
          return {
            events: [obj],
            handler: handlerName,
          };
        };

        const reducer = (accumulator, fn) => accumulator.map(fn);

        const compose = (...args) => (x) => args.reduce(reducer, [x]).pop();

        const composeServerlessFn = (fns, endpoint, serviceDescription) => {
          const varName = `${serviceDescription.name}_${endpoint.name}`;
          const handlerName = `dist/handler.${varName}`;
          fns[varName] = compose(
            destructEndpoint({ keys: ['integration', 'name', 'path'] }),
            updateProperty({ key: 'path' }, (sel) =>
              path.join(serviceDescription.path, sel),
            ),
            createFunction(handlerName),
          )(endpoint);
        };

        endpoints.map((endpoint) => {
          composeServerlessFn(functions, endpoint, serviceDescription);
          const varName = `${serviceDescription.name}_${endpoint.name}`;
          const value = `app.services.${serviceDescription.name}.${
            endpoint.functionName
            }`;
          handlerjs.push(`export const ${varName} = ${value};\n`);
        });
      }

      try {
        fs.unlinkSync(path.join(servicePath, 'handler.ts'));
      } catch (e) { }

      const sourceFile = ast.createSourceFile(
        path.join(servicePath, 'handler.ts'),
        handlerjs.join(''),
      );

      sourceFile.saveSync();
      debug('handler.ts saved');
      debug('final configuration: functions list');
      debug(functions);
    } catch (e) {
      console.log('error', e);
    }
  }
}

export = Serverless;
