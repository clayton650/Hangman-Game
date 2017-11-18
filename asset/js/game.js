//** DOM elements



//**  Build the keyboard object

// Create alphabet array
// source: https://stackoverflow.com/questions/24597634/how-to-generate-an-array-of-alphabet-in-jquery
function genCharArray(charA, charZ) {
    var a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}

const alphabet = genCharArray('a', 'z');


function buildKeyboardObjectArray(alphabetArray){

	const keyboardWrapper = document.getElementById("keyboardWrapper");
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
					self.handleClick();
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

}

buildKeyboardObjectArray(alphabet);

// ** 

const guessWordArray = ["clayton"];
let guessWordObjectArray = [];

guessWordArray.forEach(function(word){

	var guessWordObject = {
		value: word,
		won: false,
		used: false,
		current: false,
		guesses: 0,
		misses: 0,

		isAvailable: function(){
			return !this.used && !this.current
		},
		letterObjectFactory: function(){
			var word = this.value
			var statusArray = [];

			for (var i=0; i < word.length; i++){
				var statusObject = {
					letter: word[i],
					guessed: false
				}

				statusArray.push(statusObject);
			}

			return statusArray
		}

	}

	guessWordObject.letterObjectArray = guessWordObject.letterObjectFactory()
	guessWordObject.guesses = Math.floor(guessWordObject.value.length * 1.33)

	guessWordObjectArray.push(guessWordObject);

});



const guessWordWrapper = document.getElementById('wordDisplay');

function drawWord(wordObject){

	if(wordObject){

		//Clear guessWordWrapper
		guessWordWrapper.innerHTML = "";

		//Loop over word and slit up each letter 
		for (var i=0; i < wordObject.letterObjectArray.length; i++){

			var letterObject = wordObject.letterObjectArray[i]
			var buttonHTML = document.createElement('span');

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

  	let misses = wordObject.misses;
 	let guesses = wordObject.guesses;
 	let percent = misses/guesses*100;

  	let progressBarHTML = document.createElement("div");
  	progressBarHTML.setAttribute('class', 'progress-bar');
  	progressBarHTML.setAttribute('role', 'progressbar');
  	progressBarHTML.setAttribute('aria-value', percent);
  	progressBarHTML.setAttribute('aria-valuemin', 0);
  	progressBarHTML.setAttribute('aria-valuemax', 100);
  	progressBarHTML.setAttribute('style', 'width: '+percent+'%');

  	progressBarHTML.innerText = misses+" / "+ guesses;

  	progressBarWrapper.innerHTML = "";
  	progressBarWrapper.appendChild(progressBarHTML);

}


function getAvailableWord(){

	var wordObject;

	//filter word object array by available objects
	var availableWordObjects = guessWordObjectArray.filter(function(word){
		return word.isAvailable
	});

	//TODO: If none are left, game over
	if (availableWordObjects){

		var wordObject = availableWordObjects[Math.floor(Math.random()*availableWordObjects.length)]

	}
	
	return wordObject;

}


function loadNewWord(){

	var availableWord = getAvailableWord();

	if(availableWord){

		availableWord.current = true;
		drawWord(availableWord);

	}else{
		// handle game over scenario
	}

}


loadNewWord();


function getCurrentWord(){

	var currentWord = guessWordObjectArray.find(function(wordObject){
		return wordObject.current;
	})

	return currentWord;

}


function getIndexesOfLetterInWord(letter, wordObject){

	var letter = letter
	var letterIndexArray = []

	var letterIndexes = wordObject.letterObjectArray.forEach(function(letterObject, i){

		var l = letterObject.letter.toLowerCase().trim();

		if(letter === l){
			letterIndexArray.push(i)
		}

	});

	return letterIndexArray
}


function handleUserGuess(letter, wordObject){

	//TODO: Check for game status - pause, play, etc
	//make sure the letter is actually a letter

	if(alphabet.indexOf(letter) !== -1){

		var letterIndexArray = getIndexesOfLetterInWord(letter, wordObject);
		if(letterIndexArray.length > 0){
			letterIndexArray.forEach(function(i){

				//loop over each letterObject in word and update guessed property to true
				wordObject.letterObjectArray[i].guessed = true;

			})

		drawWord(wordObject);

		}else{
			wordObject.misses++
			if(wordObject.misses === wordObject.guesses){
				alert('Game Over');
			}
			drawProgressBar(wordObject);
		}

	}

}

function handleUserClick(e){

	var keyCode =  e.keyCode || e.charCode || e.detail;
	console.log(e);
	var letter = String.fromCharCode(keyCode).toLowerCase();
	var currentWord = getCurrentWord();
	handleUserGuess(letter, currentWord)

}

//TODO: replace onkeyboardclick by simulating onkeyup in keyboardObject
document.addEventListener("keyboardclick", handleUserClick)
document.addEventListener("keyup", handleUserClick)
// document.onkeyup = handleUserClick()










