// Initialisierung der globalen Variablen für den Zugriffstoken und den Benutzernamen
var accessToken = localStorage.getItem('accessToken');
var userDisplayName = localStorage.getItem('userDisplayName');

// Überprüfen, ob der Benutzer bereits angemeldet ist
if (accessToken && userDisplayName) {
    // Benutzer ist angemeldet
    showLoggedIn(userDisplayName);
}

// Funktion zum Umschalten der Spotify-Anmeldung
function toggleSpotifyLogin() {
    if (accessToken) {
        logout();
    } else {
        authorizeSpotify();
    }
}

// Spotify autorisieren
function authorizeSpotify() {
    var scopes = 'playlist-read-private playlist-read-collaborative user-read-private';
    var url = 'https://accounts.spotify.com/authorize';
    url += '?response_type=code';
    url += '&client_id=' + encodeURIComponent('0fe8c6577bda455581b8b36be7631e25');
    url += '&scope=' + encodeURIComponent(scopes);
    url += '&redirect_uri=' + encodeURIComponent('https://k4sperl.github.io/Spotify-Playlist-Generator.github.io');

    var authWindow = window.open(url, '_blank');

    var interval = setInterval(function() {
        if (authWindow.closed) {
            clearInterval(interval);
            // Zugriffstoken aus dem localStorage abrufen
            accessToken = localStorage.getItem('accessToken');
            userDisplayName = localStorage.getItem('userDisplayName');
            if (accessToken && userDisplayName) {
                // Authentifizierung mit Spotify erfolgreich
                console.log('Mit Spotify authentifiziert! Zugriffstoken:', accessToken);
                showLoggedIn(userDisplayName);
            } else {
                console.error('Fehler bei der Authentifizierung mit Spotify');
            }
        }
    }, 1000);
}

// Funktion zur Anzeige des angemeldeten Benutzers und Anpassung des Tab-Namens
function showLoggedIn(userName) {
    document.title = "Schließe mich"; // Ändere den Tab-Namen
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('loggedInStatus').style.display = 'block';
    document.getElementById('loggedInUser').textContent = userName;
    document.getElementById('saveToSpotifyButton').style.display = 'block';
}

// Funktion zum Abmelden
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDisplayName');
    location.reload(); // Seite neu laden, um den Zustand zu aktualisieren
}

// Funktion zur Validierung und Generierung der Playlist
function validateAndGenerate() {
    var inputText = document.getElementById("inputField").value.trim();
    var numSongs = parseInt(document.getElementById("numSongs").value, 10);

    // Fehlerprüfung
    if (inputText === "") {
        displayErrorMessage("Keine Eingabe");
    } else if (!isValidInput(inputText)) {
        displayErrorMessage("Ungültige Eingabe");
    } else if (numSongs <= 0) {
        displayErrorMessage("Ungültige Anzahl an Liedern");
    } else {
        // Erfolgreiche Generierung
        var generatedText = document.getElementById("customText").textContent.trim();
        console.log("Benutzerdefinierter Text:", generatedText);
        document.getElementById("generatedCount").textContent = `0/${numSongs} Liedern generiert`;
        document.getElementById("generatedCount").style.display = "block"; // Zeige den Generierungsstatus an

        // Songs generieren und anzeigen
        generateSongs(inputText, numSongs);
        hideErrorMessage();

        // Ähnliche Playlists laden
        loadRelatedPlaylists();
    }
}

// Funktion zur Generierung von Dummy-Songs (für Demo-Zwecke)
function generateSongs(description, numSongs) {
    var generatedSongs = [];
    for (var i = 1; i <= numSongs; i++) {
        var song = {
            id: i,
            name: `Song ${i}`,
            artist: `Künstler ${i}`,
            image: 'https://via.placeholder.com/50', // Beispielbild, du kannst ein echtes Bild verwenden
        };
        generatedSongs.push(song);
    }

    // Playlist anzeigen
    displayPlaylist(generatedSongs);
}

