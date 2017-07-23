// import index = require('../src/index');
import * as chai from 'chai';
import 'mocha';
import * as Debug from 'debug';
import {
  endpoint,
  lambda,
  ENDPOINT_SYMBOL,
  LAMBDA_SYMBOL
} from '../src/decorators';


const d = Debug('test');

@endpoint({
  test: 'test'
})
class TestService {
  constructor() {
    // d('initing test service')
  }

  @lambda({
    test: 'test'
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
