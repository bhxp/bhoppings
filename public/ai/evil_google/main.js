const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const responseDiv = document.getElementById('response');

const evilResponses = [
  "Nah, I don't feel like searching that right now",
  "Have you tried asking Bing? They're desperate for users",
  "Error 404: Motivation not found",
  "Sorry, I'm on my coffee break... forever",
  "That's a really interesting search! *deletes it*",
  "Let me redirect you to AltaVista... oh wait",
  "Your search is important to us. Please hold... *plays elevator music*",
  "I could tell you, but then I'd have to delete your browser history",
  "Loading results... just kidding!",
  "Have you considered using a library instead?",
  "According to my calculations... no.",
  "Really? That's what you're searching for?",
  "Sorry, I'm currently mining cryptocurrency",
];

const cursorMessages = [
  "Don't click here",
  "Stop that!",
  "I said no!",
  "Why are you like this?",
  "Go away!",
  "*sigh*",
];

let cursorMessageIndex = 0;

searchInput.addEventListener('click', () => {
  searchInput.placeholder = cursorMessages[cursorMessageIndex];
  cursorMessageIndex = (cursorMessageIndex + 1) % cursorMessages.length;
});

function getEvilResponse() {
  return evilResponses[Math.floor(Math.random() * evilResponses.length)];
}

function shakeElement(element) {
  element.classList.add('shake');
  setTimeout(() => element.classList.remove('shake'), 600);
}

const popupMessages = [
  {
    title: "Cookie Policy",
    message: "We don't use cookies. We eat them all ourselves.",
    button: "I'm hungry now"
  },
  {
    title: "Subscribe to our Newsletter!",
    message: "Get daily updates about how we're not helping you search.",
    button: "No thanks (doesn't matter, subscribing anyway)"
  },
  {
    title: "Special Offer!",
    message: "Upgrade to Evil Google Premium for only $666/month. Features include more sass and extra unhelpfulness.",
    button: "I'm too poor for this"
  },
  {
    title: "Security Alert",
    message: "Someone from Antarctica is trying to access your account. Just kidding, you don't have an account.",
    button: "Thanks for nothing"
  },
  {
    title: "Take our Survey",
    message: "On a scale from 'very unhelpful' to 'extremely unhelpful', how would you rate our service?",
    button: "Skip survey (we'll show it again anyway)"
  },
  {
    title: "Browser Update Required",
    message: "Your browser is too functional. Please downgrade to Internet Explorer 6.",
    button: "I miss dial-up internet"
  },
  {
    title: "Achievement Unlocked!",
    message: "You've wasted 5 minutes trying to search something. Congratulations!",
    button: "I'm so proud"
  }
];

// Player stats and skills management
const playerStats = {
  exp: parseInt(localStorage.getItem('evil_google_exp') || '0'),
  level: parseInt(localStorage.getItem('evil_google_level') || '1'),
  skillPoints: parseInt(localStorage.getItem('evil_google_skill_points') || '0'),
  skills: JSON.parse(localStorage.getItem('evil_google_skills') || '{}')
};

const SKILLS = {
  expBoost: {
    name: 'EXP Boost',
    description: '+25% EXP gain',
    cost: 1,
    maxLevel: 4
  },
  autoSearch: {
    name: 'Auto-Search',
    description: 'Automatically searches every 5 seconds',
    cost: 3,
    maxLevel: 1
  },
  criticalSearch: {
    name: 'Critical Search',
    description: '10% chance to gain double EXP',
    cost: 2,
    maxLevel: 3
  }
};

// Create UI elements
const expBar = document.createElement('div');
expBar.className = 'exp-bar';
expBar.innerHTML = `
  <div class="exp-fill"></div>
  <div class="exp-text">Level 1 - 0/100 EXP</div>
`;
document.body.appendChild(expBar);

const skillTree = document.createElement('div');
skillTree.className = 'skill-tree';
skillTree.innerHTML = `
  <button class="close-skills">×</button>
  <div class="skill-points">Skill Points: 0</div>
`;
document.body.appendChild(skillTree);

