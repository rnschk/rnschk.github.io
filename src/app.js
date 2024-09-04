// window.jQuery = $ = require('jquery')
// require('bootstrap/dist/js/bootstrap')
// require('../node_modules/bootstrap/dist/css/bootstrap.min.css')
// require('../css/style.min.css');
// var Chart = require('chart.js');
// var Data = require('./data.js');
// var WOW = require('wow.js');

var data = new Data();

$(document).ready(function () {
    init();
    chart = blank_chart();
});

function init() {
    //var version = require('../package.json').version
    //$('#version').html('v'+version);
    
    // wow
    new WOW().init();

    // tooltips
    $('[data-toggle="tooltip"]').tooltip();


    // inputs
    $('#begin_temp_id').change(function () {
        data.begin_temp = $('#begin_temp_id').val();
        update();
    });

    $('#outer_temp_id').change(function () {
        data.outer_temp = $('#outer_temp_id').val();
        update();
    });

    $('#sunpower_id').change(function () {
        data.sunpower = $('#sunpower_id').val();
        update();
    });

    $('#cloud_id').change(function () {
        data.cloud = $('#cloud_id').val();
        $("#sunpower_id").val(sunpower_by_clouds());
        update();
    });

    $('#window_space_id').change(function () {
        data.window_space = $('#window_space_id').val();
        update();
    });

    $('input[name="windows_covered"]').change(function () {
        data.windows_covered_by = $('input[name="windows_covered"]:checked').val();
        update();
    });

    $('#minutes_id').change(function () {
        data.minutes = $('#minutes_id').val();
        update();
    });


    // buttons
    $('#btn_cloud_id').click(function () {
        toggle_calc_by_cloud();
    });

    $('#btn_cover_id').click(function () {
        toggle_window_covered();
    });

    $('#btn_berechnen_id').click(function () {
        validate_by_button();
    });


    // doggo
    $('#doggo_id').click(function () {
        $('#doggo_id').hide();
    });


    // mails
    $('#mail_tle').click(function () {
        n('nbjmup;mjfojoh.fxfsuApvumppl/bu');
    });

    $('#mail_fr').click(function () {
        n('nbjmup;sotdilAhnbjm/dpn');
    });

}


function toggle_calc_by_cloud() {
    $('#btn_cloud_id').toggleClass('btn-secondary');
    $('#calc_by_cloud_ui').toggle();
    $('#sunpower_id').prop('disabled', function (i, v) { return !v; });
    data.cloud = '';
    update(data);
}

function toggle_window_covered() {
    $('#btn_cover_id').toggleClass('btn-secondary');
    $('#windows_covered_ui').toggle();
    $('input[name="windows_covered"]:checked').prop('checked', false);
    data.windows_covered_by = '';
    update(data);
}

function update() {
    data.validate();
    update_temperature_chart();
    result_to_view();
}

function validate_by_button() {
    if (!data.is_valid()) {
        $("#notifications").show();
    }
}

function result_to_view() {
    $("#begin_temp_id").val(data.begin_temp);
    $("#outer_temp_id").val(data.outer_temp);
    $("#sunpower_id").val(data.sunpower);
    $("#cloud_id").val(data.cloud);
    $("#window_space_id").val(data.window_space);
    $("#minutes_id").val(data.minutes);

    if (data.is_valid()) {
        $("#balanced_temperature_id").val(balanced_temperature());
        $("#leaked_temperature_id").val(leaked_temperature_by_windows_space());
        $("#target_temperature_id").val(final_temperature_after_minutes(data.minutes));
        $("#target_temperature_label").text('Berechnete Temperatur nach ' + data.minutes + ' Minuten in °C');
        $("#notifications").hide();
    } else {
        $("#balanced_temperature_id").val('');
        $("#leaked_temperature_id").val('');
        $("#target_temperature_id").val('');
        $("#target_temperature_label").text('Berechnete Temperatur in °C');
    }
}


// calculate temperature after a given amount of minutes
function temperature_after_given_minutes(minutes) {
    if (data.is_incomplete()) {
        return '';
    }

    balance = balanced_temperature();
    target_temperature = (parseFloat(data.begin_temp) * parseFloat(balance)) / ((parseFloat(data.begin_temp) +
        (parseFloat(balance) - parseFloat(data.begin_temp)) * Math.pow(Math.E, parseFloat(-balance) * 0.0023 * parseFloat(minutes))))
    return target_temperature.toFixed(2);
}


// calculate dataset of temperatures for (global) interval
function temperature_after_given_minutes_dataset() {
    dataset = [];
    interval.forEach(function (item) {
        dataset.push(temperature_after_given_minutes(item));
    });
    return dataset;
}


// calculate 'sunpower by clouds' using formula = (-0,141*%-0,089*Außentemp+28,3)/0,036
function sunpower_by_clouds() {
    //if (data.cloud == '')
    //    return '';
    result = ((-0.141 * data.cloud) - (0.089 * data.outer_temp) + 28.3) / 0.036;
    data.sunpower = result.toFixed(0);
    return data.sunpower;
}


