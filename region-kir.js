
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});




// main array of blocks
var blocks = [];


// reading input
rl.on('line', function(line) {
    var block = new Block(line);
    blocks.push(block);
});


// do the job
rl.on('close', function(line) {
    blocks_normalize(blocks);
    //blocks_out(blocks);
    var info = new Info();


    info.find_serial(blocks);
    info.find_surname(blocks);
    info.find_firstname(blocks);
    info.find_secondname(blocks);
    info.find_nationality(blocks);
    info.find_birthday(blocks);
    info.find_inn(blocks);
    info.find_gender(blocks);
    info.print_out();
});


// helper function that normalizes coordinates to 0..1 space
function blocks_normalize(arr) {
    var left = 1e10;
    var right = -1e10;
    var topp = 1e10;
    var bottom = -1e10;

    for (var i = 0; i < arr.length; i++)
    {
        if (left > arr[i].x)
            left = arr[i].x;
        if (right < arr[i].x + arr[i].w)
            right = arr[i].x + arr[i].w;
        if (topp > arr[i].y)
            topp = arr[i].y;
        if (bottom < arr[i].y + arr[i].h)
            bottom = arr[i].y + arr[i].h;
    }

    for (var i = 0; i < arr.length; i++)
    {
        arr[i].x -= left;
        arr[i].y -= topp;

        arr[i].x = arr[i].x / (right - left);
        arr[i].y = arr[i].y / (bottom - topp);

        arr[i].w = arr[i].w / (right - left);
        arr[i].h = arr[i].h / (bottom - topp);
    }
}

// constructor for Block object
function Block (line) {
    var arr = line.split("\t");
    if (5 < arr.length)
        throw ("Parsing error");

    this.x = parseFloat(arr[0]);
    this.y = parseFloat(arr[1]);
    this.w = parseFloat(arr[2]);
    this.h = parseFloat(arr[3]);
    this.str = arr[4];
}

// dump values
function blocks_dump(arr) {
    for(var i = 0; i < arr.length; i++) {
        console.log(arr[i].x + " - " + arr[i].y + " - " + arr[i].w + " - " + arr[i].h + " - " + arr[i].str);
    }
}

// constructor for Info object
function Info() {
    this.serial = "";
    this.firstname = "";
    this.surname = "";
    this.secondname = "";
    this.nationality = "";
    this.birthday = "";
    this.inn = "";
    this.gender = "";
}

Info.prototype.find_serial = function(arr) {
    this.serial = this.find_common(0.07, 0.85, arr);
};

Info.prototype.find_surname = function(arr) {
    this.surname = this.find_common(0.325, 0.268, arr);
};

Info.prototype.find_firstname = function(arr) {
    this.firstname = this.find_common(0.325, 0.4, arr);
};

Info.prototype.find_secondname = function(arr) {
    this.secondname = this.find_common(0.325, 0.536, arr);
};

Info.prototype.find_nationality = function(arr) {
    this.nationality = this.find_common(0.325, 0.88, arr);
};

Info.prototype.find_birthday = function(arr) {
    var res = "";
    // find first item of birthday
    var id = -1;
    var dist = 1e10;
    for (var i = 0; i < arr.length; i++)
    {
        var distx = Math.abs(0.325 - arr[i].x);
        var disty = Math.abs(0.65 - arr[i].y);
        if (distx + disty > dist)
            continue;

        dist = distx + disty;
        id = i;
    }

    if (-1 == id)
        return false;

    // find all items of birthday
    var parts = [];
    for(var i = 0; i < arr.length; i++)
    {
        var distgender = Math.abs(0.71 - arr[i].x); // gender
        var disty = Math.abs(0.65 - arr[i].y);
        if ((0.03 > disty) &&
            (0.1 < distgender) &&
            (arr[i].x - arr[id].x >= 0.0))
        {
            parts.push(arr[i]);
        }
    }

    if (0 == parts.length)
        throw "Requiered birthday regions not found";

    // sort from left to right
    var partss = parts.sort(function (a, b) { return a.x - b.x; } );

    // concat
    for (var i = 0; i < parts.length; i++)
        this.birthday += parts[i].str;
};


Info.prototype.find_inn = function(arr) {
    this.inn = this.find_common(0.62, 0.94, arr);
};


Info.prototype.find_gender = function(arr) {
    this.gender = this.find_common(0.71, 0.65, arr);
};


Info.prototype.find_common = function(x, y, arr) {
    var id = -1;
    var dist = 1e10;
    for (var i = 0; i < arr.length; i++)
    {
        var distx = Math.abs(x - arr[i].x);
        var disty = Math.abs(y - arr[i].y);
        if (distx + disty > dist)
            continue;

        dist = distx + disty;
        id = i;
    }

    if (-1 == id)
        throw "Required region not found";

    return arr[id].str;
};

// dump Info
Info.prototype.print_out = function() {
    var str = JSON.stringify(this);
    process.stdout.write(str + "\n");
};