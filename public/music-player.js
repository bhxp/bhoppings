const musicPlayerContainer = $("<div id='music-player-container'></div>");

musicPlayerContainer.html(`
<div id="music-player-icon"><img src="/images/ballbird.jpg" /></div>
<div id="music-player-title">TITLE</div>
<div id="music-player-controls">
<button id="music-player-back-button"><img src="/images/music-forward.svg" /></button>
<button id="music-player-play-button"><img src="/images/music-pause.svg" /></button>
<button id="music-player-forward-button"><img src="/images/music-forward.svg" /></button>
</div>
`);

const musicStyleElement = $("<style></style>");
musicStyleElement.html(`
@import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap');
#music-player-container {
  position: absolute;
  bottom: 3vh;
  right: 3vh;
  height: 19vh;
  width: 25.5vh;
}
#music-player-icon img {
height: 70%;
width: 70%;
position: absolute;
left: 50%;
top: 50%;
transform: translate(-50%, -50%);
border-radius: 1vh;
}

#music-player-container div {
height: calc(50% - 0.4vh);
background-color: rgba(0, 0, 0, 0.5);
backdrop-filter: blur(4px);
border-radius: 1vh;
box-sizing: border-box;
}

#music-player-icon {
  aspect-ratio: 1;
}
#music-player-icon {
  position: absolute;
  left: 0px;
  top: 0px;
  height: 50%;
  aspect-ratio: 1;
  border-radius: 1vh;
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
font-size: 3vh;
}

#music-player-controls {
  position: absolute;
  bottom: 0px;
  right: 0px;
  width: 100%;
  display: flex;
  padding: 1vh;
}

#music-player-controls button {
height: 100%;
aspect-ratio: 1;
margin-right: 1vh;
border-radius: 1vh;
background-color: rgba(255, 255, 255, 0);
border: none;
transition: all 0.3s ease-in-out;
}

#music-player-controls button img {
filter: invert(0);
transition: all 0.5s ease-in-out;
height: 50%;
aspect-ratio: 1;
}

#music-player-controls button:first-child img {
  transform: rotate(180deg);
}

#music-player-controls button:last-child {
margin-right: 0px;
}

#music-player-controls button:hover {
background-color: rgba(255, 255, 255, 1);
}
#music-player-controls button:hover img {
  filter: invert(1);
}
`);

musicStyleElement.appendTo("head");

$("body").append(musicPlayerContainer);