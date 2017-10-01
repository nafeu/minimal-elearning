<!doctype html>
<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Syntax Learning Mockup</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" href="bower_components/roboto-fontface/css/roboto/roboto-fontface.css">
    <link rel="stylesheet" type="text/css" href="bower_components/flexboxgrid/dist/flexboxgrid.min.css">
    <link rel="stylesheet" type="text/css" href="bower_components/github-markdown-css/github-markdown.css">
    <link rel="stylesheet" type="text/css" href="bower_components/components-font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="css/styles.css">
    <script src="bower_components/jquery/dist/jquery.min.js"></script>
    <script src="bower_components/showdown/dist/showdown.min.js"></script>
    <script src="bower_components/showdown-table/dist/showdown-table.min.js"></script>
    <script src="lib/js-yaml-front-client.min.js"></script>
    <script src="lib/jquery.plugins.js"></script>
  </head>
  <body class="row">
    <div id="main" class="col-xs-12 col-sm-offset-2 col-sm-8">
      <div id="meta" class="box"></div>
      <div id="content" class="box markdown-body"></div>
    </div>
    <?php
      if (isset($_GET['lesson'])) {
        echo "<script>var lessonPath = 'data/" . $_GET['lesson'] . ".md';</script>";
      } else {
        echo "<script>var lessonPath = 'sample-lesson.md';</script>";
      }
    ?>
    <script src="js/scripts.js"></script>
  </body>
</html>