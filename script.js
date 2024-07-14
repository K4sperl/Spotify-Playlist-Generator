// Spotify API Credentials
const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
const SCOPES = 'playlist-modify-public playlist-modify-private';
let accessToken = '';
let refreshToken = '';
let expiresIn = 0;

// Event Listener for Generate Button
document.getElementById('generateButton').addEventListener('click', function() {
    const description = document.getElementById('descriptionInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);
    if (numSongs < 10 || numSongs > 10000 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 10.000).');
        return;
    }
    // Check if accessToken is already set and not expired
    if (accessToken && expiresIn > Date.now()) {
        generatePlaylist(description, numSongs); // Proceed to generate playlist
    } else {
        initiateSpotifyAuth(); // Otherwise, initiate Spotify authorization
    }
});

// Function to validate number input
function validateNumberInput(input) {
    const value = input.value;
    if (!/^\d*$/.test(value)) {
        input.value = value.replace(/\D/g, '');
    }
}

// Function to show error message
function showError(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Function to hide error message
function hideError() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
}

// Function to initiate Spotify authorization
function initiateSpotifyAuth() {
    const state = generateRandomString(16);
    const authUrl = 'https://accounts.spotify.com/authorize';
    let url = `${authUrl}?response_type=code`;
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

// Function to exchange authorization code for access token and refresh token
function exchangeCodeForToken(code) {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const params = {
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID
    };

    return fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params)
    })
    .then(response => response.json())
    .then(data => {
        accessToken = data.access_token;
        refreshToken = data.refresh_token;
        expiresIn = Date.now() + (data.expires_in * 1000); // Convert expiresIn to milliseconds
        // Optionally, save tokens to localStorage or session storage for persistence
        // localStorage.setItem('spotifyAccessToken', accessToken);
        // localStorage.setItem('spotifyRefreshToken', refreshToken);
        // localStorage.setItem('spotifyTokenExpiration', expiresIn);
    })
    .catch(error => {
        console.error('Error exchanging code for token:', error);
    });
}

// Function to generate playlist
function generatePlaylist(description, numSongs) {
    hideError();

    const tags = description.split(',').map(tag => tag.trim());
    let generatedSongs = 0;
    const playlist = document.getElementById('playlist');
    playlist.innerHTML = '';

    const excludedArtists = ['Twenty4Tim', 'Rock']; // Artists to exclude

    const interval = setInterval(() => {
        if (generatedSongs >= numSongs) {
            clearInterval(interval);
            document.getElementById('savePlaylistButton').style.display = 'block';
            return;
        }

        const tag = tags[generatedSongs % tags.length];
        searchSongs(tag, 10).then(songs => {
            // Filter songs based on excluded artists
            const filteredSongs = songs.filter(song => {
                const artists = song.artists.map(artist => artist.name);
                return !artists.some(artist => excludedArtists.includes(artist));
            });

            if (filteredSongs.length > 0) {
                const randomIndex = Math.floor(Math.random() * filteredSongs.length);
                const song = filteredSongs[randomIndex];
                const songItem = createSongItem(song);
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

// Function to create HTML element for song item
function createSongItem(song) {
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
    return songItem;
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

// Placeholder function to save playlist on Spotify (not implemented)
function savePlaylist(playlistName, songs) {
    const playlistDescription = 'Passe die Beschreibung an'; // Default description
    // Implementierung zur Speicherung der Playlist auf Spotify
    // Hier müsste die API-Aufruflogik für die Playlist-Speicherung stehen
}

// Check if authorization code is present in URL parameters (after redirect from Spotify)
const params = new URLSearchParams(window.location.search);
const code = params.get('code');

if (code) {
    exchangeCodeForToken(code)
        .then(() => {
            // Optional: Perform actions after successful token exchange
            // For example, hide login button, show user information, etc.
            generatePlaylist(description, parseInt(document.getElementById('numSongsInput').value, 10));
        });
}
