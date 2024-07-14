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

// Event Listener for Mit Spotify anmelden Button
loginButton.addEventListener('click', initiateSpotifyAuth);

// Event Listener for Generate Playlist Button
generateButton.addEventListener('click', function() {
    const description = document.getElementById('descriptionInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);
    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }
    generatePlaylist(description, numSongs);
});

// Event Listener for Save Playlist Button
savePlaylistButton.addEventListener('click', function() {
    const playlistName = document.getElementById('descriptionInput').value;
    savePlaylist(playlistName);
});

// Function to check login status and show appropriate sections
function checkLoginStatus() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    accessToken = params.get('access_token');
    expiresIn = parseInt(params.get('expires_in'));

    if (accessToken) {
        loginSection.style.display = 'none';
        generateSection.style.display = 'block';
        playlistSection.style.display = 'none'; // Hide playlist section initially
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
function generatePlaylist(description, numSongs) {
    hideError();
    const tags = description.split(',').map(tag => tag.trim());
    let generatedSongs = 0;
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';

    const addedSongs = new Set(); // Set to track added songs

    const interval = setInterval(() => {
        if (generatedSongs >= numSongs) {
            clearInterval(interval);
            savePlaylistButton.style.display = 'block';
            playlistSection.style.display = 'block'; // Show playlist section after generation
            return;
        }

        const tag = tags[generatedSongs % tags.length];
        searchSongs(tag, 10).then(songs => {
            const filteredSongs = songs.filter(song => {
                return !addedSongs.has(song.id);
            });

            if (filteredSongs.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredSongs.length);
                const song = filteredSongs[randomIndex];

                if (!addedSongs.has(song.id)) {
                    const songItem = createSongItem(song, generatedSongs + 1);
                    playlist.appendChild(songItem);
                    addedSongs.add(song.id);
                    generatedSongs++;
                }
            }
        }).catch(err => {
            console.error(err);
            showError('Fehler beim Abrufen der Lieder. Bitte versuchen Sie es erneut.');
            clearInterval(interval);
        });
    }, 1000);

    // Show playlist section and hide generate section
    generateSection.style.display = 'none';
    playlistSection.style.display = 'block';
}

// Function to create HTML element for song item
function createSongItem(song, number) {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';
    songItem.innerHTML = `
        <div class="song-number">${number}.</div>
        <img src="${song.album.images[0].url}" alt="${song.name}">
        <div class="song-info">
            <h3>${song.name}</h3>
            <p>${song.artists.map(artist => artist.name).join(', ')}</p>
            <audio class="song-audio" src="${song.preview_url}" type="audio/mpeg" controls></audio>
            <button class="replace-button">🔁</button>
        </div>
    `;
    songItem.querySelector('.replace-button').addEventListener('click', () => replaceSong(songItem, number));
    return songItem;
}

// Function to replace a song with a new random song
function replaceSong(songItem, number) {
    const description = document.getElementById('descriptionInput').value;
    const tags = description.split(',').map(tag => tag.trim());
    const tag = tags[number % tags.length];
    
    searchSongs(tag, 10).then(songs => {
        const filteredSongs = songs.filter(song => {
            return !addedSongs.has(song.id);
        });

        if (filteredSongs.length > 0) {
            const randomIndex = Math.floor(Math.random() * filteredSongs.length);
            const newSong = filteredSongs[randomIndex];

            songItem.innerHTML = `
                <div class="song-number">${number}.</div>
                <img src="${newSong.album.images[0].url}" alt="${newSong.name}">
                <div class="song-info">
                    <h3>${newSong.name}</h3>
                    <p>${newSong.artists.map(artist => artist.name).join(', ')}</p>
                    <audio class="song-audio" src="${newSong.preview_url}" type="audio/mpeg" controls></audio>
                    <button class="replace-button">🔁</button>
                </div>
            `;

            songItem.querySelector('.replace-button').addEventListener('click', () => replaceSong(songItem, number));
        }
    }).catch(err => {
        console.error(err);
        showError('Fehler beim Ersetzen des Liedes. Bitte versuchen Sie es erneut.');
    });
}

// Function to search songs on Spotify
function searchSongs(query, limit) {
    return fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => data.tracks.items);
}

// Function to save playlist on Spotify
function savePlaylist(playlistName) {
    // Hier müsste die API-Aufruflogik für die Playlist-Speicherung stehen
}

// Function to handle errors
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Function to hide error messages
function hideError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
}

// Function to validate number input
function validateNumberInput(input) {
    if (input.value < 10) {
        input.value = 10;
    } else if (input.value > 10000) {
        input.value = 10000;
    }
}

// Initialize the page
checkLoginStatus();
