import Store from 'beedle';
import { get, post } from './requests';

let _saveUrl;
let _onPost;
let _onLoad;

// work flow when an element been dropped
// UpdateOrder => setData(context, data, saveData) => setData(state, payload) => post
const store = new Store({
	actions: {
		// context: Store
		// data: dropped form element
		// saveData: true/false
		setData(context, data, saveData) {
			// when an element been dropped. This function will be called
			context.commit('setData', data);
			if (saveData) this.save(data);
		},

		// when form opens
		load(context, { loadUrl, saveUrl, data }) {
			_saveUrl = saveUrl;
			if (_onLoad) {
				_onLoad(responseData => {
					this.setData(context, responseData);
				});
			} else if (loadUrl) {
				get(loadUrl).then(x => {
					if (data && data.length > 0 && x.length === 0) {
						data.forEach(y => x.push(y));
					}
					this.setData(context, x);
				});
			} else {
				this.setData(context, data);
			}
		},

		create(context, element) {
			const { data } = context.state;
			data.push(element);
			this.setData(context, data, true);
		},

		delete(context, element) {
			const { data } = context.state;
			data.splice(data.indexOf(element), 1);
			this.setData(context, data, true);
		},

		// Drop an item
		updateOrder(context, elements) {
			this.setData(context, elements, true);
		},

		save(data) {
			if (_onPost) {
				_onPost({ task_data: data });
			} else if (_saveUrl) {
				post(_saveUrl, { task_data: data });
			}
		}
	},

	mutations: {
		setData(state, payload) {
			// eslint-disable-next-line no-param-reassign
			state.data = payload;
			return state;
		}
	},

	initialState: {
		data: []
	}
});

store.setExternalHandler = (onLoad, onPost) => {
	_onLoad = onLoad;
	_onPost = onPost;
};

export default store;
