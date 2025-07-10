<?php
include("config.php");
header('Content-Type: application/json; charset=UTF-8');
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

$stmt = $conn->prepare("INSERT INTO location (name) VALUES (?)");
$stmt->bind_param("s", $_POST['name']);
$stmt->execute();

$output = ["status"=>["code"=> $stmt ? "200" : "400", "name"=> $stmt ? "ok" : "error", "description"=> $stmt ? "Added" : "Failed"]];
echo json_encode($output);
$conn->close();
?>