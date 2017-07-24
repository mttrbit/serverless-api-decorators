import * as chai from 'chai';
import 'mocha';
import * as Debug from 'debug';
import {
  lambdaService,
  lambdaFunction,
  ENDPOINT_SYMBOL,
  LAMBDA_SYMBOL,
} from './index';


const d = Debug('test');

@lambdaService({
  name: 'test',
  path: '/',
})
class TestService {
  constructor() {
    // d('initing test service')
  }

  @lambdaFunction({
    test: 'test',
  })
  public testMethod() {
    d('running testMethod', this);
  }
}



const expect = chai.expect;

describe('decorators', () => {
  it('should inject configuration into instance', () => {


    // d('serverless plugin', index);
    const service = new TestService();

    const serviceDef = (service as any)[ENDPOINT_SYMBOL];
    const endpointsDef = (service as any)[LAMBDA_SYMBOL];

    expect(serviceDef).to.be.eql({ test: 'test' }, 'should match provided config');

    expect(endpointsDef).to.be.eql([{ functionName: 'testMethod', test: 'test' }]);

  });
});
