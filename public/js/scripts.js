$(function () {
    $("#typed").typed({
        stringsElement: $('#typed-strings'),
        typeSpeed: -20,
        startDelay: 2,
        cursorChar: "&block;",
        callback: function() {
            $('.typed-cursor').hide();
            var count = 15;
            var dots = $('#dots');
            var timer = setInterval(
                function(){
                    dots.text(dots.text() + '.');
                    count --;
                    if(count == 0){
                        clearInterval(timer);
                        $('.json_wrap').show();
                        $('.inst-info').fadeIn('slow');
                    }
                }, 100
            );
        }
    });
});

$(function () {
    var width = 320;
    var height = 0;

    var streaming = false;

    var video = null;
    var canvas = null;
    var photo = null;
    var startbutton = null;


    // $(function startup() {
    //     video = document.getElementById('video');
    //     canvas = document.getElementById('canvas');
    //     photo = document.getElementById('photo');
    //     startbutton = document.getElementById('startbutton');
    //
    //     navigator.mediaDevices.getUserMedia({video: true, audio: false})
    //         .then(function (stream) {
    //             video.srcObject = stream;
    //             video.play();
    //         })
    //         .catch(function (err) {
    //             console.log("An error occured! " + err);
    //         });
    //
    //     video.addEventListener('canplay', function (ev) {
    //         if (!streaming) {
    //             height = video.videoHeight / (video.videoWidth / width);
    //
    //             video.setAttribute('width', width);
    //             video.setAttribute('height', height);
    //             canvas.setAttribute('width', width);
    //             canvas.setAttribute('height', height);
    //             streaming = true;
    //         }
    //     }, false);
    //
    //     startbutton.addEventListener('click', function (ev) {
    //         takepicture();
    //         ev.preventDefault();
    //     }, false);
    //
    //     function clearphoto() {
    //         var context = canvas.getContext('2d');
    //         context.fillStyle = "#AAA";
    //         context.fillRect(0, 0, canvas.width, canvas.height);
    //
    //         var data = canvas.toDataURL('image/png');
    //         photo.css( "background" , data);
    //     }
    //
    //     function takepicture() {
    //         var context = canvas.getContext('2d');
    //         if (width && height) {
    //             canvas.width = width;
    //             canvas.height = height;
    //             context.drawImage(video, 0, 0, width, height);
    //
    //             var data = canvas.toDataURL('image/png');
    //             $(photo).css('background-image', 'url(' + data + ')');
    //             console.log(data)
    //         } else {
    //             clearphoto();
    //         }
    //     }
    // });
});
$(function () {
    $('#face').change(function () {
        var fileName = $(this).val();
        var photo_label = $(this).closest('#photo').find(".filename");
        fileName = fileName.replace('C:\\fakepath\\','') ;
        if(!fileName){
            photo_label.removeClass('add_item');
            fileName = photo_label.data('message');
            $('#arrows').removeClass('animate');
            $('.my_scan').addClass('disabled');
            $('#arrows_dock').removeClass('animate');
            $('.submit').addClass('disabled');
        }else{
            photo_label.addClass('add_item');
            $('#arrows').addClass('animate');
            $('.my_scan').removeClass('disabled');
        }
        photo_label.html(fileName);
        $('#id').trigger('change');
    });
    $('#id').change(function () {
        var fileName = $(this).val();
        var dock_label = $(this).closest('#document').find(".filename");
        fileName = fileName.replace('C:\\fakepath\\','');
        var photo_val = $('#face').val();
        if(!fileName && photo_val){
            dock_label.removeClass('add_item');
            fileName = dock_label.data('message');
            $('#arrows_dock').removeClass('animate');
            $('.submit').addClass('disabled');
        }else if(photo_val){
            dock_label.addClass('add_item');
            $('#arrows_dock').addClass('animate');
            $('.submit').removeClass('disabled');
        }
        dock_label.html(fileName);
    });
});
