const CLIENT_ID = '0fe8c6577bda455581b8b36be7631e25';
const REDIRECT_URI = 'https://k4sperl.github.io/Spotify-Playlist-Generator.github.io';
let accessToken = '';
let expiresIn = 0;

// Select DOM elements
const loginSection = document.getElementById('loginSection');
const generateSection = document.getElementById('generateSection');
const playlistSection = document.getElementById('playlistSection');
const loginButton = document.getElementById('loginButton');
const generateButton = document.getElementById('generateButton');
const savePlaylistButton = document.getElementById('savePlaylistButton');
const errorMessage = document.getElementById('error-message');
const playlistElement = document.getElementById('playlist');

// Event listeners
loginButton.addEventListener('click', authorizeSpotify);
generateButton.addEventListener('click', generatePlaylist);
savePlaylistButton.addEventListener('click', savePlaylist);

// Check login status on page load
window.addEventListener('load', checkLoginStatus);

function checkLoginStatus() {
    const params = new URLSearchParams(window.location.hash.substring(1));
    accessToken = params.get('access_token');
    expiresIn = parseInt(params.get('expires_in'));

    if (accessToken) {
        loginSection.style.display = 'none';
        generateSection.style.display = 'block';
        playlistSection.style.display = 'none';
    } else {
        loginSection.style.display = 'block';
        generateSection.style.display = 'none';
        playlistSection.style.display = 'none';
        savePlaylistButton.style.display = 'none';
    }
}

function authorizeSpotify() {
    const authUrl = 'https://accounts.spotify.com/authorize';
    const scopes = 'playlist-modify-public playlist-modify-private';

    let url = `${authUrl}?response_type=token`;
    url += `&client_id=${CLIENT_ID}`;
    url += `&scope=${encodeURIComponent(scopes)}`;
    url += `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    url += `&state=${generateRandomString(16)}`;

    window.location.href = url;
}

function generateRandomString(length) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function hideError() {
    errorMessage.style.display = 'none';
}

function generatePlaylist() {
    const description = document.getElementById('descriptionInput').value;
    const excludeDescription = document.getElementById('excludeInput').value;
    const numSongs = parseInt(document.getElementById('numSongsInput').value, 10);

    if (numSongs < 10 || numSongs > 100 || isNaN(numSongs)) {
        showError('Bitte geben Sie eine gültige Anzahl von Liedern ein (mindestens 10, maximal 100).');
        return;
    }

    hideError();
    playlistElement.innerHTML = '';
    const includedTags = description.split(',').map(tag => tag.trim());
    const excludedTags = excludeDescription.split(',').map(tag => tag.trim());
    let generatedSongs = 0;
    const usedSongs = new Set();

    const interval = setInterval(() => {
        if (generatedSongs >= numSongs) {
            clearInterval(interval);
            playlistSection.style.display = 'block';
            savePlaylistButton.style.display = 'block';
            return;
        }

        const tag = includedTags[generatedSongs % includedTags.length];
        searchSongs(tag, 1).then(songs => {
            if (songs.length > 0) {
                const song = songs[0];

                // Check if the song is already used or in the excluded tags
                if (usedSongs.has(song.id) || excludedTags.some(tag => song.name.toLowerCase().includes(tag.toLowerCase()))) {
                    return;
                }

                usedSongs.add(song.id);
                addSongToPlaylist(song, generatedSongs + 1);
                generatedSongs++;
            }
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
        .then(data => data.tracks.items)
        .catch(error => {
            showError('Fehler beim Abrufen der Songs. Bitte versuchen Sie es erneut.');
            console.error('Error fetching songs:', error);
        });
}

function addSongToPlaylist(song, index) {
    const songItem = document.createElement('div');
    songItem.className = 'song-item';

    const songNumber = document.createElement('div');
    songNumber.className = 'song-number';
    songNumber.textContent = `${index}.`;

    const songImage = document.createElement('img');
    songImage.src = song.album.images[0].url;
    songImage.alt = song.name;

    const songInfo = document.createElement('div');
    songInfo.className = 'song-info';

    const songTitle = document.createElement('h3');
    songTitle.textContent = song.name;

    const songArtist = document.createElement('p');
    songArtist.textContent = song.artists.map(artist => artist.name).join(', ');

    const audioControls = document.createElement('div');
    audioControls.className = 'audio-controls';

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.src = song.preview_url;
    audio.type = 'audio/mpeg';

    const replaceButton = document.createElement('button');
    replaceButton.className = 'replace-button';
    replaceButton.textContent = '🔁';
    replaceButton.addEventListener('click', () => replaceSong(songItem, index, song.id));

    audioControls.appendChild(audio);
    audioControls.appendChild(replaceButton);

    songInfo.appendChild(songTitle);
    songInfo.appendChild(songArtist);

    songItem.appendChild(songNumber);
    songItem.appendChild(songImage);
    songItem.appendChild(songInfo);
    songItem.appendChild(audioControls);

    playlistElement.appendChild(songItem);
}

function replaceSong(songItem, index, songId) {
    const description = document.getElementById('descriptionInput').value;
    const includedTags = description.split(',').map(tag => tag.trim());
    const tag = includedTags[index % includedTags.length];

    searchSongs(tag, 1).then(songs => {
        if (songs.length > 0) {
            const newSong = songs[0];

            // Ensure the new song is different from the current one
            if (newSong.id !== songId) {
                songItem.querySelector('.song-info h3').textContent = newSong.name;
                songItem.querySelector('.song-info p').textContent = newSong.artists.map(artist => artist.name).join(', ');
                songItem.querySelector('img').src = newSong.album.images[0].url;
                songItem.querySelector('audio').src = newSong.preview_url;
            } else {
                replaceSong(songItem, index, songId); // Recursively call until a different song is found
            }
        }
    });
}

function savePlaylist() {
    const userId = ''; // Fetch the user ID dynamically if needed
    const playlistName = document.getElementById('descriptionInput').value;
    const playlistDescription = 'Passe die Beschreibung an';
    const trackUris = Array.from(document.querySelectorAll('.song-item audio')).map(audio => {
        const url = new URL(audio.src);
        return `spotify:track:${url.pathname.split('/').pop()}`;
    });

    fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: playlistName,
            description: playlistDescription,
            public: false
        })
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
                    uris: trackUris
                })
            });
        })
        .then(() => {
            alert('Playlist erfolgreich auf Spotify gespeichert!');
        })
        .catch(error => {
            showError('Fehler beim Speichern der Playlist auf Spotify. Bitte versuchen Sie es erneut.');
            console.error('Error saving playlist:', error);
        });
}
