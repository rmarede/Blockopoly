function now () {
    return Date.now();
}

function day() {
    return 1000 * 60 * 60 * 24;
}

function month() {
    return day() * 30;
}

function year() {
    return month() * 12;
}

function ethNow() {
    return Math.floor(Date.now() / 1000);
}

function ethDay() {
    return 60 * 60 * 24;
}

function ethMonth() {
    return ethDay() * 30;
}

function ethYear() {
    return ethMonth() * 12;
}

function timeBetween(date1, date2) {
    return Math.abs(new Date(date1) - new Date(date2));
}

function toDays(value) {
    return Math.floor(value / day());
}

function toMonths(value) {
    return Math.floor(value / month());
}

function toYears(value) {
    return Math.floor(value / year());
}

function toSolidityTime(value) {
    return Math.floor(value / 1000);
}

function fromSolidityTime(value) {
    return value * 1000;
}



module.exports = { day, month, year, timeBetween, toDays, toMonths, toYears, toSolidityTime, fromSolidityTime, ethDay, ethMonth, ethYear, ethNow, now};
