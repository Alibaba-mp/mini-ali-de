import { expect } from 'chai';
import { getIn, setIn, updateIn, deleteIn } from '..';

function gen() {
  return {
    foo: 'bar',
    such: { perform: { so: { scale: 'leveldb' } } },
    qux: {
      hello: 'world',
      eggs: ['white egg', 'brown egg'],
      'delicious fruits :)': ['grape', 'orange', 'carrot']
    },
    'foods I love': ['hamsi', 'lahmacun']
  };
}

describe('helper-curd', () => {
  it('getIn: returns the value of given key', function() {
    expect(getIn(gen(), 'foo')).to.be.equal('bar');
  });

  it('getIn: returns the undefined of nonexistent key', function() {
    expect(getIn(gen(), 'qux.eggs[2]')).to.be.equal(undefined);
  });

  it('getIn: parses object paths and returns the value', function() {
    expect(getIn(gen(), 'qux.hello')).to.be.equal('world');
    expect(getIn(gen(), 'such.perform.so.scale')).to.be.equal('leveldb');
  });

  it('getIn: returns undefined for non existing paths', function() {
    expect(getIn(gen(), 'foo.bar.qux')).to.be.equal(undefined);
    expect(getIn(gen(), '@foo')).to.be.equal(undefined);
  });

  it('getIn: reads list contents, as well', function() {
    expect(getIn(gen(), 'qux.eggs[0]')).to.be.equal('white egg');
    expect(getIn(gen(), 'qux.eggs[1]')).to.be.equal('brown egg');
    expect(getIn(gen(), 'foods I love[0]')).to.be.equal('hamsi');
    expect(getIn(gen(), 'foods I love[1]')).to.be.equal('lahmacun');
  });

  it("getIn: doesn't matter if keys with special characters are given", function() {
    expect(getIn(gen(), 'qux.delicious fruits :)[0]')).to.be.equal('grape');
    expect(getIn(gen(), 'qux.delicious fruits :)[2]')).to.be.equal('carrot');
  });

  it('setIn: set the value of given key', function() {
    const context = gen();
    setIn(context, 'foo', 'new-bar');
    expect(context.foo).to.be.equal('new-bar');
  });

  it('setIn: set the value of given object paths key', function() {
    const context = gen();
    setIn(context, 'qux.hello', 'new-world');
    expect(context.qux.hello).to.be.equal('new-world');
    setIn(context, 'such.perform.so.scale', 'new-leveldb');
    expect(context.such.perform.so.scale).to.be.equal('new-leveldb');
  });

  it('setIn: set the value of given list key', function() {
    const context = gen();
    setIn(context, 'qux.eggs[0]', 'new-white egg');
    expect(context.qux.eggs[0]).to.be.equal('new-white egg');

    setIn(context, 'foods I love[1]', 'new-lahmacun');
    expect(context['foods I love'][1]).to.be.equal('new-lahmacun');

    setIn(context, 'qux.delicious fruits :)[2]', 'new-carrot');
    expect(context.qux['delicious fruits :)'][2]).to.be.equal('new-carrot');
  });

  it('setIn: set the value of given nonexistent key', function() {
    const context = gen();
    setIn(context, 'qux.eggs[2]', 'red egg');
    expect(context.qux.eggs[2]).to.be.equal('red egg');

    setIn(context, 'qux.xxx', 'xxx');
    expect(context.qux.xxx).to.be.equal('xxx');

    setIn(context, 'qux.test1.test2.test3', 'test3');
    expect(context.qux.test1.test2.test3).to.be.equal('test3');
  });

  it('updateIn: update the value of given nonexistent key', function() {
    const context = gen();
    updateIn(context, 'qux.eggs[2]', 'red egg');
    expect(context.qux.eggs).to.be.eql(['white egg', 'brown egg']);

    updateIn(context, 'qux.x.xx', 'xxx');
    expect(context.qux.x).to.be.equal(undefined);
  });

  it('deleteIn: delete given key', function() {
    const context = gen();
    deleteIn(context, 'qux.eggs[1]');
    expect(context.qux.eggs).to.be.eql(['white egg']);

    deleteIn(context, 'qux.hello');
    expect(context.qux).to.not.have.property('hello');
  });
});
