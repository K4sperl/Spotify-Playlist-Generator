const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
let accessToken = '';

// Elements
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
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('generateSection').classList.remove('hidden');
    }
};

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
}

function authorizeSpotify() {
    const authUrl = 'https://accounts.spotify.com/authorize';
    const scopes = 'playlist-modify-public playlist-modify-private';
    const url = `${authUrl}?response_type=token&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    window.location = url;
}

function generatePlaylist() {
    hideError();
    const description = document.getElementById('descriptionInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);

    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }
    
    if (!accessToken) {
        showError('Fehler bei der Authentifizierung. Bitte erneut versuchen.');
        return;
    }

    playlistElement.innerHTML = '';
    const tag = description;
    searchSongs(tag, numSongs);
}

function searchSongs(query, limit) {
    fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(response => response.json())
    .then(data => {
        data.tracks.items.forEach((track, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-item';
            songItem.innerHTML = `
                <span>${index + 1}. </span>
                <img src="${track.album.images[0]?.url || ''}" alt="${track.name}">
                <div>
                    <h3>${track.name}</h3>
                    <p>${track.artists.map(artist => artist.name).join(', ')}</p>
                </div>
            `;
            playlistElement.appendChild(songItem);
        });
        savePlaylistButton.classList.remove('hidden');
    })
    .catch(err => {
        showError('Fehler beim Abrufen der Lieder. Bitte versuchen Sie es erneut.');
    });
}

function savePlaylist() {
    alert('Funktion zur Speicherung der Playlist auf Spotify ist derzeit in Bearbeitung.');
}
