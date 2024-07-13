// Spotify API Endpoint zur Suche nach Songs
const SPOTIFY_API_SEARCH_ENDPOINT = 'https://api.spotify.com/v1/search';

// Überprüfen, ob der Benutzer bereits angemeldet ist
var accessToken = localStorage.getItem('accessToken');
var userDisplayName = localStorage.getItem('userDisplayName');

if (accessToken && userDisplayName) {
    // Benutzer ist angemeldet
    showLoggedIn(userDisplayName);
}

// Spotify anmelden oder abmelden
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
            // Get the access token from local storage or a hidden input field
            accessToken = localStorage.getItem('accessToken');
            userDisplayName = localStorage.getItem('userDisplayName');
            if (accessToken && userDisplayName) {
                // Use the access token to authenticate with Spotify
                console.log('Authenticated with Spotify! Access token:', accessToken);
                showLoggedIn(userDisplayName);
            } else {
                console.error('Error authenticating with Spotify');
            }
        }
    }, 1000);
}

// Zeige Benutzer als angemeldet an
function showLoggedIn(userName) {
    document.getElementById('loginButton').style.display = 'none';
    document.getElementById('loggedInStatus').style.display = 'block';
    document.getElementById('loggedInUser').textContent = userName;
    document.getElementById('saveToSpotifyButton').style.display = 'block';
}

// Spotify abmelden
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userDisplayName');
    location.reload(); // Seite neu laden
}

// Funktion zur Suche nach Songs auf Spotify
async function searchSongs(description, numSongs) {
    try {
        // Spotify API aufrufen, um Songs basierend auf der Beschreibung zu suchen
        const response = await fetch(`${SPOTIFY_API_SEARCH_ENDPOINT}?q=${encodeURIComponent(description)}&type=track&limit=${numSongs}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`, // Hier müsst du das Spotify Zugriffstoken einfügen
            },
        });

        if (!response.ok) {
            throw new Error('Fehler beim Abrufen der Songs von Spotify');
        }

        const data = await response.json();
        const tracks = data.tracks.items.map(item => ({
            id: item.id,
            name: item.name,
            artist: item.artists.map(artist => artist.name).join(', '),
            image: item.album.images.length > 0 ? item.album.images[0].url : 'https://via.placeholder.com/50', // Platzhalterbild
        }));

        return tracks;
    } catch (error) {
        console.error('Fehler beim Suchen von Songs auf Spotify:', error.message);
        return []; // Leeres Array zurückgeben, wenn ein Fehler auftritt
    }
}

// Funktion zum Generieren und Anzeigen der Playlist basierend auf der Beschreibung
async function generatePlaylist(description, numSongs) {
    try {
        // Songs von Spotify suchen
        const songs = await searchSongs(description, numSongs);

        // Playlist anzeigen
        displayPlaylist(songs);
        showRelatedPlaylists(); // Ähnliche Playlists anzeigen
    } catch (error) {
        displayErrorMessage('Fehler beim Generieren der Playlist');
    }
}

// Playlist auf der Webseite anzeigen
function displayPlaylist(songs) {
    const playlistElement = document.getElementById('playlist');
    playlistElement.innerHTML = ''; // Playlist leeren

    songs.forEach(song => {
        const songItem = document.createElement('div');
        songItem.classList.add('song-item');

        const songImage = document.createElement('img');
        songImage.src = song.image;
        songImage.alt = `${song.name} Album Cover`;
        songItem.appendChild(songImage);

        const songInfo = document.createElement('div');
        songInfo.classList.add('song-info');

        const songTitle = document.createElement('h3');
        songTitle.textContent = song.name;
        songInfo.appendChild(songTitle);

        const songArtist = document.createElement('p');
        songArtist.textContent = song.artist;
        songInfo.appendChild(songArtist);

        songItem.appendChild(songInfo);
        playlistElement.appendChild(songItem);
    });

    document.getElementById('generatedCount').textContent = `0/${songs.length} Liedern generiert`;
    document.getElementById('generatedCount').style.display = 'block'; // Generierungsstatus anzeigen
}

// Ähnliche Playlists auf der Webseite anzeigen
function showRelatedPlaylists() {
    const relatedPlaylistsElement = document.getElementById('relatedPlaylists');
    relatedPlaylistsElement.classList.add('active'); // Zeige ähnliche Playlists an
}

// Fehlermeldung auf der Webseite anzeigen
function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block'; // Fehlermeldung anzeigen
}

// Fehlermeldung auf der Webseite ausblenden
function hideErrorMessage() {
    const errorMessageElement = document.getElementById('errorMessage');
    errorMessageElement.style.display = 'none'; // Fehlermeldung ausblenden
}

// Benutzerdefinierten Text als Vorlage abrufen
function getCustomText() {
    return document.getElementById('customText').textContent.trim();
}

// Seite neu laden (für Abbrechen-Button)
function reloadPage() {
    location.reload();
}

// Initialisierung prüfen, ob der Benutzer bereits angemeldet ist
function checkIfLoggedIn() {
    if (accessToken && userDisplayName) {
        // Benutzer ist angemeldet
        showLoggedIn(userDisplayName);
    }
}

// Bei Seitenladen prüfen, ob der Benutzer angemeldet ist
document.addEventListener('DOMContentLoaded', checkIfLoggedIn);