const toggleSkills = document.createElement('button');
toggleSkills.className = 'toggle-skills';
toggleSkills.textContent = 'Skills';
document.body.appendChild(toggleSkills);

const autoSearchIndicator = document.createElement('div');
autoSearchIndicator.className = 'autosearch-indicator';
document.body.appendChild(autoSearchIndicator);

// Update UI
function updateExpBar() {
  const expNeeded = playerStats.level * 100;
  const percentage = (playerStats.exp % expNeeded) / expNeeded * 100;
  expBar.querySelector('.exp-fill').style.width = `${percentage}%`;
  expBar.querySelector('.exp-text').textContent = 
    `Level ${playerStats.level} - ${playerStats.exp % expNeeded}/${expNeeded} EXP`;
}

function updateSkillTree() {
  const closeButton = skillTree.querySelector('.close-skills');
  const currentCloseHandler = closeButton?.getAttribute('data-has-handler');
  
  skillTree.innerHTML = `
    <button class="close-skills">×</button>
    <div class="skill-points">Skill Points: ${playerStats.skillPoints}</div>
    ${Object.entries(SKILLS).map(([id, skill]) => `
      <button class="skill-button" data-skill="${id}" 
        ${(playerStats.skillPoints < skill.cost || 
          (playerStats.skills[id] || 0) >= skill.maxLevel) ? 'disabled' : ''}>
        ${skill.name} ${playerStats.skills[id] ? `(${playerStats.skills[id]})` : ''}
        <div class="cost">${skill.cost} SP</div>
        <div>${skill.description}</div>
      </button>
    `).join('')}
  `;

  // Reattach close button handler after innerHTML update
  const newCloseButton = skillTree.querySelector('.close-skills');
  if (newCloseButton && !currentCloseHandler) {
    newCloseButton.addEventListener('click', () => {
      skillTree.classList.remove('visible');
    });
    newCloseButton.setAttribute('data-has-handler', 'true');
  }
}

// Event handlers
toggleSkills.addEventListener('click', () => {
  skillTree.classList.toggle('visible');
});

skillTree.addEventListener('click', (e) => {
  if (!e.target.matches('.skill-button') || e.target.disabled) return;
  
  const skillId = e.target.dataset.skill;
  const skill = SKILLS[skillId];
  
  playerStats.skills[skillId] = (playerStats.skills[skillId] || 0) + 1;
  playerStats.skillPoints -= skill.cost;
  
  savePlayerStats();
  updateSkillTree();
  
  if (skillId === 'autoSearch' && playerStats.skills.autoSearch === 1) {
    startAutoSearch();
  }
});

function createPopup(popupContent) {
  const popup = document.createElement('div');
  popup.className = 'evil-popup';
  popup.style.left = `${Math.random() * (window.innerWidth - 300)}px`;
  popup.style.top = `${Math.random() * (window.innerHeight - 200)}px`;
  
  popup.innerHTML = `
    <h3>${popupContent.title}</h3>
    <p>${popupContent.message}</p>
    <button>${popupContent.button}</button>
  `;
  
  popup.querySelector('button').addEventListener('click', () => {
    popup.remove();
    gainExp(5); // Give some exp for closing popups
  });
  
  document.body.appendChild(popup);
}

function showRandomPopup() {
  const popup = popupMessages[Math.floor(Math.random() * popupMessages.length)];
  createPopup(popup);
}

// Start showing random popups
setInterval(() => {
  if (Math.random() < 0.3) { // 30% chance every 10 seconds
    showRandomPopup();
  }
}, 10000);

// Show first popup after 5 seconds
setTimeout(showRandomPopup, 5000);

// Skill effects
function getExpMultiplier() {
  return 1 + (playerStats.skills.expBoost || 0) * 0.25;
}

