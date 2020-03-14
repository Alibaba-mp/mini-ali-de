import { expect } from 'chai';
import { flatDeepDiff } from '..';

describe('flatDeepDiff', () => {
  const objOne = {
    a: 1,
    b: {
      c: 2,
      d: 3
    },
    e: 4,
    f: true,
    g: [1, 'two', 3, 'four'],
    h: [1, 'two', 3, 'four'],
    i: true,
    j: null,
    k: 'blue',
    l: [[0, 1], [2, 3]]
  };

  const objTwo = {
    a: 1,
    b: {
      // c: 2,
      d: 30,
      f: 50
    },
    e: 40,
    f: true,
    g: [1, 'two', 3, 'four'],
    h: [1, 'owt', 3, 'four'],
    i: false,
    // j: null,
    // k: null,
    l: [[0, 1], [2, 4]]
  };

  const expected = {
    'b.d': 30,
    'b.c': null,
    'b.f': 50,
    e: 40,
    'h[1]': 'owt',
    i: false,
    // j: null,
    k: null,
    'l[1][1]': 4
  };

  it('should return the diff object between two objects', () => {
    expect(flatDeepDiff(objOne, objTwo)).to.eql(expected);
  });

  it('should throw a new TypeError if the first parameter is not an object', () => {
    const wrongParam = JSON.stringify(objOne);

    expect(() => flatDeepDiff(wrongParam, objTwo)).to.throw(TypeError);
  });

  it('should throw a new TypeError if the second parameter is not an object', () => {
    const wrongParam = JSON.stringify(objTwo);

    expect(() => flatDeepDiff(objOne, wrongParam)).to.throw(TypeError);
  });

  it('should not mutate the objects or reference one of the parameters', () => {
    expect(flatDeepDiff(objOne, objTwo)).to.not.eql(objOne);
    expect(flatDeepDiff(objOne, objTwo)).to.not.eql(objTwo);
  });

  it('should return null if there is no difference between objects', () => {
    expect(flatDeepDiff(objOne, objOne)).to.equal(null);
  });

  it('should behave correctly with an empty object as first parameter', () => {
    expect(flatDeepDiff({}, { a: { b: 2 } })).to.eql({ a: { b: 2 } });
  });
  it('array diff fillKeys fix lunax/lux/issues/10', () => {
    const obj1 = {
      list: [{ a: 1, b: 2 }, { a: 2, b: 3 }]
    };
    const obj2 = {
      list: [{ a: 100 }, { a: 1, b: 2 }, { a: 2, b: 3 }]
    };

    expect(flatDeepDiff(obj1, obj2)).to.eql({
      'list[0].a': 100,
      'list[0].b': null,
      'list[1].a': 1,
      'list[1].b': 2,
      'list[2]': {
        a: 2,
        b: 3
      }
    });
  });

  it(`prev[key] === (undefined && null) && next[key] === undefined -> don't diff`, () => {
    const obj1 = { a: null, b: null, c: 2, d: 100 };
    const obj2 = { c: 3, d: 101 };

    expect(flatDeepDiff(obj1, obj2)).to.eql({
      c: 3,
      d: 101
    });
  });
});
