var body,
    main,
    htmlArray,
    slideIndex = 0,
    maxSlideIndex,
    quizCounter = 0,
    mathJaxCdn = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
    converter = new showdown.Converter();

var quizTools = {
  correctMessages: [
    "Correct!",
    "Nice one, that is correct.",
    "Nicely done! That is the correct answer.",
    "Well done. You got it right!",
    "I knew you could do it, correct answer!"
  ],
  incorrectMessages: [
    "Uh oh! Incorrect.",
    "Sorry, try again!",
    "Unfortunately that is not correct.",
    "Nope, incorrect.",
    "Incorrect answer."
  ],
  getCorrectMessage: function(){
    return this.correctMessages[Math.floor(Math.random()*this.correctMessages.length)];
  },
  getIncorrectMessage: function(){
    return this.incorrectMessages[Math.floor(Math.random()*this.incorrectMessages.length)];
  }
}

var uiTools = {
  colors: {
    red: "#e74c3c",
    blue: "#3498db",
    green: "#2ecc71",
    white: "white"
  }
}

$(document).ready(function(){

  // Selectors
  body = $("body");
  main = $("#main");
  meta = $("#meta");
  content = $("#content");

  // Markdown parsing logic
  $.get('data/lecture1.md').done(function(data){

    var front = jsyaml.loadFront(data);
    var html = converter.makeHtml(front.__content);
    htmlArray = html.split("\n<p>+++</p>\n");
    maxSlideIndex = htmlArray.length - 1;

    if (front.math) {
      if (front.math == 'on') loadMathJax();
    }

    meta.append(createMeta(front));

    htmlArray.forEach(function(slide, index){
      content.append(createSlide(processSlide(slide), index));
    });

    displaySlide();

  });

  // Keyboard inputs
  $(this).keydown(function(e){
    e = e || window.event;
    if (e.keyCode == '37') {
      e.preventDefault();
      prevSlide();
    }
    else if (e.keyCode == '39') {
      e.preventDefault();
      nextSlide();
    }
  });

  $(window).resize(function(){
    $(".slide").css("min-height", $(window).height() - 90);
  });

});

function createSlide(slide, index) {
  return $("<div>", {class: "slide", id: "slide-"+index})
    .css("min-height", $(window).height() - 90)
    .html(slide);
}

function createMeta(meta) {
  var out = $("<div>", {class: "meta"});
  var innerHTML = "<span class='meta-title'>" + meta.title + "</span> by ";
  innerHTML += meta.author + " // ";
  innerHTML += meta.date.toISOString().slice(0, 10);
  out.html(innerHTML);
  return out;
}

function displaySlide() {
  $(".slide").hide();
  $("#slide-"+slideIndex).show();
}

function nextSlide() {
  if (slideIndex < maxSlideIndex) {
    slideIndex++;
    displaySlide();
  }
  return slideIndex;
}

function prevSlide() {
  if (slideIndex > 0) {
    slideIndex--;
    displaySlide();
  }
  return slideIndex;
}

function loadMathJax() {
  $.getScript( mathJaxCdn, function( data, textStatus, jqxhr ) {
    console.log( textStatus ); // Success
    console.log( jqxhr.status ); // 200
    console.log( "MathJax load was performed." );
  });
}

function processSlide(slide) {
  if (/\?\?\?/.test(slide)) {
    return slide.replace(/<p>\?\?\?<\/p>\n(<ul>[\s\S]*?<\/ul>)/, function(html, match){
      return generateQuiz(match);
    });
  }
  return slide;
}

