$(document).ready(function(){

  var main = $("#main"),
      converter = new showdown.Converter();

  $.get('data/lecture1.md').done(function(data){
    var html = converter.makeHtml(data);
    var htmlArray = html.split("\n<p>+++</p>\n");
    console.log(htmlArray);

    htmlArray.forEach(function(slide){

      main.append(createSlide(slide));

    });

  });

});

function createSlide(slide) {
  return $("<div>", {class: "slide"}).html(slide);
}