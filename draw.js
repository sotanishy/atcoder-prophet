const colors = [
    { color:'#808080', min:0,    max:399  },
    { color:'#804000', min:400,  max:799  },
    { color:'#008000', min:800,  max:1199 },
    { color:'#00C0C0', min:1200, max:1599 },
    { color:'#0000FF', min:1600, max:1999 },
    { color:'#C0C000', min:2000, max:2399 },
    { color:'#FF8000', min:2400, max:2799 },
    { color:'#FF0000', min:2800, max:9999 }
];

let chart;

function getColor(rating) {
    for (let i = 0; i < colors.length; i++) {
        if (colors[i].min <= rating && rating <= colors[i].max) {
            return colors[i].color;
        }
    }
    return '#000000';
}

function draw(data, pred) {
    let datasets = [{
        label: 'Rating',
        data: [],
        pointBackgroundColor: [],
        pointBorderColor: [],
        borderColor: "#3e95cd",
        fill: false,
        pointRadius: 5,
        borderWidth: 2,
    }, {
        label: 'Prediction',
        data: [],
        pointBackgroundColor: [],
        pointBorderColor: [],
        borderColor: "#F552DF",
        fill: false,
        pointRadius: 5,
        borderWidth: 2,
    }];

    // add rating data to the dataset
    data.forEach(d => {
        if (!d['IsRated']) return;
        let r = d['NewRating'];
        datasets[0].data.push({
            x: new Date(d['EndTime']),
            y: r
        });
        let c = getColor(r);
        datasets[0].pointBackgroundColor.push(c + '80');
        datasets[0].pointBorderColor.push(c);
    });

    // next Saturday
    let day = new Date();
    day.setDate(day.getDate() + (6 - day.getDay()));

    let dates = [], predRatings = [];
    for (let i = 0; i < pred.length / 2; i++) {
        dates.push(new Date(day.getTime()));
        day.setDate(day.getDate() + 14);
        predRatings.push(pred[i * 2]);
    }

    // add prediction to the dataset
    for (let i = 0; i < dates.length; i++) {
        datasets[1].data.push({
            x: dates[i],
            y: predRatings[i],
        });
        let c = getColor(predRatings[i]);
        datasets[1].pointBackgroundColor.push(c + '80');
        datasets[1].pointBorderColor.push(c);
    }

    // the number of days between the first day and the last day
    let range = countDays(day.getTime() - new Date(data[0]['EndTime']).getTime());

    // draw the chart
    let ctx = document.getElementById('chart').getContext('2d');
    if (chart !== undefined) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: datasets
        },
        options: {
            elements: {
                line: {
                    tension: 0
                }
            },
            scales: {
                xAxes: [{
                    offset: true,
                    type: 'time',
                    time: {
                        unit: 'day',
                        stepSize: Math.floor(range / 10),
                        displayFormats: {
                            day: 'YYYY-MM-DD'
                        }
                    }
                }],
                yAxes: [{
                    ticks: {
                        stepSize: 400,
                    }
                }]
            }
        }
    });
}