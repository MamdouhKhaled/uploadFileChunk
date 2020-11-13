<?php
// Get File Info From ajax Requset
$fileInfo = json_decode($_POST['fileInfo']);
// Get Data Form post and Decode Data
$chunk = decode_chunk($_POST['file']);

// Put File Content at End of Same File
file_put_contents('uploads/' . $fileInfo->name, $chunk, FILE_APPEND);
// return response as json 
$response = [
    "fileInfo" => $fileInfo->name,
    "status" => 200,
    "part" => $fileInfo->part,
    "total" => $fileInfo->total-1,
];


function decode_chunk($data)
{
    $data = explode(';base64,', $data);

    if (!is_array($data) || !isset($data[1])) {
        return false;
    }

    $data = base64_decode($data[1]);
    if (!$data) {
        return false;
    }

    return $data;
}

header('Content-Type: application/json');
echo json_encode($response);
