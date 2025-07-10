<?php
// deletePersonnel.php
// POST: id (personnel id to delete)

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$personnelId = isset($_POST['id']) ? intval($_POST['id']) : 0;

if ($personnelId === 0) {
    $output['status']['code'] = "422";
    $output['status']['name'] = "invalid";
    $output['status']['description'] = "No personnel ID provided";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// No dependencies, safe to delete
$deleteQuery = $conn->prepare('DELETE FROM personnel WHERE id = ?');
$deleteQuery->bind_param("i", $personnelId);
$deleteQuery->execute();

if ($deleteQuery->affected_rows === 0) {
    $output['status']['code'] = "404";
    $output['status']['name'] = "not found";
    $output['status']['description'] = "Personnel not found or already deleted";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $deleteQuery->close();
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "Personnel deleted successfully";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

$deleteQuery->close();
mysqli_close($conn);

echo json_encode($output);
?>