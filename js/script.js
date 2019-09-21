let fetchedQuestions;

(function init(){
    chooseDifficulty();
    createQuiz();
})();

function chooseDifficulty(){
    const diff = document.querySelectorAll('#difficulty li');
    diff.forEach( li => li.addEventListener( 'click', e => difficultyPicked(e.target, diff) ));
}

function difficultyPicked(target, diff){
    emptyDifficultyBox(diff);
    
    target.style = `background-color:#142533`;
    target.id = 'checked';
}

function emptyDifficultyBox(diff){
    diff.forEach( diffBox => diffBox.style = `background-color:none` );
    document.querySelector('.medium').style.backgroundColor = 'transparent';
}

function createQuiz(){
    const btn = document.querySelector('#buttonBox button');
    btn.addEventListener('click', checkForData);
}

function randomCategory(){
    let rand =  Math.floor(Math.random() * (32 - 9) ) + 9;
    document.querySelector('select').value = `${rand}`;
    checkForData();
}

function checkForData(){
    if(document.querySelector('select').value === 'none'){
        randomCategory();
    }

    if(document.querySelector('select').value !== 'none' && document.querySelector('#checked') !== null){
        const diff = document.querySelector('#checked').textContent.toLowerCase();
        const cat = document.querySelector('select').value;

        return getQuestion(diff, cat)
    }
}

async function getQuestion(difficulty, category){
    let data;
    let result;

    await loadingScreen();

    data = await fetch(`https://opentdb.com/api.php?amount=10&type=multiple&diff=${difficulty}&category=${category}`);
    result = await data.json();

    await hideLoading();

    fetchedQuestions = result;
    await renderQuiz(result);
}

function renderQuiz(obj){
    const container = document.createElement('div');
    const link = document.createElement('a');
    const header = document.createElement('h1');
    let counter = 0;

    link.href = '../html/index.html';
    header.className = 'appTitle';
    header.textContent = 'Quiz App';

    link.appendChild(header);

    document.querySelector('#wrapper').innerHTML = '';
    document.querySelector('#wrapper').append(link, container);

    container.id = 'quizBox';

    //RENDER INCORRECT ANSWERS
    for(let i = 0; i < 10; i++){
        if(counter > 3){
            counter = 0;
        }
        container.innerHTML += 
            `<div class="boxWrap">
                <div class="questionBox">
                    <div class="question">${obj.results[i].question}</div>
                </div>
                    <ul id="quiz_${i}" class="answersBox">
                        <li class="answers hoverHandling">${obj.results[i].incorrect_answers[counter++]}</li>
                        <li class="answers hoverHandling">${obj.results[i].incorrect_answers[counter++]}</li>
                        <li class="answers hoverHandling">${obj.results[i].incorrect_answers[counter++]}</li>
                        <li class="answers hoverHandling">${obj.results[i].incorrect_answers[counter++]}</li>
                    </ul>
            </div>`;
    }

    document.querySelectorAll('.answers').forEach( elem => {
        elem.addEventListener('click', handlingClicks)
    });

    return renderCorrectAnswers(obj);
}

function renderCorrectAnswers(answers){
    //LOOP THROUGH ALL ANSWERS TO GET ONE WITH UNDEFINED VALUE AND GIVE IT THE CORRECT VALUE
    for(let j = 0; j < 10; j++){
        document.querySelectorAll(`#quiz_${j} li`).forEach( li => {
            if(li.textContent === 'undefined'){
                li.textContent = answers.results[j].correct_answer;
                return fixOrder(j);
            }
        });
    }
    return renderCheckButton()
}

function fixOrder(id){
    let arr = [];
    let correct = '';
    let counter = 0;
    const random = rand();
    const route = document.querySelectorAll(`#quiz_${id} li`);

    //LOOP THROUGH ANSWERS AND STORE THEIR VLAUES IN ARRAY AND EMPTY THEM
    for(let k = 0; k < 3; k++){
        arr.push(route[k].textContent);
        route[k].textContent = '';
    }

    //THE LAST ONE HAS A CORRECT VALUE ASSIGN IT TO VARIABLE
    correct = route[3].textContent
    route[3].textContent = '';
    //GET A RANDOM ANSWER AND GIVE IT A CORRECT VALUE
    route[random].textContent = correct;

    //LOOP THROUGH ALL LI AND FOR THE ONES WITH NO VALUE GIVE A INCORRECT ANSWERS
    route.forEach( li => {
        if(li.textContent === ''){
            li.textContent = arr[counter++];
        }
    });

    return fixShorterQuestion()
}

