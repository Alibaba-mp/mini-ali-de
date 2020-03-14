import { expect } from 'chai';
import { isObject, isArray, isEmpty, isRealObject } from '..';

describe('util-is', () => {
	it('isObject, isArray, isEmpty, isRealObject', function() {
    expect(isObject({})).to.be.eql(true);
    expect(isObject([])).to.be.eql(false);
    expect(isObject(null)).to.be.eql(false);

    expect(isArray([])).to.be.eql(true);
    expect(isArray({})).to.be.eql(false);

    expect(isEmpty({})).to.be.eql(true);
    expect(isEmpty({ a: 1 })).to.be.eql(false);

    expect(isRealObject({ a: 1 })).to.be.eql(true);
    expect(isRealObject({})).to.be.eql(false);
  });
});
