$("body").append(`<div id="music-player-hitbox"></div>`);
const musicPlayerContainer = $("<div id='music-player-container'></div>");
musicPlayerContainer.html(`
<div id="music-player-icon"><img src="" alt="Album Art" /></div>
<div id="music-player-title">Select a song</div>
<div id="music-player-controls">
<button id="music-player-back-button"><img src="/images/music-forward.svg" /></button>
<button id="music-player-play-button"><img src="/images/music-play.svg" /></button>
<button id="music-player-forward-button"><img src="/images/music-forward.svg" /></button>
</div>
<audio id="music-player-audio" preload="auto"></audio>
`);

const musicStyleElement = $("<style></style>");
musicStyleElement.html(`
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');
#music-player-container {
  position: fixed;
  bottom: 1vw;
  right: 0vh;
  height: 19vh;
  width: 25.5vh;
  transform: translateX(+25.5vh) scale(1);
  transition: all 0.5s ease-in-out;
  z-index: 9998;
}
#music-player-icon img {
  height: 70%;
  width: 70%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 1vh;
  object-fit: cover;
}
#music-player-container div {
  height: calc(50% - 0.4vh);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(4px);
  border-radius: 1vh;
  border: solid 2px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  color: white;
}
#music-player-icon {
  position: absolute;
  left: 0px;
  top: 0px;
  height: 50%;
  aspect-ratio: 1;
  border-radius: 1vh;
  overflow: hidden;
}
#music-player-title {
  position: absolute;
  right: 0px;
  top: 0px;
  width: calc(66.67% - 1.4vh);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: row;
  font-family: 'Instrument Sans', sans-serif;
  font-weight: 600;
  font-size: 1.5vh;
  text-align: center;
  padding: 0.5vh;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
#music-player-controls {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 1vh;
}
#music-player-hitbox {
  position: fixed;
  bottom: 1vw;
  right: 1vw;
  height: 19vh;
  width: 25.5vh;
  z-index: 9998;
}
body:has(#music-player-hitbox:hover) #music-player-container, #music-player-container:hover {
  transform: translateX(-1vw) scale(1);
}
#music-player-controls button {
  height: 100%;
  aspect-ratio: 1;
  border-radius: 1vh;
  background-color: transparent;
  border: none;
  transition: all 0.3s ease-in-out;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
#music-player-controls button img {
  height: 50%;
  transition: all 0.3s ease-in-out;
}
#music-player-controls button:hover {
  background-color: #000;
  filter: invert(1);
}

#music-player-back-button img {
  transform: rotate(180deg);
}`);

musicStyleElement.appendTo("head");
$("body").append(musicPlayerContainer);

