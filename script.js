const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
let accessToken = '';

document.getElementById('loginButton').addEventListener('click', authorizeSpotify);
document.getElementById('generateButton').addEventListener('click', generatePlaylist);
document.getElementById('savePlaylistButton').addEventListener('click', savePlaylist);

window.onload = function() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    if (params.get('access_token')) {
        accessToken = params.get('access_token');
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('generateSection').style.display = 'block';
    }
};

function authorizeSpotify() {
    const scopes = 'playlist-modify-public playlist-modify-private';
    window.location = `https://accounts.spotify.com/authorize?response_type=token&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
}

function generatePlaylist() {
    const description = document.getElementById('descriptionInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);

    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte Anzahl der Lieder zwischen 10 und 10.000 angeben.');
        return;
    }
    hideError();

    document.getElementById('playlistSection').style.display = 'block';
    // Generating playlist logic here
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError() {
    document.getElementById('error-message').style.display = 'none';
}
