const playlistContainer = document.getElementById("playlistContainer");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// Sample song data for demonstration
let recentSearches = [];

// Function to search for songs on Spotify
async function searchSpotify() {
    const searchQuery = searchInput.value;
    const token = await getAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    const data = await response.json();
    const songs = data.tracks.items;

    // Filter out duplicates based on song ID
    const uniqueSongs = songs.filter(song => 
        !recentSearches.includes(song.id)
    );

    if (uniqueSongs.length > 0) {
        // Add the unique song IDs to recent searches
        uniqueSongs.forEach(song => recentSearches.push(song.id));
        
        // Shuffle the songs for a random order
        const shuffledSongs = shuffleArray(uniqueSongs);
        displayPlaylist(shuffledSongs);
    } else {
        alert("Keine neuen Songs gefunden!");
    }
}

// Get an access token from Spotify API
async function getAccessToken() {
    const clientId = 'YOUR_CLIENT_ID'; // Ersetze dies mit deiner Client-ID
    const clientSecret = 'YOUR_CLIENT_SECRET'; // Ersetze dies mit deinem Client-Secret
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
}

// Shuffle the songs array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Display the playlist in the container
function displayPlaylist(songs) {
    playlistContainer.innerHTML = ""; // Clear previous playlist

    // Display filtered songs in playlist container
    songs.forEach((song) => {
        // Create song item container
        const songElement = document.createElement("div");
        songElement.className = "song-item";

        // Song details
        songElement.innerHTML = `
            <div class="song-info">
                <div class="song-title">${song.name}</div>
                <div class="song-artist">${song.artists.map(artist => artist.name).join(", ")}</div>
            </div>
            <div class="controls">
                <button onclick="playSong('${song.preview_url}')">Play</button>
                <button onclick="replaceSong('${song.id}')">Replace</button>
            </div>
        `;

        playlistContainer.appendChild(songElement);
    });
}

// Function to play a song
function playSong(previewUrl) {
    if (previewUrl) {
        const audio = new Audio(previewUrl);
        audio.play();
    } else {
        alert("Keine Vorschau für diesen Song verfügbar.");
    }
}

// Function to replace a song (you can implement your own logic)
function replaceSong(songId) {
    // You can implement the replacement logic here
    alert(`Song mit ID ${songId} wurde ersetzt!`);
}

// Event listener for search button
searchButton.addEventListener("click", searchSpotify);
