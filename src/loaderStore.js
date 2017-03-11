import {StoreClass} from 'redux-store-controller';

class LoaderStore extends StoreClass {
	constructor(options){
		super({err: null, step: 0, part: 0, done: false, loaderList: options.initialState});
	}

	update(state, action){
		switch(action.type){
			case 'PART':
				state.loaderList[state.step].parts[state.part].isLoaded = true;
				state.part++;

				let stepLoadedParts = state.loaderList[state.step].parts.filter((el) => (el.isLoaded));
				if(state.loaderList[state.step].parts.length == stepLoadedParts.length) {
					state.loaderList[state.step].isLoaded = true;
					state.step++;
					state.part = 0
				}

				let stepLoaded = state.loaderList.filter((el) => (el.isLoaded));
				if(state.loaderList.length == stepLoaded.length) state.done = true;
				break;
			case 'HANDLED_ERROR': state.err = action.err; break;
			default: return state; break;
		}

		return state;
	}

	partDone(){
		this._store.dispatch({type: 'PART'})
	}

	setError(err){
		this._store.dispatch({type: 'HANDLED_ERROR', err: err})
	}
}

export default LoaderStore;