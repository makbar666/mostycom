<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $pdo = new PDO("mysql:host=103.247.9.164;dbname=mosb4829_traveler_db", "mosb4829_akbar", "oRZ0NY9_V^nN@E(W");
    echo "CONNECTED OK";
} catch (Exception $e) {
    echo $e->getMessage();
}
