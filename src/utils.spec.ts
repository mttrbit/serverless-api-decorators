import * as chai from 'chai';
import 'mocha';
import { backbasify } from './utils';

const expect = chai.expect;

describe('backbasify', () => {
  it('input "a"', () => {
    const result = backbasify('a');
    expect(result).to.be.equals('a');
  });

  it('input []', () => {
    const result = backbasify([]);
    expect(Object.prototype.toString.call(result)).to.be.equals(
      '[object Object]',
    );
  });

  it('input ["a"]', () => {
    const result = backbasify(['a']);
    expect(result['0']).to.be.equals('a');
  });

  it('input {a: 1, b: 2}', () => {
    const result = backbasify({ a: 1, b: 2 });
    expect(result.a).to.be.equals(1);
    expect(result.b).to.be.equals(2);
  });

  it('input {a: 1, b: [3 4]}', () => {
    const result = backbasify({ a: 1, b: [3, 4] });
    expect(result.a).to.be.equals(1);
    console.log(result);
    expect(result.b['0']).to.be.equals(3);
    expect(result.b['1']).to.be.equals(4);
  });
});
