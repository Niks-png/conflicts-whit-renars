const icons = [
    "🐱","🐶","🦊","🐼","🐸","🐵","🦄","🐙","🦁","🐯","🐮","🐷"
];

let allCards = []; // will hold current deck (duplicated & shuffled)
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let matches = 0;
let time = 0;
let timerInterval;
let totalPairs = 0;

const movesCounter = document.getElementById('moves');
const timeCounter = document.getElementById('time');
const gameContainer = document.getElementById("game");

function shuffle(array){
    for(let i = array.length -1; i>0; i--){
        let j = Math.floor(Math.random()*(i+1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array; // <-- return the shuffled array so callers can use the result
}

// Build and start a game for the given config (or fallback to easy)
function initGame(config){
    // config: { level, rows, cols }
    const cfg = config || (window.GAME_CONFIG || { level: 'easy', rows: 2, cols: 2 });
    const rows = cfg.rows;
    const cols = cfg.cols;
    const level = cfg.level || 'easy';

    // reset state
    clearInterval(timerInterval);
    timerInterval = null;
    moves = 0;
    matches = 0;
    time = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;

    movesCounter.textContent = moves;
    timeCounter.textContent = time;
    document.getElementById("final-moves").textContent = 0;
    document.getElementById("final-time").textContent = 0;
    document.getElementById("popup").classList.add("hidden");

    // layout
    const totalCards = rows * cols;
    totalPairs = totalCards / 2;

    // pick icons: take a shallow copy and shuffle, then slice needed pairs
    const iconsCopy = [...icons];
    shuffle(iconsCopy);
    const chosen = iconsCopy.slice(0, totalPairs);

    // duplicate and shuffle deck
    const deck = [...chosen, ...chosen];
    shuffle(deck);           // shuffle in-place
    allCards = deck;         // assign the shuffled deck
    // clear existing board
    gameContainer.innerHTML = '';
    // set grid columns
    gameContainer.style.gridTemplateColumns = `repeat(${cols}, 85px)`;
    // create card elements
    allCards.forEach(icon => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.icon = icon;
        card.innerHTML = `
            <div class="card-inner">
                <div class="front"></div>
                <div class="back">${icon}</div>
            </div>
        `;
        card.addEventListener("click", flipCard);
        gameContainer.appendChild(card);
    });
}

// Timer
function startTimer(){
    timerInterval = setInterval(() => {
        time++;
        timeCounter.textContent = time;
    }, 1000);
}

function flipCard(){
    if(lockBoard || this === firstCard) return;
    if(!timerInterval) startTimer();

    this.classList.add("flipped");

    if(!firstCard){
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    movesCounter.textContent = moves;
    checkMatch();
}

function resetBoard(){
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function endGame(){
    clearInterval(timerInterval);
    document.getElementById("final-moves").textContent = moves;
    document.getElementById("final-time").textContent = time;
    document.getElementById("popup").classList.remove("hidden");

    // save high score if helper exists
    const level = (window.GAME_CONFIG && window.GAME_CONFIG.level) ? window.GAME_CONFIG.level : 'easy';
    if(typeof window.saveHighScore === 'function'){
        try{
            window.saveHighScore(level, time, moves);
        }catch(e){
            // ignore save errors
        }
    }
}

function disableCards(){
    matches++;
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    resetBoard();
    if(matches === totalPairs){
        endGame();
    }
}

function unflipCards(){
    lockBoard = true;
    setTimeout(()=>{
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    },1000); // quicker feedback
}

function checkMatch(){
    let isMatch = firstCard.dataset.icon === secondCard.dataset.icon;
    isMatch ? disableCards() : unflipCards();
}

// Restart without reloading the page
function restartCurrent(){
    initGame(window.GAME_CONFIG);
}

// Wire up buttons
document.getElementById("restart").addEventListener("click", ()=> restartCurrent());
document.getElementById("play-again").addEventListener("click", ()=> restartCurrent());

// Listen for level changes dispatched by the inline manager
window.addEventListener('levelChange', (e)=>{
    initGame(e.detail);
});

// Initialize once DOM is ready (and after inline manager runs)
if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=> initGame(window.GAME_CONFIG));
}else{
    initGame(window.GAME_CONFIG);
}