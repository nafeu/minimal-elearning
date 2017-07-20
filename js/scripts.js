$(document).ready(function(){

  var main = $("#main"),
      converter = new showdown.Converter();

  $.get('data/lecture1.md').done(function(data){
    html = converter.makeHtml(data);
    main.html(html);
  });

});