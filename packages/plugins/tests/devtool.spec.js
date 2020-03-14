import { expect } from 'chai';
import { Store } from '@de2/store';
import { createDevtool } from '..';

describe('plugin-devtool', () => {

	const devtoolHook = {
		on() {},
		emit() {},
	};

  it('devtool plugin instance into Store', function() {
		expect(() => new Store({
			state: {},
			mutations: {},
			actions: {},
			plugins: [createDevtool()]
		})).to.not.throw(Error)
	});
	
	it('devtool by devtoolHook', function() {
		expect(() => new Store({
			state: {},
			mutations: {},
			actions: {},
			plugins: [createDevtool(devtoolHook, false)]
		})).to.not.throw(Error)
  });
});
