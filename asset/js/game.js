//** DOM elements



//**  Build the keyboard object

// Create alphabet array
// source: https://stackoverflow.com/questions/24597634/how-to-generate-an-array-of-alphabet-in-jquery
function genCharArray(charA, charZ) {
    let a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}

const alphabet = genCharArray('a', 'z');


function buildKeyboardObjectArray(alphabetArray){

	const keyboardWrapper = document.getElementById("keyboardWrapper");
	keyboardWrapper.innerHTML = "";
	let keyboardObjectArray	= [];

	alphabetArray.forEach(function(letter, i){

		let keyCode = letter.charCodeAt(0)

		let keyboardObject = {

			index: i,
			value: letter,
			keyCode: keyCode,
			pressed: false,
			keyboardclick: new CustomEvent("keyboardclick", { "detail": keyCode }),

			buttonFactory: function(){

				let self = this;

				let buttonHTML = document.createElement('button');
				buttonHTML.setAttribute('class','keyboard-letter btn btn-default');
				buttonHTML.setAttribute('type','submit');
				buttonHTML.innerText = this.value;

				buttonHTML.onclick = function(e){
					//self.handleClick();
					self.dispatchKeyboardClickEvent();
				};

				// Draw button HTML
				keyboardWrapper.appendChild(buttonHTML);

				return buttonHTML
			},

			handleClick: function(){

				if(!this.pressed){
					this.pressed = true;
				}
				
				this.buttonHTML.setAttribute('class','keyboard-letter btn btn-default active');
				this.buttonHTML.setAttribute('disabled','disabled');

			},

			dispatchKeyboardClickEvent: function(){
				// Dispatch/Trigger/Fire the event
				document.dispatchEvent(this.keyboardclick);
			},

			reset: function(){
				this.pressed = false;
				this.handleClick();
			},

		};

		keyboardObject.buttonHTML = keyboardObject.buttonFactory();

		keyboardObjectArray.push(keyboardObject);

	});

	return keyboardObjectArray

}

let keyboardObjectArray = buildKeyboardObjectArray(alphabet);

let guessWordArray = ["set","clayton"];

function buildGuessWordObjectArray(guessWordArray){

	let guessWordObjectArray = [];

	guessWordArray.forEach(function(word){

		const guessWordObject = {
			value: word,
			used: false,
			current: false,
			guesses: 0,
			misses: 0,

			isAvailable: function(){
				return !this.used && !this.current
			},

			letterObjectFactory: function(){
				let word = this.value
				let statusArray = [];

				for (let i=0; i < word.length; i++){
					let statusObject = {
						letter: word[i],
						guessed: false
					}

					statusArray.push(statusObject);
				}

				return statusArray
			},

			hasWon: function(){

				//Check to see if all letters have been guessed
				let hasWon = this.letterObjectArray.every(function(letter){
					return letter.guessed
				});

				return hasWon
			},

			hasLost: function(){
				return this.misses === this.guesses;
			}

		}

		guessWordObject.letterObjectArray = guessWordObject.letterObjectFactory()
		guessWordObject.guesses = Math.floor(guessWordObject.value.length * 1.25)

		guessWordObjectArray.push(guessWordObject);

	});

	return guessWordObjectArray;

}


let guessWordObjectArray = buildGuessWordObjectArray(guessWordArray);

let guessWordWrapper = document.getElementById('wordDisplay');


function drawWord(wordObject){

	if(wordObject){

		//Clear guessWordWrapper
		guessWordWrapper.innerHTML = "";

		//Loop over word and slit up each letter 
		for (let i=0; i < wordObject.letterObjectArray.length; i++){

			let letterObject = wordObject.letterObjectArray[i]
			let buttonHTML = document.createElement('span');

			//to do: add support for spaces
			if(letterObject.guessed){
				buttonHTML.setAttribute('class','letter');
				buttonHTML.innerText = letterObject.letter.toUpperCase();
			}else{
				buttonHTML.setAttribute('class','letter empty');
			}

			guessWordWrapper.appendChild(buttonHTML);
		}
	}else{
		//this should not run...
	}

};