// calculate 'gleichgewichtstemperatur' using formula
function balanced_temperature() {
    if (data.is_incomplete()) {
        return '';
    }
    result = ((0.036 * data.sunpower) + (1.02 * data.outer_temp) + 8.8 - parseFloat(impact_covered_windows(data)));
    return result.toFixed(2);
}


// calculate (and inverted) temperature-difference (in °K) that is leaked after the amount of time in data-object
function leaked_temperature_by_windows_space() {
    if (data.is_incomplete()) {
        return '';
    }
    return -leaked_temperature_by_windows_space_after_minutes(data.minutes);
}


// calculate temperature-difference (in °K) that is leaked after a given amount of time (in minutes)
function leaked_temperature_by_windows_space_after_minutes(minutes) {
    temp_after_m = parseFloat(temperature_after_given_minutes(minutes));
    space = data.window_space == '' ? 0 : parseFloat(data.window_space);
    result = (temp_after_m * parseFloat(data.outer_temp)) / ((temp_after_m + (parseFloat(data.outer_temp) -
        temp_after_m) * Math.pow(Math.E, parseFloat(-data.outer_temp) * 0.00269 * space))) - temp_after_m;
    return result.toFixed(2);
}



// calculate dataset of temperature-differences for (global) interval
function leaked_temperature_by_windows_space_after_minutes_dataset() {
    dataset = [];
    interval.forEach(function (item) {
        dataset.push(leaked_temperature_by_windows_space_after_minutes(item));
    });
    return dataset;
}


// inpact of covered windows
function impact_covered_windows() {
    if (data.windows_covered_by == 'paper') {
        return 6;
    }
    if (data.windows_covered_by == 'linen') {
        return 7.5;
    }
    if (data.windows_covered_by == 'foil') {
        return 11;
    }
    return 0;
}


// calculate the final temperature after a given amount of time
function final_temperature_after_minutes(minutes) {
    var result = parseFloat(temperature_after_given_minutes(minutes))
        + parseFloat(leaked_temperature_by_windows_space_after_minutes(minutes));
    if (isNaN(result))
        return '';
    return result.toFixed(2);
}


// calculate dataset of final temperatures in given (global) interval
function final_temperature_after_minutes_dataset() {
    dataset = [];
    interval.forEach(function (item) {
        dataset.push(final_temperature_after_minutes(item));
    });
    return dataset;
}


// assemble complete Chart-object from given data
function update_temperature_chart() {
    if (data.is_valid()) {
        chart.data.datasets[0].data = final_temperature_after_minutes_dataset();
        chart.data.datasets[1].data = temperature_after_given_minutes_dataset();
        chart.data.datasets[2].data = leaked_temperature_by_windows_space_after_minutes_dataset();
        chart.update();
    }
}


function blank_chart() {
    if ($("#heat_progress_chart").length) {
        return new Chart($('#heat_progress_chart'), {
            type: 'line',
            options: chart_options, // see chart_options.js 
            data: {
                labels: interval,
                datasets: blank_data_sets()
            }
        });
    }
}


function blank_data_sets() {
    return [{
        label: 'Innentemperatur (°C)',
        borderColor: '#c45850',
        backgroundColor: 'rgba(60, 186, 159, 0.2)',
        fill: '+1',

    }, {
        label: 'Temperaturentwicklung (°C)',
        borderColor: "#3e95cd",
        borderDash: [5, 5],
        fill: false
    }, {
        label: 'Temperaturentweichung (°K)',
        borderColor: "#3cba9f",
        borderDash: [5, 5],
        fill: false
    }]
}

var interval = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

var chart_options = {
    legend: {
        position: 'bottom',
        labels: {
            fontSize: 14,
        }
    },
    maintainAspectRatio: false,
    scales: {
        xAxes: [{
            display: true,
            ticks: {
                fontSize: 14,
                beginAtZero: true,
                suggestedMax: 60,
                suggestedMin: 0,
                stepSize: 2,
                callback: function (value, index, values) {
                    return value + ' min';
                }
            }
        }],
        yAxes: [{
            display: true,
            ticks: {
                fontSize: 14,
                beginAtZero: true,
                suggestedMax: 70,
                suggestedMin: -20,
                callback: function (value, index, values) {
                    return value + ' °C';
                }
            }
        }]
    },
    tooltips: {
        bodyFontSize: 18,
        callbacks: {
            title: function (tooltipItem, data) {
                return '';
            },
            label: function (tooltipItem, data) {
                return ' ' + tooltipItem.yLabel + ' °C';
            }
        }
    }
}

function r(n) {
    var r = 0;
    var i = "";
    for (var o = 0; o < n.length; o++) {
        r = n.charCodeAt(o);
        if (r >= 8364) {
            r = 128
        }
        i += String.fromCharCode(r - 1)
    }
    return i
}

function n(n) {
    location.href = r(n)
}
