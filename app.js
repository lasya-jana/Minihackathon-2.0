let player1Name = '';
let player2Name = '';
let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;
let currentQuestionIndex = 0;
let questions = [];
let selectedCategory = '';
let usedCategories = new Set();
const maxCategories = 10;

const playerSetup = document.getElementById('player-setup');
const categorySelection = document.getElementById('category-selection');
const questionSection = document.getElementById('question-section');
const resultsSection = document.getElementById('results');
const scoreBoard = document.getElementById('scoreboard');
const questionText = document.getElementById('question-text');
const answerOptions = document.getElementById('answer-options');
const scorePlayer1 = document.getElementById('score-player1');
const scorePlayer2 = document.getElementById('score-player2');
const winnerDisplay = document.getElementById('winner');
const currentTurnDisplay = document.getElementById('current-turn');
const currentPlayerNameDisplay = document.getElementById('current-player-name');
const TRIVIA_API_URL = 'https://the-trivia-api.com/api/questions';

document.getElementById('start-game').addEventListener('click', () => {
    player1Name = document.getElementById('player1').value;
    player2Name = document.getElementById('player2').value;

    if (player1Name && player2Name) {
        playerSetup.classList.add('hidden');
        categorySelection.classList.remove('hidden');
        fetchCategories();
        updateScoreBoard();
    } else {
        alert("Please enter both player names!");
    }
});

function fetchCategories() {
    const categories = [
        "music",
        "sport_and_leisure",
        "film_and_tv",
        "arts_and_literature",
        "history",
        "society_and_culture",
        "science",
        "geography",
        "food_and_drink",
        "general_knowledge"
    ];
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';

    categories.forEach(category => {
        if (!usedCategories.has(category)) {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category.replace(/_/g, ' '); 
            categoryList.appendChild(option);
        }
    });
    
    if (usedCategories.size === maxCategories) {
        endGame();
    }
}

document.getElementById('select-category').addEventListener('click', () => {
    selectedCategory = document.getElementById('category-list').value;
    if (!selectedCategory) {
        alert('Please select a category!');
        return;
    }

    usedCategories.add(selectedCategory);
    fetchQuestions(selectedCategory);
});

function fetchQuestions(category) {
    questionText.textContent = 'Loading questions...';

    fetch(`${TRIVIA_API_URL}?categories=${category}&limit=6`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('Failed to fetch questions. Please try again.');
                categorySelection.classList.remove('hidden');
                questionSection.classList.add('hidden');
                return;
            }

            questions = data.slice(0, 6);
            categorySelection.classList.add('hidden');
            questionSection.classList.remove('hidden');
            currentQuestionIndex = 0; 
            loadQuestion();
        })
        .catch(error => {
            alert('Error fetching questions. Please try again.');
            console.error('Error fetching questions:', error);
            categorySelection.classList.remove('hidden');
            questionSection.classList.add('hidden');
        });
}

function loadQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
        alert("No more questions available!");
        return;
    }

    questionText.textContent = currentQuestion.question;
    answerOptions.innerHTML = '';
    currentTurnDisplay.classList.remove('hidden');
    currentPlayerNameDisplay.textContent = currentPlayer === 1 ? player1Name : player2Name;

    [...currentQuestion.incorrectAnswers, currentQuestion.correctAnswer]
        .sort(() => Math.random() - 0.5) // Shuffle answers
        .forEach(answer => {
            const button = document.createElement('button');
            button.textContent = answer;
            button.classList.add('answer-button');
            answerOptions.appendChild(button);
        });

    document.querySelectorAll('.answer-button').forEach(button => {
        button.addEventListener('click', (e) => handleAnswer(e.target.textContent));
    });
}

function handleAnswer(selectedAnswer) {
    const currentQuestion = questions[currentQuestionIndex];
    const correctAnswer = currentQuestion.correctAnswer;

    if (selectedAnswer === correctAnswer) {
        const points = currentQuestionIndex < 2 ? 10 : currentQuestionIndex < 4 ? 15 : 20;
        if (currentPlayer === 1) player1Score += points;
        else player2Score += points;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
        loadQuestion();
    } else {
        if (usedCategories.size < maxCategories) {
            categorySelection.classList.remove('hidden');
        }
        questionSection.classList.add('hidden');
        fetchCategories();
    }

    updateScoreBoard();
}

function updateScoreBoard() {
    scoreBoard.classList.remove('hidden');
    scorePlayer1.textContent = `${player1Name}: ${player1Score} points`;
    scorePlayer2.textContent = `${player2Name}: ${player2Score} points`;
}

document.getElementById('end-game').addEventListener('click', () => {
    endGame();
});

function endGame() {
    questionSection.classList.add('hidden');
    categorySelection.classList.add('hidden');
    resultsSection.classList.remove('hidden');

    if (player1Score > player2Score) {
        winnerDisplay.textContent = `${player1Name} Wins!`;
    } else if (player2Score > player1Score) {
        winnerDisplay.textContent = `${player2Name} Wins!`;
    } else {
        winnerDisplay.textContent = "It's a Draw!";
    }
}

document.getElementById('restart-game').addEventListener('click', () => {
    location.reload();
});
