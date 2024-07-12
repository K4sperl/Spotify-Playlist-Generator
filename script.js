document.getElementById("loginButton").addEventListener("click", function() {
    authorizeSpotify();
});

function authorizeSpotify() {
    var scopes = 'playlist-read-private playlist-read-collaborative user-read-private';
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=code';
    url += '&client_id='YOUR_SPOTIFY_CLIENT_ID';  // Ersetze dies durch deine Spotify Client ID
    url += '&scope=' + encodeURIComponent(scopes);
    url += '&redirect_uri=' + encodeURIComponent('http://localhost:3000/callback'); // Passe diese URL an deine an

    var authWindow = window.open(url, '_blank');

    var interval = setInterval(function() {
        if (authWindow.closed) {
            clearInterval(interval);
            var accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                console.log('Authenticated with Spotify! Access token:', accessToken);
            } else {
                console.error('Error authenticating with Spotify');
            }
        }
    }, 1000);
}

function validateAndGenerate() {
    var inputText = document.getElementById("inputField").value.trim();
    var numSongs = parseInt(document.getElementById("numSongs").value, 10);

    if (inputText === "") {
        displayErrorMessage("Keine Eingabe");
    } else if (!isValidInput(inputText)) {
        displayErrorMessage("Unerlaubte Zeichen");
    } else {
        var generatedText = `Playlist wird generiert für: ${inputText}, mit ${numSongs} Liedern.`;
        document.getElementById("generatedCount").textContent = `0/${numSongs} Liedern generiert`;

        generateSongs(inputText, numSongs);
        hideErrorMessage();
        loadRelatedPlaylists();
    }
}

function generateSongs(description, numSongs) {
    var generatedSongs = [];
    for (var i = 1; i <= numSongs; i++) {
        var song = {
            id: i,
            name: `Song ${i}`,
            artist: `Künstler ${i}`,
            image: 'https://via.placeholder.com/50',
        };
        generatedSongs.push(song);
    }
    displayPlaylist(generatedSongs);
}

function displayPlaylist(songs) {
    var playlistElement = document.getElementById("playlist");
    playlistElement.innerHTML = "";
    songs.forEach(function(song) {
        var songItem = document.createElement("div");
        songItem.classList.add("song-item");

        var songImage = document.createElement("img");
        songImage.src = song.image;
        songImage.alt = song.name;
        songItem.appendChild(songImage);

        var songInfo = document.createElement("div");
        songInfo.classList.add("song-info");

        var songTitle = document.createElement("h3");
        songTitle.textContent = song.name;
        songInfo.appendChild(songTitle);

        var songArtist = document.createElement("p");
        songArtist.textContent = song.artist;
        songInfo.appendChild(songArtist);

        songItem.appendChild(songInfo);
        playlistElement.appendChild(songItem);
    });
    document.getElementById("generatedCount").textContent = `${songs.length}/${songs.length} Liedern generiert`;
}

function loadRelatedPlaylists() {
    var relatedPlaylistsElement = document.getElementById("relatedPlaylists");
    relatedPlaylistsElement.innerHTML = "";
    var playlists = [
        {
            id: 1,
            name: "Chill Out",
            image: 'https://via.placeholder.com/50',
        },
        {
            id: 2,
            name: "Party Hits",
            image: 'https://via.placeholder.com/50',
        },
        {
            id: 3,
            name: "Best of 2024",
            image: 'https://via.placeholder.com/50',
        },
        {
            id: 4,
            name: "Acoustic Favorites",
            image: 'https://via.placeholder.com/50',
        },
        {
            id: 5,
            name: "Rap Vibes",
            image: 'https://via.placeholder.com/50',
        },
    ];

    playlists.forEach(function(playlist) {
        var playlistItem = document.createElement("div");
        playlistItem.classList.add("related-playlist-item");

        var playlistImage = document.createElement("img");
        playlistImage.src = playlist.image;
        playlistImage.alt = playlist.name;
        playlistItem.appendChild(playlistImage);

        var playlistInfo = document.createElement("div");
        playlistInfo.classList.add("playlist-info");

        var playlistTitle = document.createElement("h3");
        playlistTitle.textContent = playlist.name;
        playlistInfo.appendChild(playlistTitle);

        playlistItem.appendChild(playlistInfo);
        relatedPlaylistsElement.appendChild(playlistItem);
    });
}

function displayErrorMessage(message) {
    var errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = "block";
}

function hideErrorMessage() {
    var errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.style.display = "none";
}

function isValidInput(input) {
    var regex = /^[a-zA-Z0-9\s]*$/;
    return regex.test(input);
}
