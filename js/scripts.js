var body,
    main,
    htmlArray,
    slideIndex = 0,
    maxSlideIndex,
    mathJaxCdn = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML",
    converter = new showdown.Converter();

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
      content.append(createSlide(processQuizzes(slide), index));
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

});

function createSlide(slide, index) {
  return $("<div>", {class: "slide", id: "slide-"+index}).html(slide);
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

function processQuizzes(slide) {
  if (/\?\?\?/.test(slide)) {
    return slide.replace(/<p>\?\?\?<\/p>\n<ul>([\s\S]*?)<\/ul>/, function(a, b){
      return "<p>Quiz goes here</p>";
    });
  }
  return slide;
}