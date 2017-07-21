var body,
    main,
    htmlArray,
    slideIndex = 0,
    maxSlideIndex,
    converter = new showdown.Converter();

$(document).ready(function(){

  // Selectors
  body = $("body");
  main = $("#main");

  // Markdown parsing logic
  $.get('data/lecture1.md').done(function(data){
    var html = converter.makeHtml(data);
    htmlArray = html.split("\n<p>+++</p>\n");
    maxSlideIndex = htmlArray.length - 1;

    console.log(htmlArray);

    htmlArray.forEach(function(slide, index){
      main.append(createSlide(slide, index));
    });

    displaySlide();
  });

  // Keyboard inputs
  $(this).keydown(function(e){
    e = e || window.event;
    e.preventDefault();
    if (e.keyCode == '37') {
       prevSlide();
    }
    else if (e.keyCode == '39') {
       nextSlide();
    }
  });

});

function createSlide(slide, index) {
  return $("<div>", {class: "slide", id: "slide-"+index}).html(slide);
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