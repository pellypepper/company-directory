<?php
    // updatePersonnel.php
    // POST: id, firstName, lastName, email, jobTitle, departmentID

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

    // Validate required fields
    $id = isset($_POST['id']) ? intval($_POST['id']) : null;
    $firstName = isset($_POST['firstName']) ? $_POST['firstName'] : null;
    $lastName = isset($_POST['lastName']) ? $_POST['lastName'] : null;
    $email = isset($_POST['email']) ? $_POST['email'] : null;
    $departmentID = isset($_POST['departmentID']) ? intval($_POST['departmentID']) : null;

    if (!$id || !$firstName || !$lastName || !$email  || !$departmentID) {
        $output['status']['code'] = "422";
        $output['status']['name'] = "invalid";
        $output['status']['description'] = "missing required fields";
        $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
        $output['data'] = [];
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    // Use prepared statement to avoid SQL injection
    $stmt = $conn->prepare("UPDATE personnel SET firstName=?, lastName=?, email=?, departmentID=? WHERE id=?");
    $stmt->bind_param("ssssi", $firstName, $lastName, $email,  $departmentID, $id);

    if (!$stmt->execute()) {
        $output['status']['code'] = "400";
        $output['status']['name'] = "executed";
        $output['status']['description'] = "update failed";
        $output['data'] = [];
        $stmt->close();
        mysqli_close($conn);
        echo json_encode($output);
        exit;
    }

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "personnel updated";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];

    $stmt->close();
    mysqli_close($conn);
    echo json_encode($output);
?>