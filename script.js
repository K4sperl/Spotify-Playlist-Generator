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
const volumeSlider = document.getElementById('volumeSlider');
const songVolumeSlider = document.getElementById('songVolumeSlider');
const audioPlayer = document.getElementById('audioPlayer');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

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

// Event Listener for Play Playlist Button
playPlaylistButton.addEventListener('click', playPlaylist);

// Event Listener for Stop Playlist Button
stopPlaylistButton.addEventListener('click', stopPlaylist);

// Event Listener for Volume Slider (global)
volumeSlider.addEventListener('input', function() {
    const volume = parseInt(volumeSlider.value) / 100;
    audioPlayer.volume = volume;
});

// Event Listener for Song Volume Slider
songVolumeSlider.addEventListener('input', function() {
    const volume = parseInt(songVolumeSlider.value) / 100;
    audioPlayer.volume = volume;
});

// Event Listener for Previous Button
prevButton.addEventListener('click', playPrevious);

// Event Listener for Next Button
nextButton.addEventListener('click', playNext);

// Function to check login status and show appropriate sections
function checkLoginStatus() {
    if (accessToken) {
        loginSection.style.display = 'none';
        generateSection.style.display = 'block';
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
            <audio class="song-audio" src="${song.preview_url}" type="audio/mpeg"></audio>
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

// Function to save playlist on Spotify
function savePlaylist(playlistName) {
    const playlistDescription = 'Passe die Beschreibung an'; // Default description
    // Implementierung zur Speicherung der Playlist auf Spotify
    // Hier müsste die API-Aufruflogik für die Playlist-Speicherung stehen
}

// Function to play the entire playlist
function playPlaylist() {
    const audioElements = document.querySelectorAll('.song-audio');
    audioElements.forEach(audio => {
        audio.play();
    });
    playPlaylistButton.style.display = 'none';
    stopPlaylistButton
