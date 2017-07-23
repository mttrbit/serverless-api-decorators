// import index = require('../src/models');
// import * as chai from 'chai';
import 'mocha';

import * as Debug from 'debug';
import { entity, field } from '../src/models';

import * as DI from '../src/di';

const d = Debug('test');


@entity({
  table: 'Users',
  storage: 'DynamoDB'
})
export class User {

  @field()
  public id: string;

  @field()
  public name: string;

  @field()
  public email: string;

  constructor() { }
}


//const expect = chai.expect;

describe('index', () => {
  it('should create a factory', () => {
    d('DI:', DI);
  });
});