function generateQuiz(data) {

  var html = $(data),
      question = $("<div>", {class: "quiz-panel quiz-question"}),
      questionBtn = $("<div>", {class: "quiz-nav-btn quiz-nav-btn-question active"}).text("question"),
      responses = $("<div>", {class: "quiz-responses"}),
      responsesArray = [],
      explanation = $("<div>", {class: "quiz-panel quiz-explanation hidden"}),
      explanationBtn = $("<div>", {class: "quiz-nav-btn quiz-nav-btn-explanation"}).text("explanation"),
      reference = $("<div>", {class: "quiz-panel quiz-reference hidden"}),
      referenceBtn = $("<div>", {class: "quiz-nav-btn quiz-nav-btn-reference"}).text("reference"),
      panels = $("<div>", {class: "quiz-panels"}),
      notice = $("<div>", {class: "quiz-notice"}).text("Please pick the correct answer."),
      nav = $("<div>", {class: "quiz-nav"}),
      out = $("<div>", {class: "quiz-wrapper"}),
      quizId = quizCounter++;

  questionBtn.attr("onclick", "switchQuizPanel(0, 'question')");
  explanationBtn.attr("onclick", "switchQuizPanel(0, 'explanation')");
  referenceBtn.attr("onclick", "switchQuizPanel(0, 'reference')");

  html.children().each(function(index, item){
    var itemContent = $(item).html();
    var indexOffset = 3;
    if (itemContent.indexOf('q. ') !== -1) { // question
      question
        .append($("<div>", {class: "quiz-question-text"})
          .append(itemContent.substring(indexOffset)));
    } else if (itemContent.indexOf('a. ') !== -1) { // answer
      responsesArray.push(createQuizResponse(quizId, itemContent.substring(indexOffset), true, index));
    } else if (itemContent.indexOf('e. ') !== -1) { // explanation
      explanation.append(itemContent.substring(indexOffset));
    } else if (itemContent.indexOf('r. ') !== -1) { // reference
      reference.append(itemContent.substring(indexOffset));
    } else { // responses
      responsesArray.push(createQuizResponse(quizId, itemContent, false, index));
    }
  });

  shuffle(responsesArray);

  responsesArray.forEach(function(item){
    responses.append(item);
  });

  question
    .append(responses)
    .append(notice);

  panels
    .append(question)
    .append(explanation)
    .append(reference);

  nav
    .append(questionBtn)
    .append(explanationBtn)
    .append(referenceBtn);

  out
    .attr('id', 'quiz-' + quizId)
    .append(nav)
    .append("<br/>")
    .append(panels);

  return $("<div>").append(out).html();
}

function switchQuizPanel(quizId, panel) {
  var panels = $("#quiz-" + quizId + " .quiz-panel");
  var selectedPanel = $("#quiz-" + quizId + " .quiz-" + panel);
  var panelBtns = $("#quiz-" + quizId + " .quiz-nav-btn");
  var selectedPanelBtn = $("#quiz-" + quizId + " .quiz-nav-btn-" + panel);
  panels.addClass("hidden");
  panelBtns.removeClass("active");
  selectedPanel.removeClass("hidden");
  selectedPanelBtn.addClass("active");
}

function createQuizResponse(quizId, response, answer, index) {
  var out = $("<div>", {
    "class": "quiz-response",
    "onclick": "selectResponse('" + quizId + "'," + answer + ",'" + index + "')",
    "data-response-index": index,
    "type": "radio",
  }).html(response);
  return out;
}

function selectResponse(quizId, answer, index) {
  var quizNotice = $("#quiz-" + quizId + " .quiz-notice");
  if (answer) {
    quizNotice
      .text(quizTools.getCorrectMessage())
      .css("background-color", uiTools.colors.green);
  } else {
    quizNotice
      .text(quizTools.getIncorrectMessage())
      .css("background-color", uiTools.colors.red);
  }
  quizNotice.css("color", uiTools.colors.white);
  $("#quiz-" + quizId + " .quiz-response").removeClass("response-selected");
  $("#quiz-" + quizId).find("[data-response-index='" + index + "']")
    .addClass("response-selected");
}

function shuffle(a) {
  var j, x, i;
  for (i = a.length; i; i--) {
    j = Math.floor(Math.random() * i);
    x = a[i - 1];
    a[i - 1] = a[j];
    a[j] = x;
  }
}