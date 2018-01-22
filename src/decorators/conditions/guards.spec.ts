import * as chai from 'chai';
import 'mocha';
import { isEmail, isPIN } from './guards';

const expect = chai.expect;

describe('isEmail', () => {
  it('testtest.com is not', () => {
    const email = 'testtest.com';
    expect(isEmail(email)).to.be.false;
  });
  it('test@test.com is true', () => {
    const email = 'test@test.com';
    expect(isEmail(email)).to.be.true;
  });
  it(' is not', () => {
    const email = '';
    expect(isEmail(email)).to.be.false;
  });
  it('@.1 is not', () => {
    const email = '@.1';
    expect(isEmail(email)).to.be.false;
  });
});
describe('isSSN', () => {
  it('811218-9876 is true', () => {
    const ssn = '811218-9876';
    expect(isPIN(ssn)).to.be.true;
  });
  it('811218-9877 is false', () => {
    const ssn = '811218-9877';
    expect(isPIN(ssn)).to.be.false;
  });

  it('19811218-9876 is true', () => {
    const ssn = '19811218-9876';
    expect(isPIN(ssn)).to.be.true;
  });
});
