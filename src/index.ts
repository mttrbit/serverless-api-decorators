import * as fs from 'fs';
import * as path from 'path';
import tsSimpleAst from 'ts-simple-ast';
import * as ts from 'typescript';
import { ENDPOINT_SYMBOL, LAMBDA_SYMBOL } from './decorators/lambda';

import { fun as f } from '@mttrbit/fun';

const destructEndpoint = ({ keys }) => endpoint => {
  const assign = key => f.tap(acc => (acc[key] = endpoint[key]));
  return keys.reduce((acc, key) => assign(key)(acc), {});
};

const updateProperty = ({ key }, fn) => obj =>
  Object.assign(obj, { [key]: fn(obj[key]) });

const createFunction = handlerName => obj => {
  return {
    events: [{ http: obj }],
    handler: handlerName,
  };
};

const composeServerlessFn = (fns, service) => endpoint => {
  const varName = `${service.name}_${endpoint.name}`;
  const handler = `dist/handler.${varName}`;
  const concatPaths = sel => path.join(service.path, sel);
  fns[varName] = f.pipe(
    destructEndpoint({ keys: ['integration', 'path', 'method', 'cors'] }),
    updateProperty({ key: 'path' }, concatPaths),
    createFunction(handler),
  )(endpoint);
};

const addToTemplate = (tpl, service) => endpoint => {
  const varName = `${service.name}_${endpoint.name}`;
  const value = `app.services.${service.name}.${endpoint.functionName}`;
  tpl.push(`export const ${varName} = ${value};\n`);
};

class Serverless {
  public hooks: any = {};

  constructor(serverless: any, options: any) {
    // define sls hooks

    this.hooks = {
      'before:package:initialize': () => {
        return new Promise((res, rej) => {
          setTimeout(() => {
            res(true);
          }, 2000);
        });
      },
    };

    const ast = new tsSimpleAst({
      compilerOptions: {
        target: ts.ScriptTarget.ES5,
      },
    });

    const handlerjs = [
      '/* tslint:disable */\n',
      `import { App } from './api/app';\n`,
      'const app = new App();\n',
    ];

    const servicePath = serverless.config.servicePath;

    // const services = serverless.service.custom.services;
    const artifactsPath = serverless.service.custom.artifactsFolder;

    const functions = serverless.service.functions;

    try {
      const req = path.join(servicePath, artifactsPath);
      const serviceInstances: any = require(req).services;
      const serviceNames = Object.keys(serviceInstances);

      serviceNames.map(name => {
        const service = serviceInstances[name];
        const serviceDescription = service[ENDPOINT_SYMBOL];
        const endpoints = service[LAMBDA_SYMBOL];
        f.pipe(
          f.map(
            f.fmap(
              composeServerlessFn(functions, serviceDescription),
              addToTemplate(handlerjs, serviceDescription),
            ),
          ),
        )(endpoints);
      });
      const pathToHandler =
        serverless.service.custom.servicePath || servicePath;
      try {
        fs.unlinkSync(path.join(pathToHandler, 'handler.ts'));
      } catch (e) { }

      const sourceFile = ast.createSourceFile(
        path.join(pathToHandler, 'handler.ts'),
        handlerjs.join(''),
      );

      sourceFile.saveSync();
    } catch (e) {
      console.log('error', e);
    }
  }
}

export = Serverless;
