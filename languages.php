<?php
$dir = __DIR__ . '/Localization';
$files = array_filter(scandir($dir), function($f) {
    return pathinfo($f, PATHINFO_EXTENSION) === 'json';
});
echo json_encode(array_values($files));
?>