function fixShorterQuestion(){
    //SOMETIMES THE QUESTION HAS ONLY 2 INCORRECT ANSWERS THIS WILL FIX IT
    for(let l = 0; l < 10; l++){
        document.querySelectorAll(`#quiz_${l} li`).forEach( li => {
            if(li.textContent === ''){
                li.remove();
            }
        });
    }
}

function renderCheckButton(){
    const checkContainer = document.createElement('div');
    const check = document.createElement('div');

    checkContainer.id = 'checkContainer';
    check.id = 'checkButton';
    
    checkContainer.appendChild(check);
    
    check.textContent = 'Check answers'

    document.querySelector('#quizBox').appendChild(checkContainer);

    check.addEventListener('click', checkAnswers);
}

function handlingClicks(e){
    Array.from(e.target.parentNode.children).forEach( child => {

        child.addEventListener('mouseover', e => e.target.style = `background-color:#142533`);
        child.addEventListener('mouseout', onOutChange);

        child.dataset.answerChecked = '';
        child.style = `background-color:transparent`;
    });

    e.target.dataset.answerChecked = 'checked';
    e.target.style = `background-color:#142533`;
}

function onOutChange(e){
    if(e.target.dataset.answerChecked === undefined || e.target.dataset.answerChecked === ''){
        e.target.style = `background-color:transparent`;
    }
}

function checkAnswers(){
  let correctAnswers = 0;
  const userAnswers = document.querySelectorAll('li[data-answer-checked="checked"]');

  if(userAnswers.length < 10){
    return checkForEmptyAnswers();
  }

  for(let i = 0; i < 10; i++){
      if(fetchedQuestions.results[i].correct_answer === userAnswers[i].textContent){
        //CHECK IS USER'S ANSWERS ARE CORRECT
        userAnswers[i].style = `background-color:#339966`;
        correctAnswers++;
      }
      else{
        //FILL WITH RED BACKGROUND WRONG ANSWERS 
        userAnswers[i].style = `background-color:#990000`;
        //FILL WITH GREEN BACKGROUND CORRECT ANSWERS
        document.querySelectorAll(`#quiz_${i} li`).forEach( li => {
            if(li.textContent === fetchedQuestions.results[i].correct_answer){
                li.style = `background-color:#339966`;
            }
        });
      }
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  return viewingResults(correctAnswers);
}

function checkForEmptyAnswers(){
    const popup = document.createElement('div');
    const message = document.createElement('div');
    const overlayer = document.createElement('div');
    const btn = document.createElement('div');
    const imgBox = document.createElement('div');
    const img = new Image();


    window.scrollTo({ top: 0, behavior: 'smooth' });

    message.id = 'message';
    overlayer.id = 'overlayer';
    btn.id = 'popupBtn';
    popup.id = 'popup';
    imgBox.id = 'imgBox';

    message.textContent = 'You should answer for all the questions';
    btn.textContent = 'Ok';

    img.src = '../img/test-quiz.png';
    imgBox.appendChild(img);

    popup.append(imgBox, message, btn);
    setTimeout(() => {
        document.body.style.overflowY = 'hidden';
        document.body.append(overlayer, popup);
        document.querySelector('#popupBtn').addEventListener('click', removePopup);
    }, 1000);
}

function removePopup(){
    document.querySelector('#popup').remove();
    document.querySelector('#overlayer').remove();
    document.body.style.overflowY = 'scroll';
}

function viewingResults(count){
    const overFixer = document.createElement('div');
    const userResultPoints = document.createElement('div');
    const userResultPercent = document.createElement('div');
    const wrap = document.createElement('div');

    wrap.append(userResultPoints, userResultPercent)
    wrap.id = 'resultsWrapper';
    userResultPoints.innerHTML = `You answered <span>${count}/10</span> questions`;
    userResultPercent.innerHTML = `It is <span>${(count / 10 ) * 100}%</span>`;
    overFixer.id = 'overFixer';
    
    document.querySelector('#checkContainer').removeChild(document.querySelector('#checkButton'));
    document.querySelector('#quizBox').appendChild(overFixer);
    document.querySelector('.appTitle').parentNode.insertBefore(wrap, document.querySelector('.appTitle').nextSibling);
}

function rand(){
    return Math.floor(Math.random() * 4);
}

function loadingScreen(){
    const loadingBox = document.createElement('div');
    const round = document.createElement('div');

    loadingBox.id = 'loading';
    round.id = 'round';
    loadingBox.appendChild(round)
    document.body.appendChild(loadingBox)
}

function hideLoading(){
    const opac = 1;
    const disappear = setInterval( () => {
        document.querySelector('#loading').style.opacity = opac - 0.333
    }, 100);

    setTimeout( () => {
        clearInterval(disappear);
        document.body.removeChild(document.querySelector('#loading'))
    }, 400);
}