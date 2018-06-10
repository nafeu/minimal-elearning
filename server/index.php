<?php

header('Access-Control-Allow-Origin: *');

$file = file_get_contents($_GET['lesson'] . ".memd");

echo $file;

?>