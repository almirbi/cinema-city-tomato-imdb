var moviesDom = document.getElementsByClassName("filmic");
var extensionId = chrome.runtime.id;

var movies = [];



for (var i = 0; i < moviesDom.length; i++) {
    var pElement = moviesDom[i].getElementsByTagName('p')[0];
    pElement = pElement.cloneNode(true);
    var unwantedElements = pElement.getElementsByTagName('strong');
    for (var j = 0; j < unwantedElements.length; j++) {
        pElement.removeChild(unwantedElements[0]);
    }
    var lines = pElement.textContent.split('\n');
    var tmpMovie = {
        movieTitle:lines[0].toLowerCase().trim(),
        director:lines[1].toLowerCase().trim(),
        filmicNumber: i
    };
    movies.push(tmpMovie);

    var ratingDiv = document.createElement('DIV');
    ratingDiv.className = 'ratings';
    ratingDiv.title = 'Click to go to IMDB page of this movie.';

    var imdbImage = document.createElement('IMG');
    imdbImage.src = 'chrome-extension://' + extensionId + '/imdb.png';
    imdbImage.width = 50;
    imdbImage.className = 'imdb-image';

    var imdbRating = document.createElement('P');
    imdbRating.className = 'imdb';

    var tomatoImage = document.createElement('IMG');
    tomatoImage.src = 'chrome-extension://' + extensionId + '/tomato.png';
    tomatoImage.width = 22;
    tomatoImage.className = 'tomato-image';

    var tomatoRating = document.createElement('P');
    tomatoRating.className = 'tomato';

    var spinner = document.createElement('IMG');
    spinner.src = 'chrome-extension://' + extensionId + '/ajax-loader.gif';
    spinner.className = 'spinner';

    imdbRating.appendChild(spinner);

    var spinner = document.createElement('IMG');
    spinner.src = 'chrome-extension://' + extensionId + '/ajax-loader.gif';
    spinner.className = 'spinner';

    tomatoRating.appendChild(spinner);

    ratingDiv.appendChild(imdbImage);
    ratingDiv.appendChild(imdbRating);
    ratingDiv.appendChild(tomatoImage);
    ratingDiv.appendChild(tomatoRating);

    moviesDom[i].appendChild(ratingDiv);
}

for (i = 0; i < movies.length; i++) {
    getOmdbMovieInfo(
        'http://www.omdbapi.com/?t=' + movies[i].movieTitle + '&y=&plot=full&r=json&tomatoes=true&type=movie',
        movies[i]
    );
}

var finishedLoading = 0;
var total = movies.length;

function addSortButtons() {
    var dani = document.getElementById('dani');

    var sortByTomato = document.createElement('button');
    sortByTomato.type = 'button';
    sortByTomato.className = 'sort-ratings-button';
    sortByTomato.id = 'sort-tomato';
    sortByTomato.innerHTML = 'Sort by Tomatoes rating';
    dani.parentNode.insertBefore(sortByTomato, dani.nextSibling);
    sortByTomato.addEventListener('click', function(e) {
        sortByRating('tomato');
        sortByTomato.className = 'sort-ratings-button active';
        sortByImdb.className = 'sort-ratings-button';
    });

    var sortByImdb = document.createElement('button');
    sortByImdb.type = 'button';
    sortByImdb.className = 'sort-ratings-button';
    sortByImdb.id = 'sort-imdb';
    sortByImdb.innerHTML = 'Sort by IMDB rating';
    dani.parentNode.insertBefore(sortByImdb, dani.nextSibling);
    sortByImdb.addEventListener('click', function(e) {
        sortByRating('imdb');
        sortByImdb.className = 'sort-ratings-button active';
        sortByTomato.className = 'sort-ratings-button';
    });
}



