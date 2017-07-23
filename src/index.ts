import * as Debug from 'debug';
import { Promise } from 'es6-promise';
import * as path from 'path';
import tsSimpleAst from 'ts-simple-ast';
import * as ts from 'typescript';

import { ENDPOINT_SYMBOL, LAMBDA_SYMBOL } from './decorators';
// import * as fs from 'fs';

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
        target: ts.ScriptTarget.ES3,
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
      // debug('requiring: ', req);

      const serviceInstances: any = require(req).services;
      // debug('serviceInstances: ', serviceInstances);

      for (const serviceName of Object.keys(serviceInstances)) {
        // debug('serviceName: ', serviceName);
        const service = serviceInstances[serviceName];
        // debug('service:', service[EndpointSymbol]);

        const serviceDescription = service[ENDPOINT_SYMBOL];
        // debug('serviceDescription', serviceDescriulesption);
        const endpoints = service[LAMBDA_SYMBOL];
        // debug('endpoints', endpoints);

        // debug('adding functions');

        for (const endpoint of endpoints) {
          // debug('registering endpoint', endpoint);
          // const name = endpoint.name;
          const funcName = endpoint.functionName;

          const varName = `${serviceDescription.name}_${funcName}`;
          const value = `app.services.${serviceDescription.name}.${funcName}`;
          handlerjs += `
export const ${varName} = ${value};
`;

          functions[`${serviceDescription.name}_${funcName}`] = {
            events: [
              {
                http: {
                  integration: endpoint.integration,
                  method: endpoint.method,
                  path: path.join(serviceDescription.path, endpoint.path),
                },
              },
            ],
            handler: `lib/handler.${serviceDescription.name}_${funcName}`,
          };
        }
      }

      const sourceFile = ast.addSourceFileFromText(path.join(servicePath, 'handler.ts'), handlerjs);

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
