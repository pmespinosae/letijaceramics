<?php
// Webhook receiver para GitHub
$payload = json_decode(file_get_contents('php://input'), true);

if ($payload) {
    $output = shell_exec('cd /home/condadmi/letijaceramics.com.mx && git pull 2>&1');
    file_put_contents('webhook_log.txt', date('Y-m-d H:i:s') . " - " . $output . "\n", FILE_APPEND);
    echo "Pull executed";
} else {
    echo "No payload";
}
?>