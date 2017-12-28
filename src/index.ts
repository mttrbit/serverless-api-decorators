import * as fs from 'fs';
import * as Debug from 'debug';
import * as path from 'path';
import tsSimpleAst from 'ts-simple-ast';
import * as ts from 'typescript';
import { ENDPOINT_SYMBOL, LAMBDA_SYMBOL } from './decorators/lambda';

const debug = Debug('sls-plugin');

// const d = Debug('auto-conf');

class Serverless {
  public hooks: any = {};

  constructor(serverless: any, options: any) {
    // debug('serverless', serverless.pluginManager);
    debug('initing plugin');

    debug('hooks');

    debug(serverless.hooks);
    // define sls hooks
    this.hooks = {
      'before:package:initialize': () => {
        return new Promise((res: any, rej: any) => {
          // prettier-ignore
          setTimeout(
            () => {
              debug('This runs before packaging');
              res(true);
            },
            2000);
        });
      },
    };

    const ast = new tsSimpleAst({
      compilerOptions: {
        target: ts.ScriptTarget.ES2016,
      },
    });

    let handlerjs = `
import { App } from './api/app';
const app = new App();
`;

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
        for (const endpoint of endpoints) {
          debug('registering endpoint', endpoint);
          // const name = endpoint.name;

          const varName = `${serviceDescription.name}_${endpoint.name}`;
          const value = `app.services.${serviceDescription.name}.${
            endpoint.functionName
            }`;
          handlerjs += `
export const ${varName} = ${value};
`;

          functions[`${serviceDescription.name}_${endpoint.name}`] = {
            events: [
              {
                http: {
                  integration: endpoint.integration,
                  method: endpoint.method,
                  path: path.join(serviceDescription.path, endpoint.path),
                },
              },
            ],
            handler: `dist/handler.${serviceDescription.name}_${endpoint.name}`,
          };
        }
      }

      try {
        fs.unlinkSync(path.join(servicePath, 'handler.ts'));
      } catch (e) { }

      const sourceFile = ast.createSourceFile(
        path.join(servicePath, 'handler.ts'),
        handlerjs,
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