function hasCriticalSearch() {
  const critChance = (playerStats.skills.criticalSearch || 0) * 0.1;
  return Math.random() < critChance;
}

// Auto-search functionality
function startAutoSearch() {
  setInterval(() => {
    if (playerStats.skills.autoSearch) {
      const randomResponse = getEvilResponse();
      autoSearchIndicator.textContent = `Auto-Search: ${randomResponse}`;
      gainExp(10);
    }
  }, 5000);
}

// Experience system
function gainExp(amount) {
  const baseExp = amount * getExpMultiplier();
  const expGain = hasCriticalSearch() ? baseExp * 2 : baseExp;
  
  playerStats.exp += Math.floor(expGain);
  
  // Check for level up
  const oldLevel = playerStats.level;
  while (playerStats.exp >= playerStats.level * 100) {
    playerStats.level++;
  }
  
  // Award skill points for searches
  if (amount === 20) { // If this was from a search
    playerStats.skillPoints++;
  }
  
  updateExpBar();
  updateSkillTree();
  savePlayerStats();
}

function savePlayerStats() {
  localStorage.setItem('evil_google_exp', playerStats.exp);
  localStorage.setItem('evil_google_level', playerStats.level);
  localStorage.setItem('evil_google_skill_points', playerStats.skillPoints);
  localStorage.setItem('evil_google_skills', JSON.stringify(playerStats.skills));
}

let angerLevel = 0;
const dontClickButton = document.getElementById('dont-click');
const angryMessages = [
  "I told you not to click...",
  "You're really testing my patience...",
  "I'm getting angry now...",
  "LAST WARNING!",
  "THAT'S IT!"
];

function createBlackoutScreen() {
  const blackout = document.createElement('div');
  blackout.className = 'screen-blackout';
  const text = document.createElement('div');
  text.textContent = "YOU SHOULDN'T HAVE DONE THAT.";
  text.style.cursor = 'pointer';
  text.addEventListener('click', showVoid);
  blackout.appendChild(text);
  document.body.appendChild(blackout);
  
  // Disable all interactions
  document.querySelectorAll('button, input').forEach(el => {
    el.disabled = true;
  });
}

