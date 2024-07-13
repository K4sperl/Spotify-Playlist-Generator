// Client ID und Client Secret
const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const CLIENT_SECRET = '94a10806a4544e8a854d0a7ac9dc7636';
const REDIRECT_URI = 'https://deine-redirect-uri.de';

// Globaler Access Token
let accessToken = '';

// Funktion zum Autorisieren mit Spotify
function authorizeSpotify() {
    const authUrl = 'https://accounts.spotify.com/authorize';
    const scopes = 'playlist-modify-private playlist-modify-public';
    const state = generateRandomString(16);

    let url = `${authUrl}?response_type=token`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&scope=${encodeURIComponent(scopes)}`;
    url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    url += `&state=${state}`;

    // Öffne den Spotify-Authentifizierungs-URL in einem neuen Tab
    window.open(url, '_blank');

    // Überwache den Tab, um den Access Token zu erhalten
    window.addEventListener('storage', function(event) {
        if (event.key === 'spotify_access_token') {
            accessToken = event.newValue;
            console.log('Access Token:', accessToken);
        }
    });
}

// Beispiel: Funktion zum Suchen von Songs auf Spotify
function searchSongs(theme, numSongs) {
    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(theme)}&type=track&limit=${numSongs}`;

    fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Suchergebnisse:', data);
        // Hier kannst du die Suchergebnisse weiter verarbeiten (z.B. auf der Webseite anzeigen)
    })
    .catch(error => console.error('Fehler beim Suchen von Songs:', error));
}

// Beispiel: Funktion zum Speichern einer Playlist auf Spotify
function savePlaylist(playlistName, songURIs) {
    const createPlaylistUrl = `https://api.spotify.com/v1/me/playlists`;
    let playlistId = '';

    // Schritt 1: Playlist erstellen
    fetch(createPlaylistUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            'name': playlistName,
            'public': false
        })
    })
    .then(response => response.json())
    .then(data => {
        playlistId = data.id;
        console.log('Playlist erstellt:', data);

        // Schritt 2: Songs zur Playlist hinzufügen
        const addTracksUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        fetch(addTracksUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'uris': songURIs
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Songs hinzugefügt:', data);
            alert(`Playlist "${playlistName}" wurde erfolgreich auf Spotify gespeichert!`);
        })
        .catch(error => console.error('Fehler beim Hinzufügen von Songs zur Playlist:', error));
    })
    .catch(error => console.error('Fehler beim Erstellen der Playlist:', error));
}

// Beispiel: Funktion zum Generieren und Anzeigen der Playlist auf der Website
function generatePlaylist(description, numSongs) {
    // Beispiel: Suchen nach Songs basierend auf der Beschreibung
    searchSongs(description, numSongs);

    // Beispiel: Anzeigen der Playlist auf der Webseite
    document.getElementById('playlistContainer').innerHTML = '';
    for (let i = 1; i <= numSongs; i++) {
        const songName = `Song ${i}`;
        const artistName = `Artist ${i}`;
        const songItem = `<div>${songName} - ${artistName}</div>`;
        document.getElementById('playlistContainer').innerHTML += songItem;
    }

    // Anzeigen des "Playlist speichern" Buttons
    document.getElementById('savePlaylistButton').style.display = 'block';
}

// Beispiel: Event-Listener für Interaktionen auf der Website
document.getElementById('generateButton').addEventListener('click', function() {
    const description = document.getElementById('descriptionInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);
    generatePlaylist(description, numSongs);
});

document.getElementById('savePlaylistButton').addEventListener('click', function() {
    const playlistName = prompt('Gib einen Namen für deine Playlist ein:');
    if (playlistName) {
        // Beispiel: Playlist speichern
        savePlaylist(playlistName, ['spotify:track:1', 'spotify:track:2', 'spotify:track:3']); // Beispiel-URIs
    }
});

// Hilfsfunktion: Generiere einen zufälligen String
function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
