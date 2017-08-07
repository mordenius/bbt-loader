import forEach from "lodash/forEach";
import assign from "lodash/assign";
import LoaderStore from "./loaderStore";

class LoaderController {
	constructor(options) {
		this.loaderStore = new LoaderStore({ initialState: options.loaderList });

		this.state = this.loaderStore.getStore;

		this.unsubscribe = this.loaderStore.subscribe(() => {
			this.state = this.loaderStore.getStore;
			this.changeHandler();
		});

		this.partTypeHandler();
	}

	setCurrentPart() {
		this.state.currentPart = this.state.loaderList[this.state.step].parts[
			this.state.part
		];
	}

	changeHandler() {
		if (this.state.err != null) this.errorHandler();
		else if (this.state.done === true) LoaderController.loadSuccess();
		else this.partTypeHandler();
	}

	partTypeHandler() {
		this.setCurrentPart();

		switch (this.state.currentPart.type) {
			case "class":
				this.classHandler();
				this.loaderStore.partDone();
				break;
			case "init":
				this.initHandler();
				break;
			case "data":
				this.dataHandler();
				this.loaderStore.partDone();
				break;
			default:
				break;
		}
	}

	dataHandler() {
		this[this.state.currentPart.name] = this.state.currentPart.controller;
	}

	// Создание экземпляра класса
	classHandler() {
		const params = this.getClassParams();
		this[this.state.currentPart.name] = new this.state.currentPart.controller( //eslint-disable-line
			params
		);
	}

	// Создание экземпляра класса с инициализацией
	initHandler() {
		this.classHandler();

		this[this.state.currentPart.name]
			.init()
			.then(() => this.loaderStore.partDone())
			.catch(err => this.loaderStore.setError(err));
	}

	getClassParams() {
		if (
			typeof this.state.currentPart.params === "undefined" ||
			this.state.currentPart.params.length < 1
		)
			return false;

		const params = {};
		forEach(this.state.currentPart.params, param => {
			if (typeof param === "string") {
				if (param === "selfName")
					assign(params, { name: this.state.currentPart.name });
				else params[param] = this[param];
			} else if (typeof param === "object") assign(params, param);
		});

		return params;
	}

	errorHandler() {
		global.console.error(`BBT-Loader: ${this.state.err}`);
	}

	static loadSuccess() {
		global.console.log("BBT-Loader: load success!");
	}
}

export default LoaderController;
