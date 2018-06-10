<?php

$fileNames = glob('*.{memd}', GLOB_BRACE);
$appUrl = "[ENTER_APP_URL]";

echo "<h1>Pick A Lesson:</h1>";

foreach ($fileNames as &$value) {
  $name = explode(".", $value, 2)[0];
  $encodedUrl = urlencode($_SERVER['REQUEST_SCHEME'] . "://" . $_SERVER['SERVER_NAME'] . substr($_SERVER["REQUEST_URI"], 0, -8) . "?lesson=" . $name);
  $href = $appUrl . "?lesson=" . $encodedUrl;
  echo "<a href=" . $href . ">" . $name . "</a><br>";
}

?>