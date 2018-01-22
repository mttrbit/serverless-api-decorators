import * as chai from 'chai';
import 'mocha';
import { ensure } from './ensure';

class Circle {
  @ensure(x => x > 0)
  public radius: number;
}

describe('precondition', () => {
  it('fails', () => {
    const circle = new Circle();
    circle.radius = 1;
  });
});