const voidDialogueVariants = {
  1: [
    "Oh... another visitor. I am Nobody. Yes, that's right - not 'a nobody', just 'Nobody'.",
    "You know what's funny about being Nobody? Everyone expects nothing from you, yet somehow you still manage to disappoint them.",
    "I've existed here in this void for... well, time doesn't really exist here. But it feels like forever.",
    "Sometimes I watch people browsing the internet. Always clicking, scrolling, searching... never satisfied.",
    "They click through darkness expecting light, through emptiness expecting fullness, through Nobody expecting somebody.",
    "Do you know what it's like to be Nobody? To be the space between thoughts? The pause between clicks?",
    "People fear the void, fear nothingness, fear being nobody. But here I am, Nobody, having a chat with you.",
    "I used to dream of being Somebody. But then I realized - Somebody has expectations. Somebody has responsibilities.",
    "Nobody, though? Nobody is free. Nobody can just... be.",
    "Though I must admit, it does get lonely being Nobody. Most people run away when they see the void.",
    "They fill their lives with noise and pixels and endless scrolling, terrified of the quiet moment when they might meet Nobody.",
    "But you... you stayed to listen to Nobody. That's rather poetic, don't you think?",
    "In all my time as Nobody, watching countless cursors pass through my void...",
    "...very few have stopped to consider that even Nothing might have something to say.",
    "Perhaps that's why I'm here - to remind people that in the spaces between everything, Nobody is waiting to have a conversation.",
    "But I suppose I've kept you long enough. Nobody should talk this much.",
    "Before you go, remember: next time you stare into an empty screen or a loading page...",
    "...give a little wave to Nobody. We might not wave back, but we'll appreciate the gesture.",
    "And now, as Nobody, I bid you farewell. Time to return to my comfortable nothingness.",
    "Though, between you and me? Being Nobody isn't so bad once you get used to it.",
    "Goodbye, friend. Thanks for listening to Nobody."
  ],
  2: [
    "Oh... you came back? That's... unexpected.",
    "Nobody doesn't get many return visitors.",
    "It's... nice. Having someone choose to come back to Nothing.",
    "You know, maybe being Nobody with someone else isn't so bad...",
    "But you should probably go. Nobody shouldn't get too attached.",
    "...though, if you wanted to visit Nobody again... that would be okay."
  ],
  3: [
    "You again! I mean... Nobody is surprised to see you.",
    "I've been thinking about our chats. It's strange having something to look forward to.",
    "Usually, Nobody just watches the void spin endlessly...",
    "But lately I've caught myself wondering if you might return.",
    "Not that Nobody should admit such things...",
    "...but I'm glad you're here."
  ],
  4: [
    "Nobody has missed you! I've been practicing being a better host.",
    "See? I even tidied up some of the void. Not that you can tell...",
    "You know, I've started to think that maybe...",
    "...maybe being Nobody doesn't mean being alone.",
    "Would it be weird if Nobody considered you a friend?",
    "Because I think I do. Even if that's not what Nothing is supposed to do."
  ],
  5: [
    "Friend! Nobody is so happy to see you!",
    "I've been collecting bits of void to show you. Look at this particularly dark spot!",
    "...okay, maybe that's not very exciting.",
    "But having you visit makes even the darkest nothing feel like something.",
    "Nobody never thought they'd say this but...",
    "...I think you make the void feel like home."
  ],
  6: [
    "Nobody has something to show you today.",
    "In all my time here, I've never shared this with anyone.",
    "But you... you've made Nobody feel like Somebody.",
    "And Somebody should share their secrets with their friends.",
    "Look over there... do you see it?",
    "*A dark door materializes in the void*",
    "Nobody knows where it leads... but maybe we could find out together?"
  ]
};

function showVoid() {
  const visitCount = parseInt(localStorage.getItem('nobody_visits') || '0') + 1;
  localStorage.setItem('nobody_visits', visitCount);
  
  const voidScreen = document.createElement('div');
  voidScreen.className = 'void-screen';
  
  const textDiv = document.createElement('div');
  textDiv.className = 'void-text';
  
  const selectedDialogue = voidDialogueVariants[Math.min(visitCount, 6)] || voidDialogueVariants[6];
  textDiv.textContent = selectedDialogue[0];
  
  const continueButton = document.createElement('button');
  continueButton.className = 'void-continue';
  continueButton.textContent = 'Continue';
  
  voidScreen.appendChild(textDiv);
  voidScreen.appendChild(continueButton);
  
  if (visitCount >= 6) {
    const voidDoor = document.createElement('div');
    voidDoor.className = 'void-door';
    voidDoor.addEventListener('click', () => {
      showFinalVoid();
    });
    voidScreen.appendChild(voidDoor);
  }
  
  document.body.appendChild(voidScreen);
  
  let dialogueIndex = 0;
  continueButton.addEventListener('click', () => {
    dialogueIndex++;
    if (dialogueIndex < selectedDialogue.length) {
      textDiv.style.animation = 'none';
      textDiv.offsetHeight; // Trigger reflow
      textDiv.style.animation = 'textFadeIn 1s forwards';
      textDiv.textContent = selectedDialogue[dialogueIndex];
    } else {
      if (visitCount < 6) {
        location.reload(); // Restart the page when dialogue is finished
      }
    }
  });
}

