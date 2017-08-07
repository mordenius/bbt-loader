import { StoreClass } from "redux-store-controller";

class LoaderStore extends StoreClass {
	constructor(options) {
		super({
			initState: {
				err: null,
				step: 0,
				part: 0,
				done: false,
				loaderList: options.initialState
			}
		});
	}

	update(state, action) {
		switch (action.type) {
			case "PART":
			case "HANDLED_ERROR":
				return action.data;
			default:
				return state;
		}
	}

	partDone() {
		const state = this.getStore;
		state.loaderList[state.step].parts[state.part].isLoaded = true;
		state.part += 1;

		const stepLoadedParts = state.loaderList[state.step].parts.filter(
			el => el.isLoaded
		);
		if (state.loaderList[state.step].parts.length === stepLoadedParts.length) {
			state.loaderList[state.step].isLoaded = true;
			state.step += 1;
			state.part = 0;
		}

		const stepLoaded = state.loaderList.filter(el => el.isLoaded);
		if (state.loaderList.length === stepLoaded.length) state.done = true;
		this._store.dispatch({ type: "PART", data: state });
	}

	setError(error) {
		const state = this.getStore;
		state.err = error;
		this._store.dispatch({ type: "HANDLED_ERROR", data: state });
	}
}

export default LoaderStore;
