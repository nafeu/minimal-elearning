var body, main, front, meta, content, loadLesson, lessonUrlInput,
    launchLessonBtn, copyLinkBtn, invalidLink, preview, hiddenUrl,
    htmlArray,
    slideIndex = 0,
    maxSlideIndex,
    quizCounter = 0,
    lessonUrl,
    lessonPath,
    title = 'Minimal eLearning',
    customBackgroundColor,
    converter = new showdown.Converter({extensions: ['table']}),
    exampleLessonPath = './example.memd';

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
  loadLesson = $("#load-lesson");
  lessonUrlInput = $("#lesson-url-input");
  launchLessonBtn = $("#launch-lesson-btn");
  copyLinkBtn = $("#copy-link-btn");
  invalidLink = $("#invalid-link");
  preview = $("#preview");
  hiddenUrl = $("#hidden-url");

  lessonUrl = getParameterByName('lesson');

  if (lessonUrl) {
    // Markdown parsing logic
    $.get(lessonUrl).done(function(data){

      console.log("Retrieving data... (" + lessonUrl + ")");
      console.log(data);

      front = jsyaml.loadFront(data);
      var html = converter.makeHtml(front.__content);
      htmlArray = html.split("\n<p>+++</p>\n");
      maxSlideIndex = htmlArray.length - 1;

      if (front.title) {
        title = front.title + " | Minimal eLearning"
        document.title = title
      }

      if (front.background) {
        body.css("background", front.background)
      }

      meta.append(createMeta(front));

      htmlArray.unshift("<p><intro></intro></p>");

      htmlArray.forEach(function(slide, index){
        slide = slide.replace("<p>+++</p>", "");
        content.append(createSlide(processSlide(slide), index));
      });

      var querySlide = getParameterByName('slide')

      if (querySlide && ((parseInt(querySlide) - 1) <= maxSlideIndex) && ((parseInt(querySlide) - 1) >= 0)) {
        slideIndex = querySlide - 1
      } else {
        loadSlidePosition();
        updateQueryString('slide', slideIndex + 1, true);
      }
      saveSlidePosition();
      displaySlide();
      resizeIntro();

      $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
      });

    }).fail(function() {
      body.html("<h2>Presentation at <u>" + lessonUrl + "</u> could not be accessed or found.</h2>");
    });
  } else {
    body.css("background", "white");
    loadLesson.show();
  }

  // Keyboard inputs
  $(this).keydown(function(e){
    e = e || window.event;
    if (e.keyCode == '219' || e.keyCode == '37') {
      e.preventDefault();
      prevSlide();
    }
    else if (e.keyCode == '221' || e.keyCode == '39') {
      e.preventDefault();
      nextSlide();
    }
  });

  // Events
  $(window).resize(function(){
    resizeContentArea();
    resizeIntro();
  });

  $("img").on('click', function(){
    window.open($(this).attr('src'), '_blank');
  });

  lessonUrlInput.on('change', function(){
    var inputUrl = lessonUrlInput.val();
    if (inputUrl.length > 0) {
      $.get(inputUrl).done(function(data){
        var front = jsyaml.loadFront(data);
        showPreview(front);
        hiddenUrl.val(generateUrl(inputUrl));
        showValidLink();
      }).fail(function(error){
        showInvalidLink();
      })
    } else {
      showInvalidLink();
    }
  })

  launchLessonBtn.on('click', function(){
    if (lessonUrlInput.val().length > 0) {
      window.location.href = generateUrl(lessonUrlInput.val());
    } else {
      lessonUrlInput.focus();
    }
  })

});

function showValidLink() {
  copyLinkBtn.show();
  launchLessonBtn.show();
  invalidLink.hide();
}

function showInvalidLink() {
  copyLinkBtn.hide();
  launchLessonBtn.hide();
  invalidLink.show();
  preview.hide();
}

function resizeContentArea() {
  $(".slide").css("min-height", $(window).height() - 90);
}

function resizeIntro() {
  var introMarginTop = ($("#content").height() - $("#intro").height()) * 0.35;
  $("#intro").css("margin-top", introMarginTop + "px");
}

function showPreview(data) {
  preview.empty();
  preview.append("<p>Lesson details:</p>");
  preview.append("<h2>" + data.title + "</h2>");
  preview.append("<h3>by " + data.author + "</h3>");
  preview.append("<h4>" + data.description + "</h4>");
  preview.append("<p>" + data.date.toDateString() + "</p>");
  preview.show();
}

function generateUrl(value) {
  return encodeURI(window.location.href + "?lesson=" + value);
}

