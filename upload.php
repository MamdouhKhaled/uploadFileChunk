<?php
$fileInfo = json_decode($_POST['fileInfo']);
$new_file_name = 'chunkd/' . md5($fileInfo->name) . '.part' . (int)$_POST['part'];
move_uploaded_file($_FILES['file']['tmp_name'], $new_file_name);

if ((int)$_POST['part'] == $fileInfo->total-1)  {
    for ($i = 0; $i < $fileInfo->total; $i++) {
        $new_file_name = 'chunkd/' . md5($fileInfo->name) . '.part' . $i;
        $content = file_get_contents($new_file_name);
        file_put_contents('uploads/' . $fileInfo->name, $content, FILE_APPEND);
        unlink($new_file_name);
    }
}

echo json_encode([
    'fileInfo' => $fileInfo->name,
    'status' => 200,
    'part' => (int)$_POST['part']
]);
