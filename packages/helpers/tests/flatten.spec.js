import { expect } from 'chai';
import { flattenObject } from '..';

describe('helper-flatten', () => {
  it('only flatten nested objects', function() {
    var obj = {
      number: 1,
      string: 'foo',
      bool: true,
      arr1: [1, 2, 3],
      arr2: [{ foo: 1 }, { bar: 2 }],
      sub: { foo: 1, bar: { baz: 3 } }
    };

    expect(flattenObject(obj)).to.be.eql({
      number: 1,
      string: 'foo',
      bool: true,
      arr1: [1, 2, 3],
      arr2: [{ foo: 1 }, { bar: 2 }],
      'sub.foo': 1,
      'sub.bar.baz': 3
    });
  });
});