function drawProgressBar(wordObject){

	// <div class="progress-bar" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width: 60%;"> 60% </div>
  
	let progressBarWrapper = document.getElementById("progressBar");
	let leisuremanDiv = document.getElementById("leisureman");

  	let misses = wordObject.misses;
 	let guesses = wordObject.guesses;
 	let ratio = misses/guesses;
 	let percent = ratio < .1 ? 15 : ratio*100; //set minimum ratio to 15% so allowed guess amount is available

 	console.log(percent)

  	let progressBarHTML = document.createElement('div');
  	progressBarHTML.setAttribute('class', 'progress-bar');
  	progressBarHTML.setAttribute('role', 'progressbar');
  	progressBarHTML.setAttribute('aria-value', percent);
  	progressBarHTML.setAttribute('aria-valuemin', 0);
  	progressBarHTML.setAttribute('aria-valuemax', 100);
  	progressBarHTML.setAttribute('style', 'width: '+percent+'%');

  	progressBarHTML.innerText = misses+" / "+ guesses;

  	progressBarWrapper.innerHTML = "";
  	progressBarWrapper.appendChild(progressBarHTML);

  	leisuremanDiv.style.opacity= 1-ratio;

};


function getAvailableWord(){

	let wordObject;

	//filter word object array by available objects
	let availableWordObjects = guessWordObjectArray.filter(function(word){

		return word.isAvailable()
	});

	if (availableWordObjects){

		wordObject = availableWordObjects[Math.floor(Math.random()*availableWordObjects.length)]
	}
	
	return wordObject;

};


function loadNewWord(){

	let availableWord = getAvailableWord();

	if(availableWord){

		availableWord.current = true;
		drawWord(availableWord);

	}else{
		// handle game over scenario
	}

	return availableWord;

};


//TODO: move to reset or init?
let initWord = loadNewWord(); //this loads the initial word
drawProgressBar(initWord);

function getCurrentWord(){

	let currentWord = guessWordObjectArray.find(function(wordObject){
		return wordObject.current;
	})

	return currentWord;

};


function getIndexesOfLetterInWord(letter, wordObject){

	var letter = letter
	let letterIndexArray = []

	let letterIndexes = wordObject.letterObjectArray.forEach(function(letterObject, i){

		let l = letterObject.letter.toLowerCase().trim();

		if(letter === l){
			letterIndexArray.push(i)
		}

	});

	return letterIndexArray

};


function handleUserGuess(letter, wordObject){

	//TODO: Check for game status - pause, play, etc
	//make sure the letter is actually a letter

	let letterIndexArray = getIndexesOfLetterInWord(letter, wordObject);

	if(letterIndexArray.length > 0){
		letterIndexArray.forEach(function(i){

			//loop over each letterObject in word and update guessed property to true
			wordObject.letterObjectArray[i].guessed = true;

		})

		//update UI
		drawWord(wordObject);

	}else{

		wordObject.misses++
		drawProgressBar(wordObject);
		
	}


};



function handleUserClick(e){

	const keyCode =  e.keyCode || e.charCode || e.detail;
	var letter = String.fromCharCode(keyCode).toLowerCase();
	
	//if game is not paused
	if(play){
		//Only pay attention to letters found in alphabet array
		if(alphabet.indexOf(letter) !== -1){

			//The state of each letter that has been pressed is stored in the keyboardObjectArray
			//Find the letter that was just pressed in the array and check to see if it has been pressed
			let keyboardObject = keyboardObjectArray.find(function(keyboardObject){
				//TODO: could not get keyCodes to line up between keyup event and keyboardObject
				return keyboardObject.value === letter;
			});

			//If the letter has not already been pressed, check to see if it is in the word
			if (!keyboardObject.pressed){

				let currentWord = getCurrentWord(); //get the current word, TODO: maybe cache in variable
				//if in between games, ignore user input
				if(currentWord){
					handleUserGuess(letter, currentWord); //figure out if the letter is in the current word and update the word object and UI accordingly
					keyboardObject.handleClick(); //update keyboard UI
					handleResults(currentWord);
				}
					
			}else{

				//TODO: message?

			}
		}
	}

};

