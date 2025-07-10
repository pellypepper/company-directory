<?php
// deleteDepartment.php
// POST: id (department id to delete)

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

$departmentId = isset($_POST['id']) ? intval($_POST['id']) : (isset($_REQUEST['id']) ? intval($_REQUEST['id']) : 0);

if ($departmentId === 0) {
    $output['status']['code'] = "422";
    $output['status']['name'] = "invalid";
    $output['status']['description'] = "No department ID provided";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

// Check if department has assigned employees
$query = $conn->prepare('SELECT COUNT(*) as count FROM personnel WHERE departmentID = ?');
$query->bind_param("i", $departmentId);
$query->execute();
$result = $query->get_result();
$row = $result->fetch_assoc();

if ($row['count'] > 0) {
    $output['status']['code'] = "403";
    $output['status']['name'] = "forbidden";
    $output['status']['description'] = "Department has employees assigned";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $query->close();
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}
$query->close();

// No employees assigned, safe to delete
$deleteQuery = $conn->prepare('DELETE FROM department WHERE id = ?');
$deleteQuery->bind_param("i", $departmentId);
$deleteQuery->execute();

if ($deleteQuery->affected_rows === 0) {
    $output['status']['code'] = "404";
    $output['status']['name'] = "not found";
    $output['status']['description'] = "Department not found or already deleted";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    $deleteQuery->close();
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "Department deleted successfully";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [];

$deleteQuery->close();
mysqli_close($conn);

echo json_encode($output);
?>