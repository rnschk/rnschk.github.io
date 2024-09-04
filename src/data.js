

function Data() {
    this.begin_temp = '';
    this.outer_temp = '';
    this.sunpower = '';
    this.cloud = '';
    this.window_space = '';
    this.windows_covered_by = '';
    this.minutes = '';
    this.target = '';
}

Data.prototype.is_complete = function () {
    if (this.outer_temp != '' && this.begin_temp != '' && this.sunpower != '' && this.minutes != '') {
        return true;
    }
    return false;
}

Data.prototype.is_incomplete = function () {
    return !this.is_complete();
}

Data.prototype.is_valid = function () {
    this.validate();
    return this.is_complete();
}

Data.prototype.validate = function () {

    // validations

    if (this.begin_temp != '' && this.begin_temp <= 0)
        this.begin_temp = 0;

    if (this.begin_temp >= 50)
        this.begin_temp = 50;

    if (this.outer_temp <= -20)
        this.outer_temp = -20;

    if (this.outer_temp >= 50)
        this.outer_temp = 50;

    if (this.sunpower != '' && this.sunpower <= 0)
        this.sunpower = 0;

    if (this.sunpower >= 2000)
        this.sunpower = 2000;

    if (this.cloud != '' && this.cloud <= 0)
        this.cloud = 0;

    if (this.cloud >= 100)
        this.cloud = 100;

    if (this.window_space != '' && this.window_space <= 0)
        this.window_space = 0;

    if (this.window_space >= 100)
        this.window_space = 100;

    if (this.minutes != '' && this.minutes <= 0)
        this.minutes = 0;

    if (this.minutes >= 60)
        this.minutes = 60;

}
