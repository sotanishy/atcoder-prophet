let model;
(async () => {
    model = await tf.loadLayersModel('model/model.json');
})();

function countDays(date) {
    return Math.floor(date / 8.64e7);
}

function getDate(days) {
    return new Date(days * 8.64e7);
}

function getWeeklyRatings(data) {
    let dates = [], ratings = [];
    data.forEach(d => {
        if (!d['IsRated']) return;
        dates.push(countDays(new Date(d['EndTime'])));
        ratings.push(d['NewRating']);
    });

    dates.push(dates[dates.length - 1] + 1);
    ratings.push(ratings[ratings.length - 1]);

    let weekly = [];
    for (let i = 0; i < dates.length - 1; i++) {
        let t1 = dates[i], t2 = dates[i+1];
        let r1 = ratings[i], r2 = ratings[i+1];
        if (t1 == t2) continue;
        let slope = (r2 - r1) / (t2 - t1);
        let t = t1;
        while (getDate(t).getDay() != 6) t++;
        while (t < t2) {
            weekly.push(r1 + slope * (t - t1));
            t += 7;
        }
    }
    return weekly;
}

const mean = 1.04986091;
const stddev = Math.sqrt(0.03125401);
const nSteps = 20;
const shape = [1, nSteps, 1];

function predict(ratings, weeks) {
    // preprocess
    let data = [(1 - mean) / stddev];
    for (let i = 0; i < ratings.length - 1; i++) {
        let d;
        if (ratings[i] == 0) d = ratings[i+1];
        else d = Math.min(ratings[i+1] / ratings[i], 3);
        data.push((d - mean) / stddev);
    }

    // add missing values
    while (data.length < nSteps) data.unshift((1 - mean) / stddev);

    // predict
    data = data.slice(data.length - nSteps);
    let pred = [];
    for (let i = 0; i < weeks; i++) {
        let p = model.predict(tf.tensor(data, shape)).dataSync()[0];
        data.push(p);
        data.shift();
        pred.push(p * stddev + mean);
    }
    return pred;
}