function getOmdbMovieInfo(url, movie) {
    var x = new XMLHttpRequest();
    x.open('GET', url);
    x.responseType = 'json';
    x.onload = function() {
        var imdb = moviesDom[movie.filmicNumber].getElementsByClassName('imdb')[0];
        var tomato = moviesDom[movie.filmicNumber].getElementsByClassName('tomato')[0];
        var imdbImage = moviesDom[movie.filmicNumber].getElementsByClassName('imdb-image')[0];
        var tomatoImage = moviesDom[movie.filmicNumber].getElementsByClassName('tomato-image')[0];

        if (!x.response.imdbRating) {
            var imdbRating = 'n/a';
            imdb.className = 'no-info imdb';
        } else if('n/a' == x.response.imdbRating.toLowerCase()) {
            var imdbRating = 'n/a';
            imdb.className = 'no-info imdb';
        } else {
            var imdbRating = x.response.imdbRating;
        }
        if (!x.response.tomatoMeter) {
            var tomatoRating = 'n/a';
            tomato.className = 'no-info tomato';
        } else if ('n/a' == x.response.tomatoMeter.toLowerCase()) {
            var tomatoRating = 'n/a';
            tomato.className = 'no-info tomato';
        } else {
            var tomatoRating = x.response.tomatoMeter + '%';
        }

        addClickListeners([tomato, tomatoImage, imdb, imdbImage], x.response.imdbID);
        imdb.innerHTML = imdbRating.toLowerCase();
        tomato.innerHTML = tomatoRating.toLowerCase();

        movie.response = x.response;
        movie.imdbNode = imdb;
        movie.tomatoNode = tomato;
        movie.imdbImageNode = imdbImage;
        movie.tomatoImageNode = tomatoImage;
        if (++finishedLoading == total) {
            addSortButtons();
        }
    };
    x.onerror = function() {
        console.log('Network error.');
    };
    x.send();
}

function addClickListeners(items, id) {
    for (var i = 0; i < items.length; i++) {
        items[i].addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.open('http://www.imdb.com/title/' + id,'_blank');
        });
    }
}

function compareImdb(a,b) {

    if (!a.response.imdbRating || 'n/a' == a.response.imdbRating.toLowerCase()) {
        var ratingA = -1.0;
    } else {
        ratingA = parseFloat(a.response.imdbRating);
    }

    if (!b.response.imdbRating || 'n/a' == b.response.imdbRating.toLowerCase()) {
        var ratingb = -1.0;
    } else {
        ratingb = parseFloat(b.response.imdbRating);
    }

    if ( ratingA < ratingb)
        return 1;
    return -1;
}

function compareTomato(a,b) {

    if (!a.response.tomatoMeter || 'n/a' == a.response.tomatoMeter.toLowerCase()) {
        var ratingA = -1.0;
    } else {
        ratingA = parseFloat(a.response.tomatoMeter);
    }

    if (!b.response.tomatoMeter || 'n/a' == b.response.tomatoMeter.toLowerCase()) {
        var ratingb = -1.0;
    } else {
        ratingb = parseFloat(b.response.tomatoMeter);
    }

    if ( ratingA < ratingb)
        return 1;
    return -1;
}

function sortByRating(provider) {
    var program = document.getElementsByClassName('program')[0];
    var filmici = program.getElementsByClassName('filmic');
    var filmiciClones = [];

    //clones all movies
    for (var i = 0; i < filmici.length; i++) {
        filmiciClones.push(filmici[i].cloneNode(true));
    }


    //remove all movies from the DOM
    var lengthOriginal = filmici.length;
    for (var i = 0; i < lengthOriginal; i++) {
        program.removeChild(filmici[0]);
    }



    //sort the movies
    if ('imdb' == provider) {
        movies.sort(compareImdb);
    } else {
        movies.sort(compareTomato);
    }


    //return sorted movies to the DOM in a sorted order
    for (var i = 0; i < movies.length; i++) {

        var tmp = filmiciClones[movies[i].filmicNumber];
        program.appendChild(tmp);
        addClickListeners([
                tmp.getElementsByClassName('imdb')[0],
                tmp.getElementsByClassName('tomato')[0],
                tmp.getElementsByClassName('imdb-image')[0],
                tmp.getElementsByClassName('tomato-image')[0]],
            movies[i].response.imdbID);
        movies[i].filmicNumber = i;
    }
}