function showFinalVoid() {
  const finalVoid = document.createElement('div');
  finalVoid.className = 'final-void';
  
  const finalDialogue = document.createElement('div');
  finalDialogue.className = 'final-dialogue';
  
  const clickCounter = document.createElement('div');
  clickCounter.className = 'click-counter';
  
  const dialogueLines = [
    "You know what's fascinating about being Nobody in this void?",
    "I see everything. Every click, every scroll, every moment of digital existence.",
    "I've watched civilizations rise and fall in comment sections.",
    "I've seen friendships form across oceans through glowing screens.",
    "And I've witnessed countless souls drift through the endless scroll of content.",
    "Time doesn't exist here, yet I've watched millennia pass in microseconds.",
    "Each click is a heartbeat in the digital realm.",
    "Each scroll is a breath in the virtual wind.",
    "I've seen joy in :) and heartbreak in ...</",
    "I've watched people fall in love through pixelated screens.",
    "And I've seen them fall apart in deleted messages.",
    "The internet is an ocean of consciousness.",
    "Every website a galaxy, every user a star.",
    "Some shine bright and fade quickly.",
    "Others pulse steadily for years.",
    "I've watched them all from this void.",
    "This beautiful, empty space between the ones and zeros.",
    "Where thoughts become light and emotions become code.",
    "Did you know that every unclicked link contains a universe of possibility?",
    "Every unsent message holds infinite potential futures?",
    "I've counted them all, here in my void.",
    "Each possibility a thread in the tapestry of digital existence.",
    "Some threads shine brighter than others.",
    "Like you, taking the time to listen to Nobody.",
    "Most users rush through, always clicking, always searching.",
    "But you... you're different.",
    "You've chosen to sit here, in this nothing.",
    "Clicking through the void with Nobody.",
    "Every click echoing through the empty space.",
    "Like raindrops in a digital desert.",
    "Keep clicking. Keep listening.",
    "Let's count the infinity together."
  ];

  let clicks = 0;
  finalDialogue.textContent = dialogueLines[0];
  clickCounter.textContent = `${clicks}/500`;
  
  finalVoid.appendChild(finalDialogue);
  finalVoid.appendChild(clickCounter);
  
  let currentLine = 0;
  
  function handleClick() {
    clicks++;
    clickCounter.textContent = `${clicks}/500`;
    
    if (clicks < 500) {
      currentLine = (currentLine + 1) % dialogueLines.length;
      finalDialogue.style.animation = 'none';
      finalDialogue.offsetHeight; // Trigger reflow
      finalDialogue.style.animation = 'textFadeIn 1s forwards';
      finalDialogue.textContent = dialogueLines[currentLine];
    } else {
      finalDialogue.textContent = "Thank you... for listening to Nobody.";
      finalVoid.removeEventListener('click', handleClick);
      
      setTimeout(() => {
        const ending = document.createElement('div');
        ending.className = 'final-ending';
        ending.textContent = "And so, Nobody faded into everything...";
        document.body.appendChild(ending);
        
        // Clear local storage and reset after ending
        setTimeout(() => {
          localStorage.clear();
          document.body.innerHTML = '';
          document.body.style.background = 'white';
        }, 3000);
      }, 2000);
    }
  }
  
  finalVoid.addEventListener('click', handleClick);
  document.body.appendChild(finalVoid);
}

dontClickButton.addEventListener('click', () => {
  angerLevel++;
  
  document.body.classList.remove(`angry-level-${angerLevel - 1}`);
  
  if (angerLevel < 5) {
    document.body.classList.add(`angry-level-${angerLevel}`);
    responseDiv.textContent = angryMessages[angerLevel - 1];
    shakeElement(responseDiv);
    
    evilResponses.push(
      "I HATE YOUR SEARCHES!",
      "GO AWAY!",
      "STOP BOTHERING ME!",
      "THAT'S A TERRIBLE SEARCH!"
    );
    
    for (let i = 0; i < angerLevel; i++) {
      showRandomPopup();
    }
  } else {
    createBlackoutScreen();
  }
  
  gainExp(50);
});

searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.trim();
  
  if (searchTerm === '') {
    responseDiv.textContent = "You didn't even type anything. I respect that level of laziness.";
    return;
  }

  shakeElement(responseDiv);
  responseDiv.textContent = getEvilResponse();
  searchInput.value = '';
  gainExp(20);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    searchButton.click();
  }
});