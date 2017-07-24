// import index = require('../src/index');
import * as chai from 'chai';
import 'mocha';

import * as Debug from 'debug';
import {
  lambdaService,
  lambdaFunction,
  ENDPOINT_SYMBOL,
  LAMBDA_SYMBOL,
} from '../src/decorators/lambda';

import * as DI from '../src/di';

const d = Debug('test');


@lambdaService({
  name: 'testService',
  path: 'test',
})
class TestService {

  public static count: number = 0;

  constructor() {
    // d('initing test service')
    TestService.count++;
    d('number of instances', TestService.count);
  }

  @lambdaFunction({
    name: 'test',
    path: '/',
    method: 'get',
  })
  public testMethod() {
    d('running testMethod', this);
  }

  @lambdaFunction({
    path: '/',
    method: 'get',
  })
  public getInfo() {
    d('running testMethod', this);
  }
}



const expect = chai.expect;

describe('index', () => {
  it('should provide Greeter', () => {
    d('DI:', DI);

    const service = DI.getSingleton('testService');
    const serviceDef = (service as any)[ENDPOINT_SYMBOL];
    const endpointsDef = (service as any)[LAMBDA_SYMBOL];

    expect(serviceDef).to.be.eql({
      name: 'testService',
      path: 'test'
    }, 'should match provided config');

    expect(endpointsDef).to.be.eql([
      {
        functionName: 'testMethod',
        integration: 'lambda',
        method: 'get',
        name: 'test',
        path: '/',
      },
      {
        functionName: 'getInfo',
        integration: 'lambda',
        method: 'get',
        name: 'getInfo',
        path: '/',
      },
    ]);
  });
});
