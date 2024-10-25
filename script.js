const playlistContainer = document.getElementById("playlistContainer");

// Sample song data (replace with actual Spotify API data if available)
const sampleSongs = [
    { title: "Song 1", artist: "Artist 1" },
    { title: "Song 2", artist: "Artist 2" },
    { title: "Song 3", artist: "Artist 3" },
    { title: "Song 4", artist: "Artist 4" },
];

// Function to generate a playlist based on the search input
function generatePlaylist() {
    const searchQuery = document.getElementById("searchInput").value;
    
    // Clear the playlist container
    playlistContainer.innerHTML = "";

    // Mock filtering songs based on search input
    const filteredSongs = sampleSongs.filter(song => 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Add filtered songs to the playlist container
    filteredSongs.forEach((song, index) => {
        const songElement = document.createElement("div");
        songElement.className = "song-item";
        
        songElement.innerHTML = `
            <div class="song-info">
                <div class="song-title">${song.title}</div>
                <div class="song-artist">${song.artist}</div>
            </div>
            <div class="controls">
                <button onclick="playSong(${index})">Play</button>
                <button onclick="replaceSong(${index})">Replace</button>
            </div>
        `;

        playlistContainer.appendChild(songElement);
    });
}

// Play button functionality
function playSong(index) {
    alert(`Playing: ${sampleSongs[index].title}`);
}

// Replace song functionality
function replaceSong(index) {
    const newSong = { title: `New Song ${index + 1}`, artist: `New Artist ${index + 1}` };
    sampleSongs[index] = newSong;
    generatePlaylist(); // Refresh playlist to show the updated song
}
