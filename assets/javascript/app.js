
var questions;
var quizData = {
    category: undefined,
    difficulty: undefined,
    questionNum: undefined,
    correct: 0,
    incorrect: 0
};
var currentIndex = 0;
var timeBetweenQuestions = 3000;
var timerId;
var timeLeft;
var categoryList = [
    {
        title: "General Knowledge",
        value: 9
    },
    {
        title: "Animals",
        value: 27
    },
    {
        title: "History",
        value: 23
    },
    {
        title: "Politics",
        value: 24
    }
];
var difficultyList = [
    {
        title: "Normal",
        value: "medium"
    },
    {
        title: "Hard",
        value: "hard"
    }
];
var questionNumList = [
    {
        title: "One",
        value: 1
    },
    {
        title: "Three",
        value: 3
    },
    {
        title: "Five",
        value: 5
    },
    {
        title: "Ten",
        value: 10
    }
]

function getQuestions(){
    clearQuestion();

    if(quizData.category && quizData.difficulty && quizData.questionNum){
        $.get(`https://opentdb.com/api.php?amount=${quizData.questionNum}&category=${quizData.category}&difficulty=${quizData.difficulty}&type=multiple&encode=url3986`, function(data){
            questions = data.results;
            questions.forEach(function(q, i){
                questions[i].question = decodeURIComponent(q.question);
                questions[i].category = decodeURIComponent(q.category);
                questions[i].correct_answer = decodeURIComponent(q.correct_answer);
                for(var j = 0; j < q.incorrect_answers.length; j++){
                    questions[i].incorrect_answers[j] = decodeURIComponent(q.incorrect_answers[j]);
                }
                
            });
            displayQuestion();
        });
    }else{
        throw new Error("There is no quizData to fulfill request.");
    }
}

function displayQuestion(){

    clearQuestion();

    var q = questions[currentIndex]
    $("#category").text(`Category: ${q.category}`);
    $("#question").text(`Question: ${q.question}`);
    var correctAnswer = Math.floor(Math.random() * 4);

    var wrongQuestionsUsed = 0;
    [$("#q1"),
    $("#q2"),
    $("#q3"),
    $("#q4")].forEach(function(element, index){
        if(index === correctAnswer){
            element.data("isCorrect", true);
            element.text(q.correct_answer);

            element.on("click", function(){
                stopTimer();
                clearQuestion();
                quizData.correct++;

                $("#question").text("You got that one right!");
                $("#q1").text(`You've gotten ${quizData.correct} questions right!`);
                $("#q2").text(`You've gotten ${quizData.incorrect} questions wrong.`);
                $("#q3").text(`You have ${quizData.questionNum - (currentIndex + 1)} left to go!`);

                setTimeout(nextQuestion, timeBetweenQuestions);
            });
        }else{
            element.data("isCorrect", false);
            element.text(q.incorrect_answers[wrongQuestionsUsed]);
            wrongQuestionsUsed++;

            element.on("click", function(){
                stopTimer();
                clearQuestion();
                quizData.incorrect++;

                $("#question").text("You got that one wrong, ouch.");
                $("#q1").text(`You've gotten ${quizData.correct} questions right!`);
                $("#q2").text(`You've gotten ${quizData.incorrect} questions wrong.`);
                $("#q3").text(`You have ${quizData.questionNum - (currentIndex + 1)} left to go!`);
                $("#q4").text(`The correct answer was ${questions[currentIndex].correct_answer}.`);

                setTimeout(nextQuestion, timeBetweenQuestions);
            });
        }
    });
}

function getQuizData(){
    $("#category").text("Category: Quiz Setup");

    clearQuestion();

    if(!quizData.difficulty){
        $("#question").text("What difficulty would you like?");

        [$("#q1"),
        $("#q2")].forEach(function(element, index){
            element.text(difficultyList[index].title);
            element.data("diff", difficultyList[index].value);

            element.on("click", function(event){
                quizData.difficulty = $(event.target).data("diff");
                getQuizData();
            });
        });
    }else if(!quizData.category){
        $("#question").text("What category of question would you like?");
        
        [$("#q1"),
        $("#q2"),
        $("#q3"),
        $("#q4")].forEach(function(element, index){
            element.text(categoryList[index].title);
            element.data("category", categoryList[index].value);

            element.on("click", function(event){
                quizData.category = $(event.target).data("category");
                getQuizData();
            });
        });
    }else if(!quizData.questionNum){
        $("#question").text("How may questions would you like to awnser?");

        [$("#q1"),
        $("#q2"),
        $("#q3"),
        $("#q4")].forEach(function(element, index){
            element.text(questionNumList[index].title);
            element.data("qNum", questionNumList[index].value);

            element.on("click", function(event){
                quizData.questionNum = $(event.target).data("qNum");
                getQuestions();
                startTimer();
            });
        });
    }
}

function clearQuestion(){
    $("#category").text("");
    $("#question").text("");
    $("#timeRemaining").text("Time Remaining:");

    [$("#q1"),
    $("#q2"),
    $("#q3"),
    $("#q4")].forEach(function(element){
        element.text("");
        element.off("click");
        if(element.data("isCorrect")){
            element.removeData("isCorrect");
        }
        if(element.data("diff")){
            element.removeData("diff");
        }
    });
}

function nextQuestion(){
    if(currentIndex < questions.length - 1){
        currentIndex++;
        displayQuestion();
        startTimer();
    }else{
        clearQuestion();

        $("#question").text("The Quiz Is Over");

        $("#q1").text(`You got ${quizData.correct} out of ${quizData.questionNum} correct!`);

        $("#q2").text("Try again?");

        $("#q2").on("click", function(event){
            quizData = {
                category: undefined,
                difficulty: undefined,
                questionNum: undefined,
                correct: 0,
                incorrect: 0
            };

            currentIndex = 0;

            getQuizData();
        });
    }
}

function startTimer(){
    if(!timerId){
        timeLeft = 10;
        timerId = setInterval(tick, 1000);
        $("#timer").text(`Time remaining: ${timeLeft}`);
    }
}

function stopTimer(){
    clearInterval(timerId);
    timerId = undefined;

    $("#timer").text("");
}

function tick(){
    timeLeft --;
    $("#timer").text(`Time remaining: ${timeLeft}`);

    if(timeLeft <= 0){
        stopTimer();
        clearQuestion();
        quizData.incorrect++;

        $("#question").text("You got that one wrong, ouch.");
        $("#q1").text(`You've gotten ${quizData.correct} questions right!`);
        $("#q2").text(`You've gotten ${quizData.incorrect} questions wrong.`);
        $("#q3").text(`You have ${quizData.questionNum - (currentIndex + 1)} left to go!`);
        $("#q4").text(`The correct answer was ${questions[currentIndex].correct_answer}.`);

        setTimeout(nextQuestion, timeBetweenQuestions);
    }
}

$(document).ready(function(){
    getQuizData();
});