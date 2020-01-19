/* jshint esversion: 6 */

/**
  * @desc reads image file
  * @param file imageFile - the file to be read
  * @return promise - resolves with image data URL
*/
function readFileAsImage(imageFile) {
    const fr = new FileReader();

    return new Promise(function (resolve, reject) {
        fr.onerror = function () {
            fr.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        fr.onload = function () {
            resolve(fr.result);
        };
        fr.readAsDataURL(imageFile);
    });
}

/**
  * @desc loads image to Image object
  * @param string imageSrc - src for the image
  * @return promise - resolves with loaded image object
*/
function loadImage(imgSrc) {
    const IMG = new Image();

    return new Promise(function (resolve) {
        IMG.onerror = function () {
            new DOMException("Problem loading image.");
        };

        IMG.onload = function () {
            resolve(IMG);
        };

        IMG.src = imgSrc;
    });
}

/**
  * @desc Creates one square slice of a segment of the image and adds it to DOM
  * @param image image - image object
  * @param number col - number of the column to be created (0 - 2)
  * @param number row - number of the row to be created (0 - 2)
  * @return promise - resolves with input image to allow chaining
*/
function sliceSquare(image, col, row) {
    const CANVAS = document.createElement("canvas");
    const CTX = CANVAS.getContext("2d");
    const FULL_SIZE = Math.max(image.naturalWidth, image.naturalHeight);
    const SQUARE_SIZE = FULL_SIZE / 3;


    // Adjust output position for desired row/column
    const ROW_OFFSET = -(row * SQUARE_SIZE);
    const COL_OFFSET = -(col * SQUARE_SIZE);

    // Adjust output position for non-square input inmage
    const X_ADJUST = (FULL_SIZE - image.naturalWidth) / 2;
    const Y_ADJUST = (FULL_SIZE - image.naturalHeight) / 2;

    /**
      * @desc adds two copies image to DOM (2nd used for spanning pages)
      * @param string imagesrc - src for image slice
      * @param number col - number of the column (0 - 2)
      * @param number row - number of the row (0 - 2)
    */
    function addSquareToDOM(imgsrc, row, col) {
        const OUTPUT = document.querySelector("#output");
        const TEMPLATE = document.querySelector("#pagetemplate");
        const CLONE = TEMPLATE.content.cloneNode(true);
        const TITLE = CLONE.querySelectorAll(".title");
        const IMG = CLONE.querySelectorAll("img");

        const ROW_NAME = ["Top", "Middle", "Bottom"];
        const COL_NAME = ["Left", "Center", "Right"];

        TITLE[0].textContent = `${ROW_NAME[row]} ${COL_NAME[col]}`;
        TITLE[1].textContent = `${ROW_NAME[row]} ${COL_NAME[col]} (Part 2)`;

        IMG[0].src = imgsrc;
        IMG[1].src = imgsrc;

        OUTPUT.appendChild(CLONE);
    }

    CANVAS.width = SQUARE_SIZE;
    CANVAS.height = SQUARE_SIZE;

    CTX.fillStyle = document.getElementById("background").value;
    CTX.fillRect(0, 0, CANVAS.width, CANVAS.height);
    CTX.drawImage(image, COL_OFFSET + X_ADJUST, ROW_OFFSET + Y_ADJUST);

    addSquareToDOM(CANVAS.toDataURL("image/png"), row, col);

    return new Promise((resolve) => resolve(image));
}

/**
  * @desc process input input file
  * @param event evt - onChange event object from file button
*/
function processImage(evt) {
    document.querySelector("#output").innerHTML = "";

    readFileAsImage(evt.target.files[0])
        .then((file) => loadImage(file))
        .then((img) => sliceSquare(img, 0, 0))
        .then((img) => sliceSquare(img, 1, 0))
        .then((img) => sliceSquare(img, 2, 0))
        .then((img) => sliceSquare(img, 0, 1))
        .then((img) => sliceSquare(img, 1, 1))
        .then((img) => sliceSquare(img, 2, 1))
        .then((img) => sliceSquare(img, 0, 2))
        .then((img) => sliceSquare(img, 1, 2))
        .then((img) => sliceSquare(img, 2, 2));

    evt.target.value = null; //Ensure event will fire if same file chosen again
}

/**
  * @desc adds or removes "split" class needed for printing
*/
function checkPrintSplit() {
    const STAGE = document.querySelector("#stage").checked;
    const MAX = document.querySelector("#maxwidth").value;

    if (STAGE && MAX < 25) {
        document.body.classList.add("split");
    } else {
        document.body.classList.remove("split");
    }
}

/**
  * @desc sets class on radio button change
  * @param event evt - onChange event object from radio button
*/
function processRadio(evt) {
    document.querySelector("#output").className = evt.target.id;

    checkPrintSplit();
}

/**
  * @desc sets css maxwidth css variable on input field change
  * @param event evt - onChange event object
*/
function setMaxWidth(evt) {
    const ROOT = document.documentElement;

    ROOT.style.setProperty("--maxwidth", evt.target.value);

    checkPrintSplit();
}

/**
  * @desc sets css overlap css variable on input field change
  * @param event evt - onChange event object
*/
function setOverlap(evt) {
    const ROOT = document.documentElement;

    ROOT.style.setProperty("--overlap", evt.target.value);

    checkPrintSplit();
}

//Set listeners
document.querySelector("#imgfile").addEventListener("change", processImage);
document.querySelector("#stage").addEventListener("change", processRadio);
document.querySelector("#parlor").addEventListener("change", processRadio);
document.querySelector("#maxwidth").addEventListener("change", setMaxWidth);
document.querySelector("#overlap").addEventListener("change", setOverlap);
document.querySelector("#printbtn").addEventListener("click", () => print());
