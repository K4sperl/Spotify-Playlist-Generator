// Spotify API Credentials
const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
const SCOPES = 'playlist-modify-public playlist-modify-private';
let accessToken = '';
let expiresIn = 0;

// Elements
const loginSection = document.getElementById('loginSection');
const generateSection = document.getElementById('generateSection');
const playlistSection = document.getElementById('playlistSection');
const loginButton = document.getElementById('loginButton');
const generateButton = document.getElementById('generateButton');
const savePlaylistButton = document.getElementById('savePlaylistButton');
const playPlaylistButton = document.getElementById('playPlaylistButton');
const stopPlaylistButton = document.getElementById('stopPlaylistButton');
const playlistVolumeSlider = document.getElementById('playlistVolumeSlider');
const playlist = document.getElementById('playlist');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const reloadButton = document.getElementById('reloadButton');
const errorMessageBox = document.getElementById('error-message');

// Event Listeners
loginButton.addEventListener('click', initiateSpotifyAuth);
generateButton.addEventListener('click', generatePlaylist);
savePlaylistButton.addEventListener('click', savePlaylist);
playPlaylistButton.addEventListener('click', playPlaylist);
stopPlaylistButton.addEventListener('click', stopPlaylist);
prevButton.addEventListener('click', playPrevious);
nextButton.addEventListener('click', playNext);
reloadButton.addEventListener('click', reloadPage);
playlistVolumeSlider.addEventListener('input', adjustPlaylistVolume);

// Function to check login status and show appropriate sections
function checkLoginStatus() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    accessToken = params.get('access_token');
    expiresIn = parseInt(params.get('expires_in'));

    if (accessToken) {
        loginSection.style.display = 'none';
        generateSection.style.display = 'block';
        playlistSection.style.display = 'none';
        savePlaylistButton.style.display = 'none';
    } else {
        loginSection.style.display = 'block';
        generateSection.style.display = 'none';
        playlistSection.style.display = 'none';
        savePlaylistButton.style.display = 'none';
    }
}

// Function to initiate Spotify authorization
function initiateSpotifyAuth() {
    const state = generateRandomString(16);
    const authUrl = 'https://accounts.spotify.com/authorize';
    let url = `${authUrl}?response_type=token`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&scope=${encodeURIComponent(SCOPES)}`;
    url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    url += `&state=${state}`;

    window.location = url; // Redirect to Spotify authorization page
}

// Function to generate random string for state
function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

// Function to generate playlist
function generatePlaylist() {
    const description = document.getElementById('descriptionInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);
    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }
    hideError();
    playlist.innerHTML = '';
    // Implementieren Sie hier die Logik zum Generieren der Playlist
    // Beispiel:
    for (let i = 1; i <= numSongs; i++) {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';
        songItem.innerHTML = `
            <div class="song-number">${i}.</div>
            <div class="song-info">
                <h3>Example Song ${i}</h3>
                <p>Artist</p>
                <audio class="song-audio" controls>
                    <source src="https://example.com/example.mp3" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
                <input type="range" class="song-volume-slider" min="0" max="100" value="50">
            </div>
        `;
        playlist.appendChild(songItem);
    }
    playlistSection.style.display = 'block';
    savePlaylistButton.style.display = 'block';
    playPlaylistButton.style.display = 'inline-block';
    stopPlaylistButton.style.display = 'none';
}

// Function to save playlist on Spotify
function savePlaylist() {
    // Implementieren Sie hier die Logik zum Speichern der Playlist auf Spotify
}

// Function to play the entire playlist
function playPlaylist() {
    const audioElements = document.querySelectorAll('.song-audio');
    audioElements.forEach(audio => {
        audio.play();
    });
    playPlaylistButton.style.display = 'none';
    stopPlaylistButton.style.display = 'inline-block';
}

// Function to stop playing the playlist
function stopPlaylist() {
    const audioElements = document.querySelectorAll('.song-audio');
    audioElements.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    playPlaylistButton.style.display = 'inline-block';
    stopPlaylistButton.style.display = 'none';
}

// Function to play the previous song in the playlist
function playPrevious() {
    // Implementieren Sie hier die Logik zum Abspielen des vorherigen Songs
}

// Function to play the next song in the playlist
function playNext() {
    // Implementieren Sie hier die Logik zum Abspielen des nächsten Songs
}

// Function to adjust playlist volume
function adjustPlaylistVolume() {
    const volume = parseInt(playlistVolumeSlider.value) / 100;
    const songVolumeSliders = document.querySelectorAll('.song-volume-slider');
    songVolumeSliders.forEach(slider => {
        slider.value = playlistVolumeSlider.value;
        const audio = slider.parentElement.querySelector('.song-audio');
        audio.volume = volume;
    });
}

// Function to reload the page
function reloadPage() {
    location.reload();
}

// Function to handle errors
function showError(message) {
    errorMessageBox.textContent = message;
    errorMessageBox.style.display = 'block';
}

// Function to hide error messages
function hideError() {
    errorMessageBox.textContent = '';
    errorMessageBox.style.display = 'none';
}

// Initialize the page
checkLoginStatus();
