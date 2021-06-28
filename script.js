//get main document elements
let board = document.querySelector("#gameBoard");
let menu = document.querySelector("#menu");
let gameCounters = document.querySelectorAll("h2");

// Initial Global Variables
let maxGameImages = 16;
let images = selectGameImages(maxGameImages);
let level = 1;
let remainingPairs = 0;
let remainingFlips = 0;
let difficulty = 0;
let flippedCards = [];
let randomSortedImages = [];

//sound effects
let sounds = {
    flipSingle: new Audio('/sounds/flip-single.mp3'),
    flipDouble: new Audio('/sounds/flip-double.mp3'),
    levelCompleted: new Audio('/sounds/level-completed.wav'),
    gameOver: new Audio('/sounds/game-over.wav'),
    menuSelection: new Audio('/sounds/menu-select.mp3'),
    match: new Audio('/sounds/match-found.mp3'),
    mainTheme: new Audio('/sounds/main-theme.mp3')
}

// Select all game Images
function selectGameImages(num) {
    let images = [];
    for (let i = 0; i < num; i++) {
        images.push(`/images/landscape${i}.jpg`);
    }
    return images;
};

//select Difficulty 
function selectDifficulty(selected) {
    sounds.menuSelection.play();
    switch (selected) {
        case "easy":
            difficulty = 3;
            break;
        case "medium": 
            difficulty = 2.5;
            break;
        case "hard": 
            difficulty = 2;
            break;
    }
    return newGame();
}

// switch display between Menu and GameBoard
function newGame() {
    sounds.mainTheme.play();
    sounds.mainTheme.loop = true;
    menu.style.display = "none";
    board.style.display = "flex";
    gameCounters.forEach(counter => {
        counter.style.display = "block";
    });
    return displayNextLevel();
}

function displayNextLevel() {
    //clear board, update variables, display level info 
    board.innerHTML = '';
    remainingPairs = level + 3;
    remainingFlips = Math.floor(remainingPairs * difficulty);
    displayMessage("level", "level " + level);
    document.querySelector("#level").innerHTML = level;
    document.querySelector("#flips").innerHTML = remainingFlips;

    // display cards on board
    setTimeout(function() {
        let levelImages = selectLevelImages();
        randomSortedImages = randomSort(levelImages);
        displayBoard(randomSortedImages.length);
    }, 1500)
    
};

//display message
function displayMessage(type, message) {
    let messageContainer = document.querySelector("#messageContainer");
    let messageElement = document.querySelector("#message");
    switch (type) {
        case "level":
            messageElement.setAttribute ("class", "message-level");
            break;
        case "lost":
            messageElement.setAttribute ("class", "message-lost");
    }
    messageContainer.style.display = "flex";
    messageElement.innerHTML = message;
    setTimeout(function() {
        messageContainer.style.display = "none";
        message.innerHTML = '';
    }, 1500);
}

// Select images according to level 
function selectLevelImages()  {
    let imagesCopy = [...images];
    let selectedImages = [];
    if (remainingPairs > maxGameImages) {
        remainingPairs = maxGameImages;
    }
    for (let i = 0; i < remainingPairs; i++) {
        let randomIndex = Math.floor(Math.random() * imagesCopy.length);
        selectedImages.push(imagesCopy[randomIndex], imagesCopy[randomIndex]);
        imagesCopy.splice(randomIndex, 1);
    }
    return selectedImages;
}

//Randomly Sort Images
function randomSort(levelImages) {
    let totalCards = levelImages.length;
    let sortedImages = [];
    for (let i = 0; i < totalCards; i++) {
        let randomIndex = Math.floor(Math.random() * levelImages.length);
        sortedImages.push(levelImages[randomIndex]);
        levelImages.splice(randomIndex, 1);
    }
    return sortedImages;
}

