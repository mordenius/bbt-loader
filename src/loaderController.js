import LoaderStore from './loaderStore';

class LoaderController {
	constructor(options){
		this.loaderStore = new LoaderStore({initialState: options.loaderList});

		this.state = this.loaderStore.getStore;

		this.unsubscribe = this.loaderStore.subscribe(() => {
			this.state = this.loaderStore.getStore;
			this.changeHandler();
		})

		this.partTypeHandler();
	}

	setCurrentPart(){
		this.state.currentPart = this.state.loaderList[this.state.step].parts[this.state.part];
	}

	changeHandler(){
		if(null != this.state.err) return this.errorHandler();
		if(true == this.state.done) return this.loadSuccess();
		this.partTypeHandler();
	}

	partTypeHandler(){
		this.setCurrentPart();

		switch(this.state.currentPart.type){
			case 'class': this.classHandler(); this.loaderStore.partDone(); break;
			case 'init': this.initHandler(); break;
			case 'data': this.dataHandler(); this.loaderStore.partDone(); break;
		}
	}

	dataHandler(){
		this[this.state.currentPart.name] = this.state.currentPart.controller;
	}
	
	// Создание экземпляра класса
	classHandler(){
		let params = this.getClassParams();
		this[this.state.currentPart.name] = new this.state.currentPart.controller(params);
	}

	// Создание экземпляра класса с инициализацией
	initHandler(){
		this.classHandler();

		this[this.state.currentPart.name].init()
			.then(() => this.loaderStore.partDone())
			.catch((err) => this.loaderStore.setError(err))
	}

	getClassParams(){
		if('undefined' == typeof this.state.currentPart.params || 1 > this.state.currentPart.params.length) return false;

		let params = {};
		this.state.currentPart.params.map((param) => params[param] = this[param])

		return params;
	}

	errorHandler(){
		console.log(this.state.err);
	}

	loadSuccess(){
		console.log('load success');
	}
}

export default LoaderController;