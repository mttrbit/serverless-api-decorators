import * as Debug from 'debug';
import * as createError from 'http-errors';

import {
  lambdaService,
  lambdaFunction,
} from 'sls-api-decorators/decorators/lambda';

const debug = Debug('bazooka');

@lambdaService({
  name: 'userService',
  path: 'users',
  xOrigin: true,
})
export class UserService {
  // @Factory()
  // private User: User;

  constructor() {
    debug('Initing UserService');
    // debug('User Factory', this.User);
  }

  @lambdaFunction({
    // name to reference this method in the serverless ecosystem
    // i.e.: to be used with invoke command
    name: 'hello',
    // sub-path for this endpoint
    // i.e.: http://localhost:8000/users/
    path: '/hi',
    // method to which this function should listen
    // i.e.: 'get' or ['get', 'post'] [TBD]
    method: 'get',
    // this is just required from serverless-webpack plugin
    integration: 'lambda-proxy',
  })
  public welcome(event) {
    debug('Running welcome');

    throw createError.NotFound();
    // throw new Error('ABBBCCCDDD');
    /*
    return {
      message:
        'Go Serverless Webpack (Typescript) v1.0! Your function executed successfully!',
    };
    */
  }

  @lambdaFunction({
    name: 'list',
    path: '/',
    method: 'get',
    integration: 'lambda-proxy',
  })
  public list(event, offset, limit) {
    debug('Running welcome');

    return [
      {
        name: 'davide cavaliere',
        email: 'cavaliere.davide@gmail.com',
        provider: 'googleplus',
      },
    ];
  }

  @lambdaFunction({
    name: 'getById',
    path: '/{id}',
    method: 'get',
    integration: 'lambda-proxy',
  })
  public getById(id) {
    debug('Running get by id:', id);

    return {
      id: 'abc',
      name: 'dcavaliere',
      email: 'cavaliere.davide@gmail.com',
    };
  }

  @lambdaFunction({
    name: 'getSubscriptions',
    path: '/{id}/subscriptions',
    method: 'get',
    integration: 'lambda-proxy',
  })
  public getSubscriptions(id) {
    debug('Running get by id:', id);
    return ['Playboy', 'Penthouse'];
  }

  @lambdaFunction({
    name: 'error',
    path: 'error',
    method: 'get',
    integration: 'lambda-proxy',
  })
  public error(event) {
    debug('throwing an error');
    throw new Error('something weird just happened');
  }
}
