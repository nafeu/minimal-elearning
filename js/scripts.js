var body,
    main,
    front,
    htmlArray,
    slideIndex = 0,
    maxSlideIndex,
    quizCounter = 0,
    lessonName,
    lessonPath,
    customBackgroundColor,
    mathJaxCdn = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
    converter = new showdown.Converter({extensions: ['table']}),
    exampleLessonPath = 'example.memd';

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
};

var uiTools = {
  colors: {
    red: "#e74c3c",
    blue: "#3498db",
    green: "#2ecc71",
    white: "white"
  }
};

$(document).ready(function(){

  // Selectors
  body = $("body");
  main = $("#main");
  meta = $("#meta");
  content = $("#content");

  if (window.location.hash && (window.location.hash.length > 1)) {
    lessonName = window.location.hash.substring(1)
    lessonPath = ('memd/' + lessonName + '.memd')
  } else {
    lessonPath = exampleLessonPath
  }

  // Markdown parsing logic
  $.get(lessonPath).done(function(data){

    front = jsyaml.loadFront(data);
    var html = converter.makeHtml(front.__content);
    htmlArray = html.split("\n<p>+++</p>\n");
    maxSlideIndex = htmlArray.length - 1;

    if (front.title) {
      document.title = front.title + " | Minimal eLearning"
    }

    if (front.math) {
      if (front.math == 'on') loadMathJax();
    }

    if (front.background) {
      body.css("background", front.background)
    }

    meta.append(createMeta(front));

    htmlArray.forEach(function(slide, index){
      slide = slide.replace("<p>+++</p>", "");
      content.append(createSlide(processSlide(slide), index));
    });

    loadSlidePosition();
    saveSlidePosition();
    displaySlide();

  }).fail(function() {
    body.html("<h2>Presentation named <u>" + lessonName + "</u> could not be found.</h2>");
  });

  // Keyboard inputs
  $(this).keydown(function(e){
    e = e || window.event;
    if (e.keyCode == '219') {
      e.preventDefault();
      prevSlide();
    }
    else if (e.keyCode == '221') {
      e.preventDefault();
      nextSlide();
    }
  });

  $(window).resize(function(){
    $(".slide").css("min-height", $(window).height() - 90);
  });

  $("img").on('click', function(){
    window.open($(this).attr('src'), '_blank');
  });

});

function createSlide(slide, index) {
  var out = $("<div>", {class: "slide", id: "slide-"+index})
    .css("min-height", $(window).height() - 90)
    .html(slide);
  var pageNav = $("<div>", {class: "page-nav"})
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-first",
        onclick: "firstSlide()"
      })
        .append('<i class="fa fa-angle-double-left" aria-hidden="true"></i>')
    )
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-prev",
        onclick: "prevSlide()"
      })
        .append('<i class="fa fa-angle-left" aria-hidden="true"></i>')
    )
    .append(
      $("<div>", {class: "page-nav-btn page-position"})
        .append($("<input>", {
          class: "page-nav-position-selection",
          type: "number",
          value: (index + 1),
          name: (index + 1),
          min: 1,
          max: maxSlideIndex + 1,
          onkeypress: "goToSlideByElement(event, this)"
        }))
        .append(" of " + (maxSlideIndex + 1))
    )
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-next",
        onclick: "nextSlide()"
      })
        .append('<i class="fa fa-angle-right" aria-hidden="true"></i>')
    )
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-last",
        onclick: "lastSlide()"
      })
        .append('<i class="fa fa-angle-double-right" aria-hidden="true"></i>')
    );
  out.append(pageNav);
  return out;

}

function createMeta(meta) {
  var out = $("<div>", {class: "meta"});
  var innerHTML = "<span class='meta-title'>" + meta.title + "</span> by ";
  innerHTML += meta.author + ", ";
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
    saveSlidePosition()
    displaySlide();
  }
  return slideIndex;
}

function prevSlide() {
  if (slideIndex > 0) {
    slideIndex--;
    saveSlidePosition()
    displaySlide();
  }
  return slideIndex;
}

function firstSlide() {
  slideIndex = 0;
  saveSlidePosition()
  displaySlide();
  return slideIndex;
}

function lastSlide() {
  slideIndex = maxSlideIndex;
  saveSlidePosition()
  displaySlide();
  return slideIndex;
}

