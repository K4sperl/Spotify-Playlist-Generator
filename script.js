const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
let accessToken = '';

// Elements
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginButton = document.getElementById('loginButton');
const generateButton = document.getElementById('generateButton');
const savePlaylistButton = document.getElementById('savePlaylistButton');
const errorMessage = document.getElementById('error-message');
const playlistElement = document.getElementById('playlist');

// Event Listeners
loginButton.addEventListener('click', authorizeSpotify);
generateButton.addEventListener('click', generatePlaylist);
savePlaylistButton.addEventListener('click', savePlaylist);

// Check for access token in URL
window.onload = function() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    if (params.get('access_token')) {
        accessToken = params.get('access_token');
        loginContainer.style.display = 'none';
        appContainer.style.display = 'block';
    }
};

function validateNumberInput(input) {
    const value = input.value;
    if (!/^\d*$/.test(value)) {
        input.value = value.replace(/\D/g, '');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function authorizeSpotify() {
    const authUrl = 'https://accounts.spotify.com/authorize';
    const scopes = 'playlist-modify-public playlist-modify-private';

    let url = `${authUrl}?response_type=token`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&scope=${encodeURIComponent(scopes)}`;
    url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location = url;
}

function generatePlaylist() {
    hideError();
    const description = document.getElementById('descriptionInput').value;
    const exclude = document.getElementById('excludeInput').value.split(',').map(tag => tag.trim().toLowerCase());
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);
    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }

    if (!accessToken) {
        showError('Fehler bei der Authentifizierung mit Spotify. Bitte erneut versuchen.');
        return;
    }

    const tags = description.split(',').map(tag => tag.trim());
    let generatedSongs = 0;
    const uniqueSongs = new Set();
    playlistElement.innerHTML = '';

    const interval = setInterval(() => {
        if (generatedSongs >= numSongs) {
            clearInterval(interval);
            savePlaylistButton.style.display = 'block';
            return;
        }

        const tag = tags[generatedSongs % tags.length];
        searchSongs(tag, 1).then(songs => {
            if (songs.length > 0) {
                const song = songs[0];
                if (!uniqueSongs.has(song.id) && !exclude.some(term => song.name.toLowerCase().includes(term) || song.artists.some(artist => artist.name.toLowerCase().includes(term)))) {
                    uniqueSongs.add(song.id);
                    const songItem = document.createElement('div');
                    songItem.className = 'song-item';
                    songItem.innerHTML = `
                        <span class="song-number">${generatedSongs + 1}.</span>
                        <img src="${song.album.images[0].url}" alt="${song.name}">
                        <div class="song-info">
                            <h3>${song.name}</h3>
                            <p>${song.artists.map(artist => artist.name).join(', ')}</p>
                            <audio controls>
                                <source src="${song.preview_url}" type="audio/mpeg">
                                Your browser does not support the audio element.
                            </audio>
                        </div>
                    `;
                    playlistElement.appendChild(songItem);
                    generatedSongs++;
                }
            }
        }).catch(err => {
            console.error(err);
            showError('Fehler beim Abrufen der Lieder. Bitte versuchen Sie es erneut.');
            clearInterval(interval);
        });
    }, 1000);
}

function searchSongs(query, limit) {
    return fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => data.tracks.items);
}

function savePlaylist() {
    const description = document.getElementById('descriptionInput').value;
    const playlistName = `Generated Playlist: ${description}`;
    const uris = Array.from(document.querySelectorAll('.song-item')).map(item => `spotify:track:${item.dataset.id}`);

    fetch('https://api.spotify.com/v1/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const userId = data.id;
        return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: 'Passe die Beschreibung an',
                public: false
            })
        });
    })
    .then(response => response.json())
    .then(playlist => {
        const playlistId = playlist.id;
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: uris
            })
        });
    })
    .then(() => {
        alert('Playlist erfolgreich gespeichert!');
    })
    .catch(err => {
        console.error(err);
        showError('Fehler beim Speichern der Playlist. Bitte versuchen Sie es erneut.');
    });
}

document.getElementById('switch-to-english').addEventListener('click', () => {
    document.documentElement.lang = 'en';
    document.getElementById('switch-to-english').style.display = 'none';
    document.getElementById('switch-to-german').style.display = 'block';
    translateToEnglish();
});

document.getElementById('switch-to-german').addEventListener('click', () => {
    document.documentElement.lang = 'de';
    document.getElementById('switch-to-english').style.display = 'block';
    document.getElementById('switch-to-german').style.display = 'none';
    translateToGerman();
});

function translateToEnglish() {
    document.querySelector('h1').textContent = 'Spotify Playlist Generator';
    document.querySelector('label[for="descriptionInput"]').textContent = 'Playlist Theme:';
    document.querySelector('label[for="excludeInput"]').textContent = 'Exclude Terms:';
    document.querySelector('label[for="numSongsInput"]').textContent = 'Number of Songs:';
    document.getElementById('descriptionInput').placeholder = 'e.g., Party, Chill, Workout';
    document.getElementById('excludeInput').placeholder = 'e.g., Rock, Twenty4Tim';
    document.getElementById('generateButton').textContent = 'Generate Playlist';
    document.getElementById('savePlaylistButton').textContent = 'Save Playlist to Spotify';
    document.getElementById('error-message').textContent = 'Please enter a valid number of songs (minimum 10, maximum 10,000).';
    document.getElementById('loginButton').textContent = 'Login with Spotify';
    document.getElementById('switch-to-english').textContent = 'Switch to English';
    document.getElementById('switch-to-german').textContent = 'Switch to German';
}

function translateToGerman() {
    document.querySelector('h1').textContent = 'Spotify Playlist Generator';
    document.querySelector('label[for="descriptionInput"]').textContent = 'Thema der Playlist:';
    document.querySelector('label[for="excludeInput"]').textContent = 'Auszuschließende Begriffe:';
    document.querySelector('label[for="numSongsInput"]').textContent = 'Anzahl der Lieder:';
    document.getElementById('descriptionInput').placeholder = 'z.B. Party, Chill, Workout';
    document.getElementById('excludeInput').placeholder = 'z.B. Rock, Twenty4Tim';
    document.getElementById('generateButton').textContent = 'Playlist generieren';
    document.getElementById('savePlaylistButton').textContent = 'Playlist auf Spotify speichern';
    document.getElementById('error-message').textContent = 'Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).';
    document.getElementById('loginButton').textContent = 'Mit Spotify anmelden';
    document.getElementById('switch-to-english').textContent = 'Switch to English';
    document.getElementById('switch-to-german').textContent = 'Auf Deutsch wechseln';
}
