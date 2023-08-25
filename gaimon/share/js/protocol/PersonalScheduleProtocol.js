const PersonalScheduleProtocol = function(main) {

    this.getPersonalSchedule = async function(startTime) {
        let results = []
        let response = await POST('personal/schedule/get', {startTime});
        if (response == undefined)  return results;
        if (response.isSuccess) return response.results;
        return results;
    }

    this.updatePersonalSchedule = async function(data) {
        let response = await POST('personal/schedule/update', data);
        if (response == undefined) return false;
        return response.isSuccess
    }
}