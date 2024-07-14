const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const CLIENT_SECRET = '94a10806a4544e8a854d0a7ac9dc7636';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
let accessToken = '';

document.getElementById('generateButton').addEventListener('click', function() {
    var description = document.getElementById('descriptionInput').value;
    var numSongs = parseInt(document.getElementById('numSongsInput').value, 10);
    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }
    authorizeSpotify();
});

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
    const authUrl = 'https://accounts.spotify.com/authorize';
    const scopes = 'playlist-modify-public playlist-modify-private';

    let url = `${authUrl}?response_type=token`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&scope=${encodeURIComponent(scopes)}`;
    url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    url += `&state=${generateRandomString(16)}`;

    const popup = window.open(url, 'Spotify Auth', 'width=600,height=400');

    const interval = setInterval(() => {
        try {
            const hash = popup.location.hash.substring(1);
            const params = new URLSearchParams(hash);
            if (params.get('access_token')) {
                accessToken = params.get('access_token');
                popup.close();
                clearInterval(interval);
                generatePlaylist(document.getElementById('descriptionInput').value, parseInt(document.getElementById('numSongsInput').value, 10));
            }
        } catch (e) {
            // Ignore cross-origin errors
        }
    }, 1000);
}

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function generatePlaylist(description, numSongs) {
    hideError();
    if (!accessToken) {
        showError('Fehler bei der Authentifizierung mit Spotify. Bitte erneut versuchen.');
        return;
    }

    const tags = description.split(',').map(tag => tag.trim());
    let generatedSongs = 0;
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';

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
                const songItem = document.createElement('div');
                songItem.className = 'song-item';
                songItem.innerHTML = `
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

function savePlaylist(playlistName, songs) {
    // Implementiere hier die Logik zum Speichern der Playlist auf Spotify
}