//Wrapper where messages are injected
let messageWrapper = document.getElementById('messageWrapper');

//Generic message, styling is handled in handleResults()
let messageHTML = document.createElement('div');

//Keep track of wins and losses, incremented in handleResults()
let wins=0;
let losses=0;

//Update the html with the current wins and losses values
function drawScrore(){

	document.getElementById('winScore').innerText = wins
	document.getElementById('lossScore').innerText = losses

}

drawScrore(); //set init score to 0 - 0


//Figure out if the use has won, lost, or is still playing. If won or lost, determine if there are more words left.
function handleResults(wordObject){

	let hasWon = wordObject.hasWon();
	let hasLost = wordObject.hasLost();

	let availableWord = getAvailableWord();
	let message; //defined based on hasLost or hasWon below

	//if the user has one or lost then display message to start new game or rest game
	if(hasLost || hasWon){

		wordObject.used = true;
		wordObject.current = false;

		if(hasLost){
			losses++;
			message='You LOST!';
			classAttr = 'alert alert-danger'; //used to style the message red

		}else{

			wins++;
			message='You WON!';
			classAttr = 'alert alert-success'; //used to style the message green

		}

		//get the next word
		let availableWord = getAvailableWord();

		if(availableWord){

			messageHTML.innerText = message+" Click here to play again!"
			messageHTML.setAttribute('class', classAttr);
			

		}else{

			//if there are no more words let the user know
			messageHTML.innerText = message+" BUT there are no more words left. Click here to reset the game."
			messageHTML.setAttribute('class', 'alert alert-warning'); //if no other words are left change the message style to warning (yellow)

		}

		drawScrore();//update score

		messageWrapper.innerHTML = "";// clear other messages
		messageWrapper.appendChild(messageHTML)// inject message into #messageWrapper

		play =false; //pause game so no other inputs are triggered
		drawStatus(); //update nav bar with pause status

		


	}

}

messageWrapper.addEventListener('click', newGame);

//** Handle User Clicks
//TODO: replace onkeyboardclick by simulating onkeyup in keyboardObject
document.addEventListener("keyboardclick", handleUserClick);
document.addEventListener("keyup", handleUserClick);

let playButtonHTML = document.getElementById('play');
let pauseButtonHTML = document.getElementById('pause');
let play = false; //default is pause

function toggleStatus(){

	if(play){
		play=false;
	}else{
		play=true;
	}

	drawStatus();

};

function drawStatus(){
	playButtonHTML.setAttribute('class', '');
	pauseButtonHTML.setAttribute('class', '');
	if(play){
		playButtonHTML.setAttribute('class', 'active');
	}else{
		pauseButtonHTML.setAttribute('class', 'active');
	}

};

drawStatus();

playButtonHTML.addEventListener("click", toggleStatus);
pauseButtonHTML.addEventListener("click", toggleStatus);

let resetButtonHTML = document.getElementById("reset");

resetButtonHTML.addEventListener("click", resetGame)

function newGame(){

	messageWrapper.innerHTML = ""; //clear messages
	keyboardObjectArray = buildKeyboardObjectArray(alphabet);
	drawStatus();
	let newWordObject = loadNewWord();

	play=true;
	drawStatus();

	if(newWordObject){
		drawProgressBar(newWordObject);
	}else{
		resetGame();
	}

}


function resetGame(){

	confirm("This will delete your past games! You sure you want to reset?");


	messageWrapper.innerHTML = ""; //clear messages
	guessWordObjectArray = buildGuessWordObjectArray(guessWordArray);

	//reset wins and losses score
	wins=0;
	losses=0;
	drawScrore();

	newGame();
	
}




