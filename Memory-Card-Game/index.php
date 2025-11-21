<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Memory Card Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <header>
        <h1>Memory Card Game</h1>
        <div class="stats">
            <p>Moves: <span id="moves">0</span></p>
            <p>Time: <span id="time">0</span></p>
            <button id="restart">restart</button>
        </div>

        <!-- New: Level selector -->
        <div class="level-selector" aria-label="Choose difficulty">
            <label>
                <input type="radio" name="level" value="easy" checked> Easy (2x2)
            </label>
            <label>
                <input type="radio" name="level" value="medium"> Medium (3x4)
            </label>
            <label>
                <input type="radio" name="level" value="hard"> Hard (4x5)
            </label>
        </div>
    </header>

    <div class="game-container" id="game"></div>

    <!-- High scores panel -->
    <aside id="high-scores">
        <h3>High Scores</h3>
        <div class="scores-list" id="scores-easy">
            <h4>Easy (2x2)</h4>
            <ol></ol>
        </div>
        <div class="scores-list" id="scores-medium">
            <h4>Medium (3x4)</h4>
            <ol></ol>
        </div>
        <div class="scores-list" id="scores-hard">
            <h4>Hard (4x5)</h4>
            <ol></ol>
        </div>
    </aside>

    <div id="popup" class="hidden">
        <h2>Congratulations!</h2>
        <p>You finished in <span id="final-moves">0</span> moves and <span id="final-time">0</span> seconds!</p>
        <button id="play-again">Play Again</button>
    </div>

    <!-- New: level + high-score manager -->
    <script>
    // Simple level/high-score helper
    (function(){
        const levels = {
            easy:  { rows: 2, cols: 2 },
            medium:{ rows: 3, cols: 4 },
            hard:  { rows: 4, cols: 5 }
        };

        function getKey(level){ return 'memgame_highscores_' + level; }

        function loadHighScores(level){
            const raw = localStorage.getItem(getKey(level));
            return raw ? JSON.parse(raw) : [];
        }

        function saveHighScores(level, arr){
            localStorage.setItem(getKey(level), JSON.stringify(arr));
        }

        // Keep top 5 by time (ascending). Each entry: {time, moves, date}
        window.saveHighScore = function(level, time, moves){
            const list = loadHighScores(level);
            list.push({ time: Number(time), moves: Number(moves), date: new Date().toISOString() });
            list.sort((a,b)=> a.time - b.time || a.moves - b.moves);
            saveHighScores(level, list.slice(0,5));
            updateHighScoresUI();
        };

        function renderList(el, entries){
            const ol = el.querySelector('ol');
            ol.innerHTML = '';
            if (!entries.length){
                ol.innerHTML = '<li class="empty">--</li>';
                return;
            }
            entries.forEach(e=>{
                const d = new Date(e.date);
                const label = `${e.time}s • ${e.moves} moves • ${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
                const li = document.createElement('li');
                li.textContent = label;
                ol.appendChild(li);
            });
        }

        window.updateHighScoresUI = function(){
            renderList(document.getElementById('scores-easy'), loadHighScores('easy'));
            renderList(document.getElementById('scores-medium'), loadHighScores('medium'));
            renderList(document.getElementById('scores-hard'), loadHighScores('hard'));
        };

        // Level selection and GAME_CONFIG exposure
        function setLevel(level){
            const cfg = levels[level] || levels.easy;
            window.GAME_CONFIG = { level: level, rows: cfg.rows, cols: cfg.cols };
            // Inform existing script.js that level changed
            window.dispatchEvent(new CustomEvent('levelChange', { detail: window.GAME_CONFIG }));
        }

        // Wire up radio buttons
        document.querySelectorAll('input[name="level"]').forEach(r=>{
            r.addEventListener('change', function(){
                if (this.checked) setLevel(this.value);
            });
        });

        // init
        const initial = document.querySelector('input[name="level"]:checked').value || 'easy';
        setLevel(initial);
        updateHighScoresUI();

        // Expose helper to let script.js call when a game finishes:
        // call window.saveHighScore(level, timeInSeconds, moves)
    })();
    </script>

    <!-- Moved: game script must load after the level/high-score manager -->
    <script src="script.js"></script>

</body>
</html>