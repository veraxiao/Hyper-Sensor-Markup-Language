<?php

if ( !empty( $_FILES ) ) {

    $userName = $_POST['userName'];
    $uploadTime = time();
    $imagePath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $userName . DIRECTORY_SEPARATOR . $uploadTime;
    mkdir($imagePath, 0777, true);
    
    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $uploadPath = $imagePath . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];

    move_uploaded_file( $tempPath, $uploadPath );

    $answer = array( 'answer' => 'File transfer completed', '_POST' => $_POST, 'uploadPath' => $uploadPath );
    $json = json_encode( $answer );

    echo $json;

} else {

    echo 'No files';

}

?>