function goToSlideByElement(event, element) {
  var index = parseInt(element.value) - 1;
  if ((event.which == 13) && (index >= 0) && (index <= maxSlideIndex)) {
    element.value = element.name;
    slideIndex = index;
    saveSlidePosition()
    displaySlide();
  }
  return slideIndex;
}

function goToSlide(index) {
  if (index <= maxSlideIndex) {
    slideIndex = index;
    saveSlidePosition()
    displaySlide();
  }
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
  return slide.replace("<intro></intro>", function(html, match){
    return generateIntro(front);
  });
}

function generateQuiz(data) {

  var html = $(data),
      question = $("<div>", {class: "quiz-panel quiz-question"}),
      questionBtn = $("<div>", {class: "quiz-nav-btn quiz-nav-btn-question active"}).text("question"),
      responses = $("<div>", {class: "quiz-responses"}),
      responsesArray = [],
      explanation = $("<div>", {class: "quiz-panel quiz-explanation hidden"}),
      explanationBtn = $("<div>", {class: "quiz-nav-btn quiz-nav-btn-explanation"}).text("answer explanation"),
      reference = $("<div>", {class: "quiz-panel quiz-reference hidden"}),
      referenceBtn = $("<div>", {class: "quiz-nav-btn quiz-nav-btn-reference"}).text("reference"),
      panels = $("<div>", {class: "quiz-panels"}),
      notice = $("<div>", {class: "quiz-notice"}).text("Please pick the correct answer."),
      nav = $("<div>", {class: "quiz-nav"}),
      out = $("<div>", {class: "quiz-wrapper"}),
      quizId = quizCounter++;

  questionBtn.attr("onclick", "switchQuizPanel('" + quizId + "', 'question')");
  explanationBtn.attr("onclick", "switchQuizPanel('" + quizId + "', 'explanation')");
  referenceBtn.attr("onclick", "switchQuizPanel('" + quizId + "', 'reference')");

  html.children().each(function(index, item){
    var itemContent = $(item).html();
    var indexOffset = 3;
    if (itemContent.indexOf('q. ') !== -1) { // question
      question
        .append($("<div>", {class: "quiz-question-text"})
          .append(itemContent.substring(indexOffset)));
    } else if (itemContent.indexOf('a. ') !== -1) { // answer
      responsesArray.push(createQuizResponse(quizId, itemContent.substring(indexOffset), true, index));
      explanation
        .append($("<p>", {class: "opacity-75"}).text("Answer:"))
        .append(createQuizAnswerExplanation(itemContent.substring(indexOffset)));
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
    .append(explanation);

  nav
    .append(questionBtn)
    .append(explanationBtn);

  if (reference.children().length > 0) {
    panels.append(reference);
    nav.append(referenceBtn);
  }

  out
    .attr('id', 'quiz-' + quizId)
    .append(nav)
    .append("<br/>")
    .append(panels);

  return $("<div>").append(out).html();
}

function generateIntro(meta) {
  var out = $("<div>", {class: "intro-container"});
  var title = $("<div>", {class: "intro-title"}).text(meta.title);
  var author = $("<div>", {class: "intro-author"}).text(meta.author);
  out.append(title);
  out.append(author);
  return out.prop('outerHTML');
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

function createQuizAnswerExplanation(content) {
  var out = $("<div>", {
    "class": "quiz-answer-explanation"
  }).html(content);
  return out;
}

function selectResponse(quizId, answer, index) {
  var quizNotice = $("#quiz-" + quizId + " .quiz-notice");
  var quizPanel = $("#quiz-" + quizId + " .quiz-question");
  if (answer) {
    quizNotice
      .text(quizTools.getCorrectMessage())
      .css("background-color", uiTools.colors.green);
    quizPanel.css("border-color", uiTools.colors.green);
  } else {
    quizNotice
      .text(quizTools.getIncorrectMessage())
      .css("background-color", uiTools.colors.red);
    quizPanel.css("border-color", uiTools.colors.red);
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

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadSlidePosition() {
  var position = window.localStorage.getItem(lessonPath)
  if (position && (slideIndex <= maxSlideIndex)) {
    slideIndex = parseInt(position)
  }
}

function saveSlidePosition() {
  window.localStorage.setItem(lessonPath, slideIndex);
}