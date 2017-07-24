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

describe('decorators', () => {
  it('test function', (done) => {
    const service = new TestService();

    new Promise((resolve, reject) => {
      (service as any)['testMethod']
        .apply('testMethod', [
          {},
          {},
          (err, resp) => {
            if (err) reject(err);
            else resolve(resp);
          },
        ]);
    })
      .then((resp) => {
        expect(resp).to.be.eql('abc');
        done();
      })
      .catch((err) => {
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
      'should match provided config');

    expect(endpointsDef).to.be.eql(
      [
        {
          functionName: 'testMethod',
          integration: 'lambda',
          method: 'get',
          name: 'test',
          path: '/',
        },
      ],
    );
  });
});
