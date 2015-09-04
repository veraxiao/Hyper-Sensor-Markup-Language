<?php

if ( !empty( $_FILES ) ) {

    $userName = $_POST['userName'];
    $dirName = $_POST['dirName'];
    
    $imagePath = dirname( __FILE__ ) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $userName . DIRECTORY_SEPARATOR . $dirName;
    
    if(!is_dir($imagePath))
        mkdir($imagePath, 0777, true);
    
    $tempPath = $_FILES[ 'file' ][ 'tmp_name' ];
    $uploadPath = $imagePath . DIRECTORY_SEPARATOR . $_FILES[ 'file' ][ 'name' ];
    
    //callback web path.
    $filePath = 'uploads' . '/' . $userName . '/' . $dirName. '/' . $_FILES['file']['name'];
    
    move_uploaded_file( $tempPath, $uploadPath );

    $answer = array( 'answer' => 'File transfer completed', 'filePath' => $filePath);
    $json = json_encode( $answer );

    echo $json;

} else {

    echo 'No files';

}

?>