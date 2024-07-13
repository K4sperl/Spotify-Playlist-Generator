// Client ID und Client Secret
const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const CLIENT_SECRET = '94a10806a4544e8a854d0a7ac9dc7636';

// Spotify Web API Endpunkte
const AUTH_URL = 'https://accounts.spotify.com/authorize';
const API_URL = 'https://api.spotify.com/v1';

// Zustand für den Tokenaustausch
let state = '';

// Event-Listener für den Button zum Generieren der Playlist
document.getElementById('generateButton').addEventListener('click', async function() {
    const theme = document.getElementById('themeInput').value.trim();
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);

    if (!theme || isNaN(numSongs) || numSongs < 10 || numSongs > 10000) {
        alert('Bitte gib ein Thema und eine Anzahl von 10 bis 10000 Liedern ein.');
        return;
    }

    try {
        toggleLoading(true); // Ladeanzeige anzeigen

        // 1. Spotify autorisieren und Token erhalten
        const accessToken = await authorizeSpotify();

        // 2. Songs basierend auf dem Thema suchen
        const songs = await searchSongs(theme, numSongs, accessToken);

        // 3. Playlist auf Spotify speichern
        const playlistName = `Generated Playlist - ${theme}`;
        const playlistUrl = await savePlaylist(playlistName, songs, accessToken);

        toggleLoading(false); // Ladeanzeige ausblenden
        displayPlaylistLink(playlistUrl); // Playlist-Link anzeigen
    } catch (error) {
        console.error('Fehler beim Generieren der Playlist:', error);
        alert('Es ist ein Fehler beim Generieren der Playlist aufgetreten. Bitte versuche es später erneut.');
        toggleLoading(false); // Ladeanzeige ausblenden bei Fehler
    }
});

// Funktion zum Autorisieren mit Spotify und Token abrufen
async function authorizeSpotify() {
    const scopes = 'playlist-modify-private'; // Rechte für das Erstellen einer privaten Playlist
    state = generateRandomString(16); // Zustand für die Sicherheit

    return new Promise((resolve, reject) => {
        const width = 450,
            height = 730,
            left = (window.innerWidth / 2) - (width / 2),
            top = (window.innerHeight / 2) - (height / 2);

        const authWindow = window.open(
            `${AUTH_URL}?response_type=token&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&state=${state}`,
            'Spotify Auth',
            `width=${width},height=${height},top=${top},left=${left}`
        );

        window.addEventListener('message', function receiveMessage(event) {
            if (event.origin !== window.location.origin) return;

            const params = new URLSearchParams(event.data);
            if (params.get('state') !== state) {
                reject(new Error('Ungültiger Zustand.'));
            }

            const accessToken = params.get('access_token');
            if (accessToken) {
                resolve(accessToken);
            } else {
                reject(new Error('Kein Zugriffstoken erhalten.'));
            }

            window.removeEventListener('message', receiveMessage);
        });
    });
}

// Funktion zum Suchen von Songs auf Spotify basierend auf einem Thema
async function searchSongs(theme, numSongs, accessToken) {
    try {
        const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(theme)}&type=track&limit=${numSongs}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Suche fehlgeschlagen.');
        }

        const data = await response.json();
        return data.tracks.items;
    } catch (error) {
        throw new Error('Fehler beim Suchen von Songs: ' + error.message);
    }
}

// Funktion zum Speichern einer Playlist auf Spotify
async function savePlaylist(playlistName, songs, accessToken) {
    try {
        // 1. Benutzerinformationen abrufen
        const userResponse = await fetch(`${API_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });

        if (!userResponse.ok) {
            throw new Error('Benutzerinformationen konnten nicht abgerufen werden.');
        }

        const userData = await userResponse.json();
        const userId = userData.id;

        // 2. Neue Playlist erstellen
        const playlistResponse = await fetch(`${API_URL}/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                public: false // Private Playlist
            })
        });

        if (!playlistResponse.ok) {
            throw new Error('Playlist konnte nicht erstellt werden.');
        }

        const playlistData = await playlistResponse.json();
        const playlistId = playlistData.id;

        // 3. Songs zur Playlist hinzufügen
        const trackUris = songs.map(song => song.uri);
        await fetch(`${API_URL}/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: trackUris
            })
        });

        // Playlist-URL zurückgeben
        return `https://open.spotify.com/playlist/${playlistId}`;
    } catch (error) {
        throw new Error('Fehler beim Speichern der Playlist: ' + error.message);
    }
}

// Funktion zur Generierung einer zufälligen Zeichenfolge
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Funktion zum Anzeigen der Ladeanzeige
function toggleLoading(showLoading) {
    const progressElement = document.querySelector('.progress');
    progressElement.style.display = showLoading ? 'block' : 'none';
}

// Funktion zum Anzeigen des Playlist-Links
function displayPlaylistLink(playlistUrl) {
    const playlistLinkElement = document.getElementById('playlistLink');
    playlistLinkElement.href = playlistUrl;
    const playlistLinkContainer = document.querySelector('.playlist-link');
    playlistLinkContainer.style.display = 'block';
}
