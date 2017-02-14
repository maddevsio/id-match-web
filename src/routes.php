<?php

error_reporting(E_ALL);

$app->get('/old', function ($request, $response, $args) {
    return $this->renderer->render($response, 'index.phtml', $args);
});

$app->get('/', function ($request, $response, $args) {
    return $this->renderer->render($response, 'new.phtml', $args);
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
        throw new Exception("Ошибка загрузки файла лица");
    }

    if ($files['id']->getError() === UPLOAD_ERR_OK) {
        $uploadFileName = $files['id']->getClientFilename();
        $rand = md5(microtime(true));
        $idFilePath = "/tmp/{$rand}-{$uploadFileName}";
        $files['id']->moveTo($idFilePath);
    } else {
        throw new Exception("Ошибка загрузки файла айдишки");
    }

    if (empty($faceFilePath)) {
        throw new Exception('Вы не зааплоадили лицо');
    }
    if (empty($idFilePath)) {
        throw new Exception('Вы не зааплоадили айдишку');
    }

    ///////////

    exec("idmatchd -c $faceFilePath $idFilePath", $outputMatch);

    $matchResult = json_decode(implode("\n", $outputMatch));
    $args['matchPercent'] = intval($matchResult->float);

    $outPic = md5(microtime(true)).".png";
    $outPicF = md5(microtime(true))."F.png";
    exec("idcardocr $idFilePath ./public/images/$outPic | node ./region-kir.js", $outputOCR);

    // рисуем регион на лице
    exec("idmatchd -a $faceFilePath ./public/images/$outPicF");
    exec("idmatchd -b ./public/images/$outPic ./public/images/$outPic");

    $args['outPic'] = $outPic;
    $args['outPicF'] = $outPicF;
    $args['jsonMatch'] = implode("\n", $outputMatch);
    $args['jsonOCR'] = implode("\n", $outputOCR);

    var_dump(json_decode(implode("\n", $outputMatch)));
    var_dump(json_decode(implode("\n", $outputOCR)));

    return $this->renderer->render($response, 'new.phtml', $args);
});