//Render cards on user's screen
function displayBoard (totalCards) {
    // board size
    if (totalCards <= 16){
        let canvasSize = () => {
            if (totalCards <= 8) {
                return "board-col3";
            } else {
                return "board-col4";
            }
        }
        board.setAttribute("class", canvasSize());
    }
    // Build each card
    for (let i = 0; i < totalCards; i++) {
        let cardContainerSize = () => {
            if (totalCards <= 8) {
                return "card-container-col3-row3";
            } else if (totalCards <= 12) {
                return "card-container-col4-row3";
            } else if (totalCards <= 16) {
                return "card-container-col4-row4";
            } else if (totalCards <= 20) {
                return "card-container-col5-row4";
            } else if (totalCards <= 24) {
                return "card-container-col6-row4";
            } else if (totalCards <= 30) {
                return "card-container-col6-row5";
            } else {
                return "card-container-col7-row5";
            }
        }
        let cardContainer = document.createElement("div");
        cardContainer.setAttribute("class", "card-container " + cardContainerSize());
        
        //card atributes
        let card = document.createElement("img");
        card.setAttribute("class", "card");
        card.setAttribute("id", i);
        card.setAttribute("src", "/images/card-back.png");
        card.addEventListener("click", flipCard);
        
        cardContainer.appendChild(card);
        board.appendChild(cardContainer);
    }
};

//Flip card
function flipCard() {
    if (flippedCards.length < 2) {
        let cardId = this.getAttribute("id");
        if (flippedCards.length > 0) {
            if (flippedCards[0].id == cardId) {
                return;
            }
        }
        this.setAttribute("src", randomSortedImages[cardId]);
        this.classList.toggle("card-img");
        sounds.flipSingle.play();
        flippedCards.push({id: cardId, source: randomSortedImages[cardId]});
        
        if (flippedCards.length == 2) {
            setTimeout(function() {
                checkForMatch();
                updateRemainingFlips();
                if (checkForLevelCompleted()) {
                    
                    return displayNextLevel();
                }
            }, 1000);
        }
    }
}

function checkForMatch() {
    if (flippedCards[0].source == flippedCards[1].source) {
        sounds.match.play();
        flippedCards.forEach(element => {
            let card = document.getElementById(element.id);
            card.style.visibility = "hidden";
        });
        remainingPairs -= 1;
    } else {
        flippedCards.forEach(element => {
            let card = document.getElementById(element.id);
            card.setAttribute("src", "/images/card-back.png");
            card.classList.toggle("card-img");
            
        });
        sounds.flipDouble.play();
    }
    flippedCards = [];
}

function updateRemainingFlips() {
    let flipsElement = document.querySelector("#flips");
    remainingFlips -= 1;
    flipsElement.innerHTML = remainingFlips;
    if (remainingFlips < remainingPairs) {
        displayMessage("lost", "Game Over");
        sounds.mainTheme.pause();
        sounds.gameOver.play();
        sounds.gameOver.addEventListener("ended", function() {
            sounds.mainTheme.currentTime = 0;
            sounds.mainTheme.play();
        });
        setTimeout(function() {
            flipsElement.style.color = "#ffffff";
            return returnToMenu();
        }, 1500);
    } else if (remainingFlips <= remainingPairs + 2) {
        flipsElement.style.color = "#ff7070";
    } else {
        flipsElement.style.color = "#ffffff";
    }
}

function checkForLevelCompleted() {
    if (remainingPairs == 0) {
        sounds.mainTheme.pause()
        sounds.levelCompleted.play();
        sounds.levelCompleted.addEventListener("ended", function() {
            sounds.mainTheme.currentTime = 0;
            sounds.mainTheme.play();
        });
        level += 1;
        document.querySelector("#flips").style.color = "#ffffff";
        return true;
    }
    return false;
}

// When Game is lost
function returnToMenu() {
    level = 1;
    remainingPairs = 3;
    board.style.display = "none";
    gameCounters.forEach(counter => {
        counter.style.display = "none";
    });
    menu.style.display = "flex";
}