// Music player functionality
const MusicPlayer = (function () {
  // Song library
  const songs = [];
  let currentSongIndex = 0;
  let isPlaying = false;
  let songsLoaded = false;

  const audio = document.getElementById("music-player-audio");
  const playButton = document.getElementById("music-player-play-button");
  const backButton = document.getElementById("music-player-back-button");
  const forwardButton = document.getElementById("music-player-forward-button");
  const coverArt = document.querySelector("#music-player-icon img");
  const songTitle = document.getElementById("music-player-title");

  // Initialize player
  function init() {
    // Event listeners
    playButton.addEventListener("click", togglePlay);
    backButton.addEventListener("click", prevSong);
    forwardButton.addEventListener("click", nextSong);

    // Set the volume
    audio.volume = 0.05;

    // Audio events
    audio.addEventListener("ended", nextSong);
    audio.addEventListener("timeupdate", updateProgress);

    // Save current time before user leaves the page
    window.addEventListener("beforeunload", savePlayerState);
  }

  // Save player state to localStorage
  function savePlayerState() {
    console.log("Saving state. Current song index: " + currentSongIndex);
    const playerState = {
      songIndex: currentSongIndex,
      currentTime: audio.currentTime,
      isPlaying: isPlaying,
    };
    localStorage.setItem("musicPlayerState", JSON.stringify(playerState));
  }

  // Load player state from localStorage
  function loadPlayerState() {
    if (!songsLoaded) return; // Don't load state until songs are loaded

    const savedState = localStorage.getItem("musicPlayerState");
    console.log("Loading saved state:", savedState);

    if (savedState && songs.length > 0) {
      try {
        const playerState = JSON.parse(savedState);

        // Make sure the saved index is valid
        if (
          playerState.songIndex >= 0 &&
          playerState.songIndex < songs.length
        ) {
          console.log("Loading song at index: " + playerState.songIndex);
          // Load the song
          currentSongIndex = playerState.songIndex;
          const song = songs[currentSongIndex];

          audio.src = song.src;
          songTitle.textContent = song.title;
          coverArt.src = song.cover;

          // Set the current time
          if (playerState.currentTime) {
            audio.currentTime = playerState.currentTime;
          }

          // If it was playing, start playing again
          if (playerState.isPlaying) {
            // We use a slight delay to ensure the audio is loaded
            setTimeout(() => {
              isPlaying = true;
              audio.play().catch((error) => {
                console.error("Error playing audio:", error);
                isPlaying = false;
                updatePlayButton();
              });
              updatePlayButton();
            }, 500);
          }
          return true; // Successfully loaded state
        }
      } catch (e) {
        console.error("Error parsing saved state:", e);
      }
    }

    // If we reach here, either no saved state or an error occurred
    if (songs.length > 0) {
      // Load the first song as fallback
      currentSongIndex = 0;
      const song = songs[0];
      audio.src = song.src;
      songTitle.textContent = song.title;
      coverArt.src = song.cover;
    }

    return false;
  }

  // Load song
  function loadSong(index) {
    if (songs.length === 0) {
      songTitle.textContent = "No songs available";
      return;
    }

    currentSongIndex = (index + songs.length) % songs.length;
    const song = songs[currentSongIndex];

    audio.src = song.src;
    songTitle.textContent = song.title;
    coverArt.src = song.cover;

    // Save the state whenever we change songs
    savePlayerState();

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }

  // Toggle play/pause
  function togglePlay() {
    if (songs.length === 0) return;

    isPlaying = !isPlaying;

    if (isPlaying) {
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        isPlaying = false;
        updatePlayButton();
      });
    } else {
      audio.pause();
    }

    updatePlayButton();
    savePlayerState();
  }

  // Update play button icon
  function updatePlayButton() {
    playButton.querySelector("img").src = isPlaying
      ? "/images/music-pause.svg"
      : "/images/music-play.svg";
  }

  // Next song
  function nextSong() {
    loadSong(currentSongIndex + 1);
  }

  // Previous song
  function prevSong() {
    loadSong(currentSongIndex - 1);
  }

  // Update progress (can be expanded for a progress bar)
  function updateProgress() {
    // Save state periodically during playback (every 5 seconds)
    if (
      isPlaying &&
      Math.floor(audio.currentTime) % 5 === 0 &&
      audio.currentTime > 0
    ) {
      savePlayerState();
    }
  }

  // Add a song to the playlist
  function addSong(songData) {
    songs.push(songData);

    // If this is the first song added and we haven't loaded state yet
    if (songs.length === 1 && !songsLoaded) {
      // Don't load the first song yet
    }
  }

  // Signal that all songs have been loaded
  function finishLoading() {
    songsLoaded = true;
    const stateLoaded = loadPlayerState();

    // If no state was loaded, default to the first song
    if (!stateLoaded && songs.length > 0) {
      loadSong(0);
    }
  }

  // Public API
  return {
    init,
    addSong,
    togglePlay,
    nextSong,
    prevSong,
    finishLoading,
  };
})();