function copyUrl() {
  document.getElementById("hidden-url").select();
  document.execCommand("copy");
  $("#copy-link-btn").text("Copied To Clipboard!");
  setTimeout(function(){
    $("#copy-link-btn").text("Copy Lesson Link");
  }, 500);

}

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
    )
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-home",
        onclick: "goHome()"
      })
        .append('<i class="fa fa-home" aria-hidden="true"></i>')
    )
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-source",
        onclick: "goToSource()"
      })
        .append('<i class="fa fa-code" aria-hidden="true"></i>')
    );
  out.append(pageNav);
  return out;

}

function createMeta(meta) {
  var out = $("<div>", {class: "meta"});
  var innerHTML = "<span class='meta-title'>" + meta.title + "</span> by ";
  innerHTML += meta.author + "<span class='meta-date'> // ";
  innerHTML += meta.date.toDateString() + "</span>";
  out.html(innerHTML);
  return out;
}

function displaySlide() {
  $(".slide").hide();
  $("#slide-"+slideIndex).show();
  if (slideIndex == 0) {
    resizeIntro();
  }
}

function nextSlide() {
  if (slideIndex < maxSlideIndex) {
    slideIndex++;
    updateQueryString('slide', slideIndex + 1, true);
    saveSlidePosition();
    displaySlide();
  }
  return slideIndex;
}

function prevSlide() {
  if (slideIndex > 0) {
    slideIndex--;
    updateQueryString('slide', slideIndex + 1, true);
    saveSlidePosition();
    displaySlide();
  }
  return slideIndex;
}

function firstSlide() {
  slideIndex = 0;
  updateQueryString('slide', slideIndex + 1, true);
  saveSlidePosition();
  displaySlide();
  return slideIndex;
}

function lastSlide() {
  slideIndex = maxSlideIndex;
  updateQueryString('slide', slideIndex + 1, true);
  saveSlidePosition();
  displaySlide();
  return slideIndex;
}

function goHome() {
  window.location.href = window.location.origin;
}

function goToSource() {
  window.location.href = "https://github.com/nafeu/minimal-elearning";
}

function goToSlideByElement(event, element) {
  var index = parseInt(element.value) - 1;
  if ((event.which == 13) && (index >= 0) && (index <= maxSlideIndex)) {
    element.value = element.name;
    slideIndex = index;
    updateQueryString('slide', slideIndex + 1, true);
    saveSlidePosition();
    displaySlide();
  }
  return slideIndex;
}

function goToSlide(index) {
  if (index <= maxSlideIndex) {
    slideIndex = index;
    updateQueryString('slide', slideIndex + 1, false);
    saveSlidePosition();
    displaySlide();
  }
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
  var out = $("<div>", {class: "intro-container", id: "intro"});
  var title = $("<div>", {class: "intro-title"}).text(meta.title);
  var author = $("<div>", {class: "intro-author"}).text(meta.author);
  var description = $("<div>", {class: "intro-description"}).text(meta.description);
  var seperator = $("<div>", {class: "intro-seperator"});
  out.append(title);
  out.append(author);
  out.append(seperator);
  out.append(description);
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
  // TODO: Update and re-enable
  // var position = window.localStorage.getItem(lessonPath)
  // if (position && (slideIndex <= maxSlideIndex)) {
  //   slideIndex = parseInt(position)
  // }
}

function saveSlidePosition() {
  // TODO: Update and re-enable
  // window.localStorage.setItem(lessonPath, slideIndex);
}

function updateQueryString(key, value, pushState, url) {
    var finalUrl;
    if (!url) url = window.location.href;
    var re = new RegExp("([?&])" + key + "=.*?(&|#|$)(.*)", "gi"),
        hash;

    if (re.test(url)) {
        if (typeof value !== 'undefined' && value !== null)
            finalUrl = url.replace(re, '$1' + key + "=" + value + '$2$3');
        else {
            hash = url.split('#');
            url = hash[0].replace(re, '$1$3').replace(/(&|\?)$/, '');
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            finalUrl = url;
        }
    }
    else {
        if (typeof value !== 'undefined' && value !== null) {
            var separator = url.indexOf('?') !== -1 ? '&' : '?';
            hash = url.split('#');
            url = hash[0] + separator + key + '=' + value;
            if (typeof hash[1] !== 'undefined' && hash[1] !== null)
                url += '#' + hash[1];
            finalUrl = url;
        }
        else
            finalUrl = url;
    }
    if (pushState) {
      window.history.pushState({slide: value}, title, finalUrl)
    }
}

window.onpopstate = function(event) {
  if (event.state.slide) {
    goToSlide(event.state.slide - 1)
  }
};