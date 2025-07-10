<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if ($conn->connect_errno) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $conn->close();
    echo json_encode($output);
    exit;
}

// Check for required POST fields
if(
    !isset($_POST['firstName']) || 
    !isset($_POST['lastName']) || 
    !isset($_POST['email']) || 
    !isset($_POST['departmentID'])
) {
    $output['status']['code'] = "422";
    $output['status']['name'] = "invalid input";
    $output['status']['description'] = "missing required fields";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $conn->close();
    echo json_encode($output);
    exit;
}

$query = $conn->prepare('INSERT INTO personnel (firstName, lastName, email, departmentID) VALUES (?, ?, ?, ?)');
if (!$query) {
    $output['status']['code'] = "401";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "query preparation failed";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $conn->close();
    echo json_encode($output);
    exit;
}

$query->bind_param(
    "sssi",
    $_POST['firstName'],
    $_POST['lastName'],
    $_POST['email'],
    $_POST['departmentID']
);

$execResult = $query->execute();

if ($execResult === false) {
    $output['status']['code'] = "400";
    $output['status']['name'] = "executed";
    $output['status']['description'] = "query failed: " . $query->error;
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $query->close();
    $conn->close();
    echo json_encode($output);
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];
$query->close();
$conn->close();
echo json_encode($output);
?>