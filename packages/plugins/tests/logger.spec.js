import { expect } from 'chai';
import { Store, applyMiddleware } from '@de/store';
import { createLogger, createSetDataLogger, createLoggerMiddleware } from '..';

describe('plugin-devtool', () => {
	const createStore = plugin => new Store({
		state: { count: 1 },
		mutations: {
			updateCount(state, payload) {
				state.count = payload;
			}
		},
		actions: {},
		plugins: [plugin]
	});

  it('createLogger instance into Store', function() {
		const plugin = createLogger();
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', 2);
	});
	
	it('createLogger by predicate', function() {
		const plugin = createLogger({
			predicate: mutation => (mutation && mutation.type === 'update')
		});
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', 2);
  });

  it('createSetDataLogger instance into Store', function() {
		const plugin = createSetDataLogger();
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', 2);

		store.$setDataHook({
			context: { $viewId: 1, data: { count: 1 } },
			nextData: { count: 2 },
			mutation: { type: 'updateCount', payload: 2 },
			diff: { count: 2 }
		}, false);
	});

	it('createSetDataLogger by predicate', function() {
		const plugin = createSetDataLogger({
			predicate: mutation => (mutation && mutation.type === 'update')
		});
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', 2);

		store.$setDataHook({
			context: { $viewId: 1, data: { count: 1 } },
			nextData: { count: 2 },
			mutation: { type: 'updateCount', payload: 2 },
			diff: { count: 2 }
		}, false);
	});
	
	it('createSetDataLogger no mutation', function() {
		const plugin = createSetDataLogger();
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', 2);

		store.$setDataHook({
			context: { $viewId: 1, data: { count: 1 } },
			nextData: { count: 2 },
			diff: { count: 2 }
		}, false);
	});
	
	it('createSetDataLogger by spliceData', function() {
		const plugin = createSetDataLogger();
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', [100, 2, 3], {
			meta: {
				splicePath: 'count',
				spliceData: [0, 1, 100]
			}
		});

		store.$setDataHook({
			context: { $viewId: 1, data: { count: [1, 2, 3] } },
			nextData: { count: [100, 2, 3] },
			mutation: {
				type: 'updateCount',
				payload: [100, 2, 3],
				meta: {
					splicePath: 'count',
					spliceData: [0, 1, 100]
				}
			},
			diff: { 'count[0]': 100 }
		}, true);
	});
	
	it('createSetDataLogger by component', function() {
		const plugin = createSetDataLogger();
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount', 2);

		store.$setDataHook({
			context: { $id: 2, data: { count: 2 } },
			nextData: { count: 2 },
			mutation: { type: 'updateCount', payload: 2 },
			diff: { 'count': 2 }
		}, false);
  });

  it('createLoggerMiddleware instance into Store', function() {
		const plugin = applyMiddleware(createLoggerMiddleware());
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount');
	});
	
	it('createLoggerMiddleware by predicate', function() {
		const plugin = applyMiddleware(createLoggerMiddleware({
			predicate: mutation => (mutation && mutation.type === 'update')
		}));
		expect(() => createStore(plugin)).to.not.throw(Error);

		const store = createStore(plugin);
		store.commit('updateCount');
  });
});
