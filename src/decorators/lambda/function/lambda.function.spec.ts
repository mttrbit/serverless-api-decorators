import * as chai from 'chai';
import 'mocha';
import * as Debug from 'debug';
import { ENDPOINT_SYMBOL, LAMBDA_SYMBOL } from '../symbols';
import { lambdaService } from '../lambda.service';
import { lambdaFunction } from './index';

const d = Debug('test');

@lambdaService({
  name: 'test',
  path: '/test',
})
class TestService {
  constructor() {
    // d('initing test service')
  }

  @lambdaFunction({
    name: 'test',
    path: '/',
    method: 'get',
  })
  public testMethod() {
    d('running testMethod', this);

    return 'abc';
  }
}

const expect = chai.expect;

const promisify = (service: object, functionName: string, event, context) =>
  new Promise((resolve, reject) => {
    (service as any)[functionName].apply(functionName, [
      {},
      context,
      (err, resp) => {
        if (err) reject(err);
        else resolve(resp);
      },
    ]);
  });

describe('decorators', () => {
  it('test function', done => {
    promisify(new TestService(), 'testMethod', {}, { functionName: 'foo' })
      .then(resp => {
        expect(resp.body).to.be.eql('abc');
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('should inject configuration into instance', () => {
    const service = new TestService();
    const serviceDef = (service as any)[ENDPOINT_SYMBOL];
    const endpointsDef = (service as any)[LAMBDA_SYMBOL];

    expect(serviceDef).to.be.eql(
      {
        name: 'test',
        path: '/test',
      },
      'should match provided config',
    );

    expect(endpointsDef).to.be.eql([
      {
        cors: true,
        functionName: 'testMethod',
        integration: 'lambda',
        method: 'get',
        name: 'test',
        path: '/',
        resolveWithFullResponse: false,
      },
    ]);
  });
});
