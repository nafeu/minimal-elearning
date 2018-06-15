var body, main, front, meta, content, lessonLoader, lessonUrlInput,
    launchLessonBtn, copyLinkBtn, invalidLink, preview, hiddenUrl,
    htmlArray,
    dropper,
    slideIndex = 0,
    maxSlideIndex,
    quizCounter = 0,
    lastLoadType,
    lessonUrl,
    lessonLoaderField,
    title = 'Minimal eLearning',
    customBackgroundColor,
    converter = new showdown.Converter({extensions: ['table']});

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
  lessonLoader = $("#lesson-loader");
  dropper = document.getElementById("lesson-loader-field");
  lessonLoaderField = $("#lesson-loader-field");
  launchLessonBtn = $("#launch-lesson-btn");
  copyLinkBtn = $("#copy-link-btn");
  invalidLink = $("#invalid-link");
  preview = $("#preview");
  hiddenUrl = $("#hidden-url");

  initiateLesson();

  // Keyboard inputs
  $(this).keydown(function(e){
    e = e || window.event;
    if (e.keyCode == '219' || e.keyCode == '37') {
      // e.preventDefault();
      prevSlide();
    }
    else if (e.keyCode == '221' || e.keyCode == '39') {
      // e.preventDefault();
      nextSlide();
    }
  });

  // Events
  $(window).resize(function(){
    resizeContentArea();
    resizeIntro();
    resizeEditor();
  });

  $(".clickable-image").on('click', function(){
    window.open($(this).attr('src'), '_blank');
  });


  dropper.ondragover = function() {
    this.className = "dropper-hover";
    return false;
  }

  dropper.ondragend = function() {
    this.className = "";
    return false;
  }

  dropper.ondrop = function(e) {
    this.className = "";
    e.preventDefault();
    var file = e.dataTransfer.files[0];
    loadFile(file);
  }

  lessonLoaderField.on('change', function(e){
    lessonUrl = e.target.value;
    if (lessonUrl.length > 0) {
      $.get(lessonUrl).done(function(data){
        lastLoadType = "url";
        var front = jsyaml.loadFront(data);
        showPreview(front);
        hiddenUrl.val(generateUrl(lessonUrl));
      }).fail(function(error){
        // invalid link
      })
    } else {
      // invalid link
    }
  })

  lessonLoaderField.on('keydown', function(e){
    if (e.which == 13) {
      this.blur();
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

function initiateLesson() {
  lessonParam = getParameterByName('lesson');
  localParam = getParameterByName('local');
  if (lessonParam) {
    loadByUrl(lessonParam);
  }
  else if (localParam) {
    loadBySession();
  } else {
    showLessonLoader();
    if (window.sessionStorage.lessonData) {
      lastLoadType = "session";
      showPreview(jsyaml.loadFront(window.sessionStorage.lessonData));
    }
  }
}

function loadByUrl(url) {
  $.get(url).done(function(data){
    processLessonData(data);
  }).fail(function() {
    window.location.href = window.location.origin;
  });
}

function loadBySession() {
  if (window.sessionStorage.lessonData) {
    processLessonData(window.sessionStorage.lessonData);
  } else {
    window.location.href = window.location.origin;
  }
}

function loadFile(file) {
  lastLoadType = "session";
  var reader = new FileReader();
  reader.onload = function(event) {
    loadIntoSession(event.target.result);
  };
  reader.readAsText(file);
  reader = null;
}

function launchLesson() {
  if (lastLoadType == "session" && window.sessionStorage.lessonData) {
    lessonUrl = null;
    window.location.href = "http://localhost:3000?local=true";
  } else if (lastLoadType == "url" && lessonUrl) {
    window.sessionStorage.lessonData = null;
    window.location.href = "http://localhost:3000?lesson=" + encodeURI(lessonUrl);
  }
}

function openLessonFile() {
  var uploadForm = document.createElement('form');
  var fileInput = uploadForm.appendChild(document.createElement('input'));

  fileInput.type = 'file';
  fileInput.accept = ".memd";
  fileInput.click();
  fileInput.onchange = function(e) {
    var file = this.files[0];
    loadFile(file);
  }
}

function loadIntoSession(data) {
  window.sessionStorage.lessonData = data;
  showPreview(jsyaml.loadFront(data));
}

function showLessonLoader() {
  body.css("background", "white");
  lessonLoader.show();
}

function processLessonData(data) {
  console.log("Retrieving data...");
  console.log({data: data});

  front = jsyaml.loadFront(data);
  var html = converter.makeHtml(front.__content);
  htmlArray = html.split("\n<p>+++</p>\n");
  maxSlideIndex = htmlArray.length;

  if (front.title) {
    title = front.title + " | Minimal eLearning"
    document.title = title
  }

  content.empty();
  meta.empty();

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
    updateQueryString('slide', slideIndex + 1, true);
  }
  displaySlide();
  resizeIntro();
  resizeEditor();

  if (front.background) {
    body.css("background", front.background)
  }

  if (front.color) {
    $(".meta").css("color", front.color)
  }

  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
}

function updateLoaderMessage(message) {
  lessonLoaderField.attr("placeholder", message);
}

function resetLoaderMessage() {
  updateLoaderMessage("Paste your lesson url here or drop an .memd file");
}

function resizeContentArea() {
  $(".slide").css("min-height", $(window).height() - 90);
}

function resizeIntro() {
  var introMarginTop = ($("#content").height() - $("#intro").height()) * 0.35;
  $("#intro").css("margin-top", introMarginTop + "px");
}

function resizeEditor() {
  $(".CodeMirror, .CodeMirror-scroll").css("min-height", $(window).height() - 90);
}

function showPreview(data) {
  lessonLoaderField.val("");
  preview.slideUp(300);
  setTimeout(function(){
    preview.empty();
    if (data.title && data.author && data.description && data.date) {
      preview.append("<h3>" + data.title + "</h3>");
      preview.append("<h4>by " + data.author + "</h4>");
      preview.append("<p>" + data.description + "</p>");
      preview.append("<p class='preview-date'>" + data.date.toDateString() + "</p>");
      preview.append("<div class='launch-btn' onclick='launchLesson()'>Launch Lesson</div>");
      if (lastLoadType == "url") {
        preview.append("<div class='copy-link-btn' onclick='copyLink()'>Copy Lesson Link</div>");
      }
      preview.css("background-color", "rgba(21, 149, 122, 0.08)");
      preview.css("color", "black");
      if (data.background) {
        preview.css("background-color", data.background);
      }
      if (data.color) {
        preview.css("color", data.color);
      }
      preview.slideDown(400);
    } else {
      updateLoaderMessage("Invalid lesson file.");
    }
  }, 350);
}

function generateUrl(value) {
  return encodeURI(window.location.href + "?lesson=" + value);
}

function copyLink() {
  document.getElementById("hidden-url").select();
  document.execCommand("copy");
  $(".copy-link-btn").text("Copied To Clipboard!");
  setTimeout(function(){
    $(".copy-link-btn").text("Copy Lesson Link");
  }, 750);

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
    )
    .append(
      $("<div>", {
        class: "page-nav-btn page-nav-github",
        onclick: "goToGithub()"
      })
        .append('<i class="fa fa-github" aria-hidden="true"></i>')
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
    displaySlide();
  }
  return slideIndex;
}

function prevSlide() {
  if (slideIndex > 0) {
    slideIndex--;
    updateQueryString('slide', slideIndex + 1, true);
    displaySlide();
  }
  return slideIndex;
}

function firstSlide() {
  slideIndex = 0;
  updateQueryString('slide', slideIndex + 1, true);
  displaySlide();
  return slideIndex;
}

function lastSlide() {
  slideIndex = maxSlideIndex;
  updateQueryString('slide', slideIndex + 1, true);
  displaySlide();
  return slideIndex;
}

function goHome() {
  window.location.href = window.location.origin;
}

function goToSource() {
  window.location.href = lessonUrl;
}

function goToGithub() {
  window.location.href = "https://github.com/nafeu/minimal-elearning";
}

function goToSlideByElement(event, element) {
  var index = parseInt(element.value) - 1;
  if ((event.which == 13) && (index >= 0) && (index <= maxSlideIndex)) {
    element.value = element.name;
    slideIndex = index;
    updateQueryString('slide', slideIndex + 1, true);
    displaySlide();
  }
  return slideIndex;
}

function goToSlide(index) {
  if (index <= maxSlideIndex) {
    slideIndex = index;
    updateQueryString('slide', slideIndex + 1, false);
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
    goToSlide(event.state.slide - 1);
  }
};

var simplemde = new SimpleMDE({
  autofocus: true,
  autosave: {
    enabled: true,
    uniqueId: "MyUniqueID",
    delay: 1000,
  },
  blockStyles: {
    bold: "__",
    italic: "_"
  },
  element: document.getElementById("editor-area"),
  forceSync: true,
  hideIcons: ["guide", "heading"],
  indentWithTabs: false,
  initialValue: "Hello world!",
  insertTexts: {
    horizontalRule: ["", "\n\n-----\n\n"],
    image: ["![](http://", ")"],
    link: ["[", "](http://)"],
    table: ["", "\n\n| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Text     | Text      | Text     |\n\n"],
  },
  lineWrapping: false,
  parsingConfig: {
    allowAtxHeaderWithoutSpace: true,
    strikethrough: false,
    underscoresBreakWords: true,
  },
  placeholder: "Type here...",
  previewRender: function(plainText) {
    return customMarkdownParser(plainText); // Returns HTML from a custom parser
  },
  previewRender: function(plainText, preview) { // Async method
    setTimeout(function(){
      preview.innerHTML = customMarkdownParser(plainText);
    }, 250);

    return "Loading...";
  },
  promptURLs: true,
  renderingConfig: {
    singleLineBreaks: false,
    codeSyntaxHighlighting: true,
  },
  shortcuts: {
    drawTable: "Cmd-Alt-T"
  },
  showIcons: ["code", "table"],
  spellChecker: false,
  status: false,
  status: ["autosave", "lines", "words", "cursor"], // Optional usage
  status: ["autosave", "lines", "words", "cursor", {
    className: "keystrokes",
    defaultValue: function(el) {
      this.keystrokes = 0;
      el.innerHTML = "0 Keystrokes";
    },
    onUpdate: function(el) {
      el.innerHTML = ++this.keystrokes + " Keystrokes";
    }
  }], // Another optional usage, with a custom status bar item that counts keystrokes
  styleSelectedText: false,
  tabSize: 4,
  toolbar: false,
  toolbarTips: false,
});

MathJax.Hub.Config({
  tex2jax: {
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    processEscapes: true
  }
});

if (typeof window.FileReader === 'undefined') {
    alert("drag and drop support unavailable...");
}