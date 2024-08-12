class StepFlowProtocol extends BaseProtocol{
	constructor(){
		super('step/flow');
	}

	async getStepFlowData(code, step, logFlow, parameter){
		return await this.callGET(`data/get/${code}/${step}/${logFlow}`, parameter);
	}

	async getStepFlowDataForVisual(code, step, logFlow, parameter){
		return await this.callGET(`data/for/visual/get/${code}/${step}/${logFlow}`, parameter);
	}

	async checkStepFlowEnable(code, step, logFlow, parameter){
		return await this.callGET(`check/enable/${code}/${step}/${logFlow}`, parameter);
	}

	async checkStepFlowVisible(code, step, logFlow, parameter){
		return await this.callGET(`check/visible/${code}/${step}/${logFlow}`, parameter);
	}

	async getAllStepFlowData(code, logFlow, parameter){
		return await this.callGET(`data/all/get/${code}/${logFlow}`, parameter);
	}

	async getAllStepFlowDataGroupByModel(code, logFlow, parameter){
		return await this.callGET(`data/group/by/model/get/${code}/${logFlow}`, parameter);
	}
}