// Initialize the music player
$(document).ready(function () {
  MusicPlayer.init();

  MusicPlayer.addSong({
    title: "AP Skelly",
    src: "https://songs-sage.vercel.app/songs/AP Skelly.mp3",
    cover: "/images/cover/AP Skelly.jpg",
  });

  MusicPlayer.addSong({
    title: "Drank Love",
    src: "https://songs-sage.vercel.app/songs/Drank Love.mp3",
    cover: "/images/cover/Drank Love.jpg",
  });

  MusicPlayer.addSong({
    title: "Fent",
    src: "https://songs-sage.vercel.app/songs/Fent.mp3",
    cover: "/images/cover/Fent.jpg",
  });

  MusicPlayer.addSong({
    title: "Gta",
    src: "https://songs-sage.vercel.app/songs/Gta.mp3",
    cover: "/images/cover/Gta.jpg",
  });

  MusicPlayer.addSong({
    title: "Keep Cryin",
    src: "https://songs-sage.vercel.app/songs/Keep Cryin.mp3",
    cover: "/images/cover/Keep Cryin.jpg",
  });

  MusicPlayer.addSong({
    title: "Kickback",
    src: "https://songs-sage.vercel.app/songs/Kickback.mp3",
    cover: "/images/cover/Kickback.jpg",
  });

  MusicPlayer.addSong({
    title: "Million Dollar",
    src: "https://songs-sage.vercel.app/songs/Million Dollar.mp3",
    cover: "/images/cover/Million Dollar.jpg",
  });

  MusicPlayer.addSong({
    title: "No Clout",
    src: "https://songs-sage.vercel.app/songs/No Clout.mp3",
    cover: "/images/cover/No Clout.jpg",
  });

  MusicPlayer.addSong({
    title: "No Dissin",
    src: "https://songs-sage.vercel.app/songs/No Dissin.mp3",
    cover: "/images/cover/No Dissin.jpg",
  });

  MusicPlayer.addSong({
    title: "Perky Dream",
    src: "https://songs-sage.vercel.app/songs/Perky Dream.mp3",
    cover: "/images/cover/Perky Dream.jpg",
  });

  MusicPlayer.addSong({
    title: "Swerve",
    src: "https://songs-sage.vercel.app/songs/Swerve.mp3",
    cover: "/images/cover/Swerve.jpg",
  });

  MusicPlayer.addSong({
    title: "Ain Goin' To Heaven",
    src: "https://songs-sage.vercel.app/songs/Ain Goin' To Heaven.mp3",
    cover: "/images/cover/Ain Goin' To Heaven.jpg",
  });

  MusicPlayer.addSong({
    title: "Goin' To Hell",
    src: "https://songs-sage.vercel.app/songs/Goin' To Hell.mp3",
    cover: "/images/cover/Goin' To Hell.jpg",
  });

  MusicPlayer.addSong({
    title: "off the leash!",
    src: "https://songs-sage.vercel.app/songs/off the leash! (feat. yvngxchris and Luisss).mp3",
    cover: "/images/cover/off the leash! (feat. yvngxchris and Luisss).jpg",
  });

  // Add the new songs
  MusicPlayer.addSong({
    title: "YEAH (RIOLEYVA)",
    src: "https://songs-sage.vercel.app/songs/YEAH (RIOLEYVA).mp3",
    cover: "/images/cover/YEAH (RIOLEYVA).jpg",
  });

  MusicPlayer.addSong({
    title: "DESERT SHIT",
    src: "https://songs-sage.vercel.app/songs/DESERT SHIT.mp3",
    cover: "/images/cover/DESERT SHIT.jpg",
  });

  MusicPlayer.addSong({
    title: "All Different",
    src: "https://songs-sage.vercel.app/songs/All Different (ft YEAT ) Prod. Luca malaspina.mp3",
    cover: "/images/cover/All Different (ft YEAT ) Prod. Luca malaspina.jpg",
  });

  MusicPlayer.addSong({
    title: "Relapsed!",
    src: "https://songs-sage.vercel.app/songs/Relapsed!.mp3",
    cover: "/images/cover/Relapsed!.jpg",
  });

  MusicPlayer.addSong({
    title: "Fan Burger",
    src: "https://songs-sage.vercel.app/songs/Fan Burger.mp3",
    cover: "/images/cover/Fan Burger.jpg",
  });

  // Signal that all songs have been loaded
  MusicPlayer.finishLoading();
});
