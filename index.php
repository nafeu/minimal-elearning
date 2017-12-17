<?php

$lessonPath = 'example.memd';

if (isset($_GET['lesson'])) {
  $lessonPath = 'memd/' . $_GET['lesson'] . '.memd';
}

$handle = fopen($lessonPath, "r");
$delimiterCount = 2;
$title = "Minimal eLearning";
$description = "A Minimal eLearning lesson.";

if ($handle) {
  while ( (($line = fgets($handle)) !== false) && ($delimiterCount > 0)) {
    if (substr($line, 0, 6) === 'title:') {
      $title = substr($line, 8, -2);
    }

    if (substr($line, 0, 12) === 'description:') {
      $description = substr($line, 14, -2);
    }

    if (strpos($line, '---') !== false) {
      $delimiterCount--;
    }
  }

  fclose($handle);
} else {
  echo "Error opening file.";
}

?>

<!doctype html>
<html class="no-js" lang="en">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <title>Minimal eLearning</title>
    <meta name="description" content="">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta property="og:url" content="http://phrakture.com/elearning" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="<?php echo $title; ?>" />
    <meta property="og:description" content="<?php echo $description; ?>" />
    <meta property="og:image" content="http://phrakture.com/elearning/opengraph-image.png" />
    <link rel="stylesheet" type="text/css" href="bower_components/roboto-fontface/css/roboto/roboto-fontface.css">
    <link rel="stylesheet" type="text/css" href="bower_components/flexboxgrid/dist/flexboxgrid.min.css">
    <link rel="stylesheet" type="text/css" href="bower_components/github-markdown-css/github-markdown.css">
    <link rel="stylesheet" type="text/css" href="bower_components/components-font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" type="text/css" href="css/styles.css">
    <link rel="icon" type="image/png" sizes="96x96" href="./favicon-96x96.png">
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
    <script src="js/scripts.js"></script>
  </body>
</html>