<?php
// Bu dosya, Localization klasöründeki tüm .json dosyalarını listeler.
// PHP çalışmayan ortamlarda (ör. GitHub Pages) bunun yerine languages.json dosyasını kullanabilirsiniz.
// Eğer yeni bir dil eklediyseniz, aşağıdaki kodu çalıştırarak languages.json dosyasını otomatik güncelleyebilirsiniz:
//
// $dir = __DIR__ . '/Localization';
// $files = array_filter(scandir($dir), function($f) {
//     return pathinfo($f, PATHINFO_EXTENSION) === 'json';
// });
// file_put_contents(__DIR__ . '/languages.json', json_encode(array_values($files), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
//
$dir = __DIR__ . '/Localization';
$files = array_filter(scandir($dir), function($f) {
    return pathinfo($f, PATHINFO_EXTENSION) === 'json';
});
echo json_encode(array_values($files));
?>
