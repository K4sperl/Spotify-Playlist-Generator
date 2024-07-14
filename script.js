const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
let accessToken = '';

document.getElementById('authButton').addEventListener('click', authorizeSpotify);
document.getElementById('generateButton').addEventListener('click', generatePlaylist);
document.getElementById('savePlaylistButton').addEventListener('click', savePlaylist);

function validateNumberInput(input) {
    const value = input.value;
    if (!/^\d*$/.test(value)) {
        input.value = value.replace(/\D/g, '');
    }
}

function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
}

function authorizeSpotify() {
    const scopes = 'playlist-modify-public playlist-modify-private';
    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

    window.location = authUrl;
}

function handleRedirect() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (params.has('access_token')) {
        accessToken = params.get('access_token');
        document.getElementById('authButton').style.display = 'none';
        document.getElementById('generateButton').style.display = 'inline-block';
    }
}

window.onload = handleRedirect;

function generatePlaylist() {
    const description = document.getElementById('descriptionInput').value;
    const exclude = document.getElementById('excludeInput').value.split(',').map(term => term.trim().toLowerCase());
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);

    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }
    hideError();

    const tags = description.split(',').map(tag => tag.trim());
    let generatedSongs = 0;
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';
    const trackSet = new Set();

    const interval = setInterval(() => {
        if (generatedSongs >= numSongs) {
            clearInterval(interval);
            document.getElementById('savePlaylistButton').style.display = 'block';
            return;
        }

        const tag = tags[generatedSongs % tags.length];
        searchSongs(tag, 1).then(songs => {
            if (songs.length > 0) {
                const song = songs[0];
                if (!trackSet.has(song.id) && !exclude.some(term => song.name.toLowerCase().includes(term) || song.artists.some(artist => artist.name.toLowerCase().includes(term)))) {
                    trackSet.add(song.id);
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
                    playlist.appendChild(songItem);
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
    const name = document.getElementById('descriptionInput').value || 'Meine Playlist';
    const tracks = Array.from(document.querySelectorAll('.song-item')).map(item => item.querySelector('h3').textContent);
    
    fetch('https://api.spotify.com/v1/me/playlists', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            description: 'Passe die Beschreibung an',
            public: false
        })
    })
    .then(response => response.json())
    .then(data => {
        const playlistId = data.id;
        const uris = tracks.map(track => `spotify:track:${track}`);
        return fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: uris })
        });
    })
    .then(response => response.json())
    .then(() => {
        alert('Playlist erfolgreich gespeichert!');
    })
    .catch(err => {
        console.error(err);
        showError('Fehler beim Speichern der Playlist. Bitte versuchen Sie es erneut.');
    });
}

function changeLanguage(lang) {
    if (lang === 'de') {
        document.getElementById('title').textContent = 'Spotify Playlist Generator';
        document.querySelector('label[for="descriptionInput"]').textContent = 'Thema der Playlist:';
        document.querySelector('label[for="excludeInput"]').textContent = 'Auszuschließende Begriffe:';
        document.querySelector('label[for="numSongsInput"]').textContent = 'Anzahl der Lieder:';
        document.getElementById('authButton').textContent = 'Mit Spotify anmelden';
        document.getElementById('generateButton').textContent = 'Playlist generieren';
        document.getElementById('savePlaylistButton').textContent = 'Playlist auf Spotify speichern';
    } else if (lang === 'en') {
        document.getElementById('title').textContent = 'Spotify Playlist Generator';
        document.querySelector('label[for="descriptionInput"]').textContent = 'Playlist Theme:';
        document.querySelector('label[for="excludeInput"]').textContent = 'Exclude Terms:';
        document.querySelector('label[for="numSongsInput"]').textContent = 'Number of Songs:';
        document.getElementById('authButton').textContent = 'Login with Spotify';
        document.getElementById('generateButton').textContent = 'Generate Playlist';
        document.getElementById('savePlaylistButton').textContent = 'Save Playlist to Spotify';
    }
}
