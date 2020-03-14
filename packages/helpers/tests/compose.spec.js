import { expect } from 'chai';
import { compose } from '..';

describe('helper-compose', () => {
  it('composes from right to left', () => {
    const double = x => x * 2;
    const square = x => x * x;
    expect(compose(square)(5)).to.be.equal(25);
    expect(compose(square, double)(5)).to.be.equal(100);
    expect(compose(double, square, double)(5)).to.be.equal(200);
  });

  it('composes functions from right to left', () => {
    const a = next => x => next(x + 'a');
    const b = next => x => next(x + 'b');
    const c = next => x => next(x + 'c');
    const final = x => x;

    expect(compose(a, b, c)(final)('')).to.be.equal('abc');
    expect(compose(b, c, a)(final)('')).to.be.equal('bca');
    expect(compose(c, a, b)(final)('')).to.be.equal('cab');
  });

  it('throws at runtime if argument is not a function', () => {
    const square = x => x * x;
    const add = (x, y) => x + y;

    expect(() => compose(square, add, false)(1, 2)).to.throw();
    expect(() => compose(square, add, undefined)(1, 2)).to.throw();
    expect(() => compose(square, add, true)(1, 2)).to.throw();
    expect(() => compose(square, add, NaN)(1, 2)).to.throw();
    expect(() => compose(square, add, '42')(1, 2)).to.throw();
  });

  it('can be seeded with multiple arguments', () => {
    const square = x => x * x;
    const add = (x, y) => x + y;
    expect(compose(square, add)(1, 2)).to.be.equal(9);
  });

  it('returns the first given argument if given no functions', () => {
    expect(compose()(1, 2)).to.be.equal(1);
    expect(compose()(3)).to.be.equal(3);
    expect(compose()()).to.be.equal(undefined);
  });

  it('returns the first function if given only one', () => {
    const fn = () => {};

    expect(compose(fn)).to.be.equal(fn);
  });
});
