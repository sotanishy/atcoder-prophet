const proxy = 'https://cors-anywhere.herokuapp.com/';

function showErrorMessage(message) {
    $('#error').text(message).show();
}

$(document).ready(function () {
    $(document).on('submit', '#form', function () {
        $('#error').hide();

        let username = $('#username').val();
        let weeks = $('#weeks :selected').val();

        if (username === '') {
            showErrorMessage('Please enter a username');
            return false;
        }

        $('#message').show();
        $.getJSON(proxy + 'https://atcoder.jp/users/' + username + '/history/json', function (data) {
            if (data.length == 0) {
                showErrorMessage('Invalid username');
                return;
            }

            let ratings = getWeeklyRatings(data);
            let pred = predict(ratings, weeks);
            let predRatings = [];

            // calculate the rating from the predicted ratio
            let prev = ratings[ratings.length - 1];
            for (let i = 0; i < pred.length; i++) {
                let cur = Math.round(prev * pred[i]);
                predRatings.push(cur);
                prev = cur;
            }

            draw(data, predRatings);

            // add tweet button
            $('#twitter-button').empty();
            let text = 'My rating is predicted to be ' + predRatings[predRatings.length - 1] + ' in ' + weeks + ' weeks!\n';
            $('<a href="https://twitter.com/share?ref_src=twsrc%5Etfw" id="twitter-link" class="twitter-share-button" data-text="' + text + '" data-url="https://sotanishy.github.io/atcoder-prophet" data-hashtags="AtCoderProphet" data-show-count="false">Tweet</a>').appendTo('#twitter-button');
            twttr.widgets.load();
        }).done(function () {
            $('#message').hide();
        });
        return false;
    });
});