<?php

error_reporting(E_ALL);

$app->get('/old', function ($request, $response, $args) {
    return $this->renderer->render($response, 'index.phtml', $args);
});

$app->get('/', function ($request, $response, $args) {
    return $this->renderer->render($response, 'new.phtml', $args);
});

$app->post('/match-and-ocr', function ($request, $response, $args) {
    $files = $request->getUploadedFiles();
    $error = array();

    if (empty($files['face'])) {
        $error["error"] = 'Expected a face';
        print json_encode($error);
        return;
    }
    if (empty($files['id'])) {
        $error["error"] = 'Expected an id';
        print json_encode($error);
        return;
    }

    $faceFilePath = '';
    $idFilePath = '';

    if ($files['face']->getError() === UPLOAD_ERR_OK) {
        $uploadFileName = $files['face']->getClientFilename();
        $rand = md5(microtime(true));
        $faceFilePath = "/tmp/{$rand}-{$uploadFileName}";
        $files['face']->moveTo($faceFilePath);
    } else {
        $error["error"] = 'Ошибка загрузки файла лица';
        print json_encode($error);
        return;
    }

    if ($files['id']->getError() === UPLOAD_ERR_OK) {
        $uploadFileName = $files['id']->getClientFilename();
        $rand = md5(microtime(true));
        $idFilePath = "/tmp/{$rand}-{$uploadFileName}";
        $files['id']->moveTo($idFilePath);
    } else {
        $error["error"] = 'Ошибка загрузки файла айдишки';
        print json_encode($error);
        return;
    }

    if (empty($faceFilePath)) {
        $error["error"] = 'Вы не зааплоадили лицо';
        print json_encode($error);
        return;
    }
    if (empty($idFilePath)) {
        $error["error"] = 'Вы не зааплоадили айдишку';
        print json_encode($error);
        return;
    }

    ///////////

    exec("idmatchd -c $faceFilePath $idFilePath", $outputMatch);
    //$outputMatch = array('{ "code" : "200", "message" : "Match", "int" : "1", "float" : "58.514" } ');

    $matchResult = json_decode(implode("\n", $outputMatch));

    $outPic = md5(microtime(true)).".png";
    $outPicF = md5(microtime(true))."F.png";

    exec("idcardocr $idFilePath ./public/images/$outPic | node ./region-kir.js", $outputOCR);
    //$outputOCR = array('{"serial":"AN444344","firstname":"ОНТОН","surname":"ВАСЕВ","secondname":"ЮРЬЕВИЧ","nationality":"ОРУС","birthday":"11091992","inn":"21679196701007","gender":"Э"}');
    $ocrResult = json_decode(implode("\n", $outputOCR));

    // рисуем регион на лице
    //exec("idmatchd -a $faceFilePath ./public/images/$outPicF");
    //exec("idmatchd -b ./public/images/$outPic ./public/images/$outPic");

    $res['OCR'] = $ocrResult;
    $res['Match'] = $matchResult;

    print json_encode($res);

});

$app->post('/', function ($request, $response, $args) {
    $files = $request->getUploadedFiles();

    if (empty($files['face'])) {
        throw new Exception('Expected a face');
    }
    if (empty($files['id'])) {
        throw new Exception('Expected an id');
    }

    $faceFilePath = '';
    $idFilePath = '';

    if ($files['face']->getError() === UPLOAD_ERR_OK) {
        $uploadFileName = $files['face']->getClientFilename();
        $rand = md5(microtime(true));
        $faceFilePath = "/tmp/{$rand}-{$uploadFileName}";
        $files['face']->moveTo($faceFilePath);
    } else {
        if (!empty($_POST['faceWebcam'])) {
            $rand = md5(microtime(true));
            $faceFilePath = "/tmp/{$rand}-faceFromWebcam.png";
            file_put_contents($faceFilePath, base64_decode(str_replace('data:image/png;base64,', '', $_POST['faceWebcam'])));
        } else {
            throw new Exception("Ошибка загрузки файла лица");
        }
    }

    if ($files['id']->getError() === UPLOAD_ERR_OK) {
        $uploadFileName = $files['id']->getClientFilename();
        $rand = md5(microtime(true));
        $idFilePath = "/tmp/{$rand}-{$uploadFileName}";
        $files['id']->moveTo($idFilePath);
    } else {
        throw new Exception("Ошибка загрузки файла айдишки. Error code is " . $files['id']->getError());
    }

    if (empty($faceFilePath)) {
        throw new Exception('Вы не зааплоадили лицо');
    }
    if (empty($idFilePath)) {
        throw new Exception('Вы не зааплоадили айдишку');
    }

    ///////////

    exec("idmatchd -c $faceFilePath $idFilePath", $outputMatch);
//    $outputMatch = array('{ "code" : "200", "message" : "Match", "int" : "1", "float" : "58.514" } ');

    $matchResult = json_decode(implode("\n", $outputMatch));
    $args['matchPercent'] = intval($matchResult->float);

    $outPic = md5(microtime(true)).".png";
    $outPicF = md5(microtime(true))."F.png";
    exec("idcardocr $idFilePath ./public/images/$outPic | node ./region-kir.js", $outputOCR);

//    $outputOCR = array('{"serial":"AN444344","firstname":"ОНТОН","surname":"ВАСЕВ","secondname":"ЮРЬЕВИЧ","nationality":"ОРУС","birthday":"11091992","inn":"21679196701007","gender":"Э"}');
    $ocrResult = json_decode(implode("\n", $outputOCR));

    // рисуем регион на лице
    exec("idmatchd -a $faceFilePath ./public/images/$outPicF");
    exec("idmatchd -b ./public/images/$outPic ./public/images/$outPic");

    $args['outPic'] = $outPic;
    $args['outPicF'] = $outPicF;
    $args['matchObj'] = $matchResult;
    $args['ocrObj'] = $ocrResult;


    return $this->renderer->render($response, 'new.phtml', $args);
});
