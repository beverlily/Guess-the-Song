let token = "";
let songTitle = "";
let score = 0;

//Referenced https://stackoverflow.com/questions/1527803/generating-random-whole-numbers-in-javascript-in-a-specific-range
const getRandomInt = (min, max) => {
    //generates random integer, min and max inclusive
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//Referenced https://developer.musixmatch.com/documentation/api-reference/track-search
//Searches for id of a track given artist name and track title, has a f_has_lyrics flag set to 1 so that only tracks that have lyrics will show
const getTrackId = (artist, title) => {
    const url = `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.search?q_artist=${encodeURI(artist)}&q_track=${title}&f_has_lyrics=1&apikey=`;

    const header = {
        "Content-Type": "application/json"
    }

    const request = new Request(url, {
        method: "GET",
        headers: header
    });

    return new Promise((resolve, reject) => {
        fetch(request)
            .then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                    throw ("Bad status");
                }
            }).then(res => {
                console.log(res);
                const track = res.message.body.track_list;
                //No lyrics exist for this track
                if (track.length === 0) {
                    throw ("No lyrics found");
                } else {
                    const trackId = track[0].track.track_id;
                    console.log(trackId);
                    resolve(trackId);
                }
            }).catch(e => {
                console.log(e);
                clear();
                if (e === "Bad status") {
                    $("#error-message").html("Oops! Something went wrong. Please try again.");
                } else {
                    $("#error-message").html("No lyrics found. Please enter a new artist or try again.");
                }
            })
    })
}

const getLyrics = (trackId) => {
    const url = `https://cors-anywhere.herokuapp.com/http://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=`;

    const header = {
        "Content-Type": "application/json"
    };

    const request = new Request(url, {
        method: "GET",
        headers: header
    });

    fetch(request)
        .then(res => {
            if (res.status === 200) {
                return res.json();
            }
        }).then(res => {
            console.log(res);
            //if there are lyrics found
            if (res.message.header.status_code === 200) {
                $("#lookup").hide();
                $("#searching").hide();
                $("#guess").fadeIn();

                //display the lyrics
                const lyrics = `${res.message.body.lyrics.lyrics_body} ...`;
                console.log(lyrics);
                $("#lyrics").html(lyrics);
                $("#lyrics").fadeIn();
            } else {
                throw ("No lyrics found");
            }
        }).catch(e => {
            console.log(e);
            clear();
            $("#error-message").html("No lyrics found. Please enter a new artist or try again.");
        })
}

//Referenced https://developer.spotify.com/documentation/web-api/reference/artists/get-artists-top-tracks/
const getTopTracks = (artistId, country) => {
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=${country}`;

    const header = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    const request = new Request(url, {
        method: "GET",
        headers: header
    });

    return new Promise((resolve, reject) => {
        fetch(request)
            .then(res => {
                if (res.status === 200) {
                    // console.log(res)
                    return res.json();
                } else {
                    throw ("Bad status");
                }
            }).then(res => {
                console.log(res);
                const tracksSize = res.tracks.length - 1;
                const randomNumber = getRandomInt(0, tracksSize);

                //artist
                console.log(res.tracks[randomNumber].artists[0].name);
                const artist = res.tracks[randomNumber].artists[0].name;

                //displays the artist name being searched
                $("#artist").html("Artist: " + artist);

                //track name
                console.log(res.tracks[randomNumber].name);
                songTitle = res.tracks[randomNumber].name;
                resolve({
                    artist: artist,
                    songTitle: songTitle
                });
            }).catch(e => {
                console.log(e);
                clear();
                if (e === "Bad status") {
                    $("#error-message").html("Oops! Something went wrong. Please try again.");
                }
                $("#error-message").html("No tracks found. Please enter a different artist.");
            });
    })

};

//Referenced https://developer.spotify.com/documentation/web-api/reference/search/search/
const getArtistId = (artist) => {
    const endpoint = "https://api.spotify.com/v1/search";
    const searchType = "artist";
    const limit = 1; //number of song limit

    const url = `${endpoint}?q=${artist}&type=${searchType}&limit=${limit}`;

    const header = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    const request = new Request(url, {
        method: "GET",
        headers: header
    });

    //Referenced https://developers.google.com/web/updates/2015/03/introduction-to-fetch
    return new Promise((resolve, reject) => {
        fetch(request)
            .then(res => {
                if (res.status === 200) {
                    // console.log(res)
                    return res.json();
                } else {
                    throw ("Bad status");
                }
            }).then(json => {
                //gets artist id
                console.log(json);
                if (json.artists.items.length === 0) {
                    throw ("Artist not found.");
                } else {
                    const artistId = json.artists.items[0].id;
                    resolve(artistId);
                }
            }).catch(e => {
                console.log(e);
                clear();
                if (e === "Bad status") {
                    $("#error-message").html("Oops! Something went wrong. Please try again.");
                } else {
                    $("#error-message").html("Artist not found. Please enter a new artist.");
                }
            })
    })
}

const clear = () => {
    $("#guess").hide();
    $("#lyrics").hide();
    $("#searching").hide();
    $("#lyrics").html("");
    $("#error-message").html("");
    $("#song-title").val("");
}

const setToken = () => {
    //Set spotify token
    const client_id = "";
    const client_secret = "";
    const myToken = btoa(`${client_id}:${client_secret}`);

    const url = "https://accounts.spotify.com/api/token"
    const header = {
        "Authorization": `Basic ${myToken}`,
        "Content-Type": "application/x-www-form-urlencoded"
    }

    const data = {
        grant_type: "client_credentials"
    }

    const request = new Request(url, {
        method: "POST",
        headers: header,
        body: "grant_type=client_credentials"
    })

    fetch(new Request("/musix/spotify", {
        method: "POST"
    })).then(res => {
        if (res.status === 200) {
            return res.json();
        }
    }).then(res => {
        token = res.access_token;
    })

}

const start = () => {
    clear();
    //Get name of artist
    const artist = $("#artist-name").val();
    if (artist === "") {
        //if no artist is entered, display error message
        $("#error-message").html("Please enter an artist.");
    } else {
        $("#guessing-view").fadeIn();
        $("#searching").fadeIn();
        setToken();
        getArtistId(artist)
        .then(artistId => {
            return getTopTracks(artistId, "CA");
        }).then(res => {
            return getTrackId(res.artist, res.songTitle);
        }).then(trackId => {
            getLyrics(trackId);
            $("#try-btn").show();
        })
    }
}

$("#guess").submit(function(e) {
    e.preventDefault();
    const guess = $("#song-title").val();
    if (songTitle.toUpperCase() === guess.toUpperCase()) {
        $("#message").html("You guessed right!");
        score++;
        $("#score").html(`SCORE: ${score}`);
        main(e);
    } else {
        $("#message").html("You guessed wrong. Try again!");
    }
});

const main = (e) => {
    e.preventDefault();
    start();
};

//new game
const newGame = () => {
    clear();
    $("#message").html("");
    score = 0;
    $("#try-btn").hide();
    $("#score").html(`SCORE: ${score}`);
    $("#guessing-view").hide();
    $("#lookup").fadeIn();
}

//When user is looking up new artist
$("#lookup").submit(function(e) {
    main(e)
});

//when try another artist button is clicked
$("#try-btn").click(newGame);

//when start button is clicked
$("#start-btn").click(function() {
    $("#instructions").hide();
    $("#game-start").fadeIn();
});

$(document).ready(function() {
    $("#game-start").hide();
    $("#guessing-view").hide();
    $("#try-btn").hide();
    $("#searching").hide();
    $("#lyrics").hide();
    $("#score").html(`SCORE: ${score}`);
});