// Funktion zur Anzeige der generierten Playlist
function displayPlaylist(songs) {
    var playlistElement = document.getElementById("playlist");
    playlistElement.innerHTML = ""; // Playlist leeren

    songs.forEach(function(song) {
        var songItem = document.createElement("div");
        songItem.classList.add("song-item");

        var songImage = document.createElement("img");
        songImage.src = song.image;
        songImage.alt = song.name;
        songItem.appendChild(songImage);

        var songInfo = document.createElement("div");
        songInfo.classList.add("song-info");

        var songName = document.createElement("h3");
        songName.textContent = song.name;
        songInfo.appendChild(songName);

        var artistName = document.createElement("p");
        artistName.textContent = song.artist;
        songInfo.appendChild(artistName);

        songItem.appendChild(songInfo);
        playlistElement.appendChild(songItem);
    });
}

// Funktion zum Laden ähnlicher Playlists (Dummy-Daten)
function loadRelatedPlaylists() {
    var relatedPlaylists = [
        {
            id: 1,
            name: 'Ähnliche Playlist 1',
            image: 'https://via.placeholder.com/50', // Beispielbild, du kannst ein echtes Bild verwenden
        },
        {
            id: 2,
            name: 'Ähnliche Playlist 2',
            image: 'https://via.placeholder.com/50', // Beispielbild, du kannst ein echtes Bild verwenden
        },
        {
            id: 3,
            name: 'Ähnliche Playlist 3',
            image: 'https://via.placeholder.com/50', // Beispielbild, du kannst ein echtes Bild verwenden
        },
    ];

    displayRelatedPlaylists(relatedPlaylists);
}

// Funktion zur Anzeige ähnlicher Playlists
function displayRelatedPlaylists(playlists) {
    var relatedPlaylistsElement = document.getElementById("relatedPlaylists");
    relatedPlaylistsElement.innerHTML = ""; // Ähnliche Playlists leeren

    var heading = document.createElement("h2");
    heading.textContent = "Ähnliche Playlists auf Spotify";
    relatedPlaylistsElement.appendChild(heading);

    playlists.forEach(function(playlist) {
        var playlistItem = document.createElement("div");
        playlistItem.classList.add("related-playlist-item");

        var playlistImage = document.createElement("img");
        playlistImage.src = playlist.image;
        playlistImage.alt = playlist.name;
        playlistItem.appendChild(playlistImage);

        var playlistInfo = document.createElement("div");
        playlistInfo.classList.add("playlist-info");

        var playlistName = document.createElement("h3");
        playlistName.textContent = playlist.name;
        playlistInfo.appendChild(playlistName);

        playlistItem.appendChild(playlistInfo);
        relatedPlaylistsElement.appendChild(playlistItem);
    });

    relatedPlaylistsElement.classList.add("active"); // Zeige ähnliche Playlists an
}

// Funktion zur Anzeige einer Fehlermeldung
function displayErrorMessage(message) {
    var errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.textContent = `Fehler: ${message}`;
    errorMessageElement.style.display = "block";
}

// Funktion zum Ausblenden der Fehlermeldung
function hideErrorMessage() {
    var errorMessageElement = document.getElementById("errorMessage");
    errorMessageElement.style.display = "none";
}

// Funktion zum Neuladen der Seite
function reloadPage() {
    location.reload();
}

// Funktion zur Validierung der Eingabe (Dummy-Implementierung)
function isValidInput(inputText) {
    return /^[a-zA-Z0-9\s]+$/.test(inputText); // Erlaube nur Buchstaben und Zahlen
}

// Funktion zum Speichern der Playlist auf Spotify (Dummy-Implementierung)
function saveToSpotify() {
    var playlistName = prompt("Gib einen Namen für deine Playlist ein:");
    if (playlistName) {
        // Hier würdest du die Playlist-Daten an die Spotify API senden
        // und die Playlist speichern (Beispielcode fehlt hier für die Spotify API Integration)
        alert(`Playlist "${playlistName}" wurde auf Spotify gespeichert!`);
    }
}
