/* jshint esversion: 6 */

/**
  * @desc reads image file
  * @param file imageFile - the file to be read
  * @return promise - resolves with image data URL
*/
function readFileAsImage(imageFile) {
  let fr = new FileReader();

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
  let img = new Image();

  return new Promise(function (resolve) {
    img.onerror = function () {
      new DOMException("Problem loading image.");
    };

    img.onload = function () {
      resolve(img);
    };

    img.src = imgSrc;
  });
}

/**
  * @desc loads image to square canvas
  * @param img image - image to be loaded
  * @return promise - resolves with canvas
*/
function loadCanvas(img) {
  const SRC_MAX_SIZE = Math.max(img.naturalWidth, img.naturalHeight);
  const SRC_ASPECT = img.naturalWidth / img.naturalHeight;
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  let targetWidth = 0;
  let targetHeight = 0;

  if (SRC_ASPECT > 1) {
    targetWidth = Math.min(img.naturalWidth, 4500);
    targetHeight = targetWidth / SRC_ASPECT;
  } else {
    targetHeight = Math.min(img.naturalHeight, 4500);
    targetWidth = targetHeight * SRC_ASPECT;
  }

  canvas.width = Math.min(SRC_MAX_SIZE, 4500);
  canvas.height = canvas.width;

  ctx.fillStyle = document.getElementById("background").value;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.drawImage(img,
    0,
    0,
    img.naturalWidth,
    img.naturalHeight,
    (canvas.width - targetWidth) / 2,   //offset for non square image
    (canvas.height - targetHeight) / 2, //offset for non square image
    targetWidth,
    targetHeight
  );
  return new Promise((resolve) => resolve(canvas));
}

/**
  * @desc Creates one square slice of a segment of the image and adds it to DOM
  * @param srcCanvas canvas - image object
  * @return promise - resolves with input image to allow chaining
*/
function sliceSquare(srcCanvas) {
  const SQUARE_SIZE = srcCanvas.height / 3;
  let destCanvas = document.createElement("canvas");
  let destCtx = destCanvas.getContext("2d");

  /**
    * @desc appends image to DOM
    * @param row int - row number (0-2)
    * @param col int - col number (0-2)
  */
  function appendImage(row, col) {
    let img = new Image();

    destCtx.drawImage(
      srcCanvas,
      SQUARE_SIZE * row,
      SQUARE_SIZE * col,
      SQUARE_SIZE,
      SQUARE_SIZE,
      0,
      0,
      destCanvas.width,
      destCanvas.height
    )

    img.className = "square";
    // img.src = destCanvas.toDataURL("image/png");
    img.src = destCanvas.toDataURL("image/jpeg");
    document.querySelector("#output").appendChild(img);
  }

  destCanvas.width = SQUARE_SIZE;
  destCanvas.height = SQUARE_SIZE;

  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 3; row++) {
      appendImage(row, col);
    }
  }

  return new Promise((resolve) => resolve());
}

/**
  * @desc process input input file
  * @param event evt - onChange event object from file button
*/
function processImage(evt) {
  const LOADER = document.querySelector(".loader");
  document.querySelector("#output").innerHTML = "";

  LOADER.classList.add("show");
  readFileAsImage(evt.target.files[0])
    .then((file) => loadImage(file))
    .then((img) => loadCanvas(img))
    .then((srcCanvas) => sliceSquare(srcCanvas))
    .finally(() => LOADER.classList.remove("show"));

  evt.target.value = null; //Ensure event will fire if same file chosen again
}

/**
  * @desc Creates a slice of an image
  * @param image image- input image
  * @param leftCM int- start of left edge of slice
  * @param widthCM int- width of slice
*/
function slice(squareImage, left, width) {
  const CANVAS = document.createElement("canvas");
  const CTX = CANVAS.getContext("2d");

  CANVAS.width = Math.max(width, 1);
  CANVAS.height = Math.max(squareImage.naturalHeight, 1);

  CTX.drawImage(
    squareImage,
    left,
    0,
    CANVAS.width,
    CANVAS.height,
    0,
    0,
    CANVAS.width,
    CANVAS.height
  );

  // return CANVAS.toDataURL("image/png");
  // return CANVAS.toDataURL("image/jpeg");
}

/**
  * @desc adds square or slice of a square to the PDF.
  * @param PDF jsPDF - jsPDF Object
  * @param square image - input image square
  * @param left int- start of left edge of slice in CM
  * @param maxWidth int- max width in CM
*/
function addSquare(PDF, square, left, maxwidth) {
  const SQUARE_SIZE = parseInt(
      document.querySelector("[name=size]:checked").value
  );
  const PAPER_SEL = document.querySelector("#paper option:checked");
  const PAGE_WIDTH = parseFloat(PAPER_SEL.dataset.pagewidth);

  const WIDTH = Math.min(SQUARE_SIZE, maxwidth);
  const TOP_MARGIN = 1.25;
  const LEFT_MARGIN = (PAGE_WIDTH - WIDTH) / 2;
  const OUTLINE_WIDTH = 0.02;

  const LEFT_PX = (left / SQUARE_SIZE) * square.naturalWidth;
  const WIDTH_PX = (WIDTH / SQUARE_SIZE) * square.naturalWidth;

  PDF.setFillColor(204, 204, 204);
  PDF.rect(
    LEFT_MARGIN - OUTLINE_WIDTH,
    TOP_MARGIN - OUTLINE_WIDTH,
    WIDTH + (2 * OUTLINE_WIDTH),
    SQUARE_SIZE + (2 * OUTLINE_WIDTH),
    "F"
  );

  PDF.addImage(
    slice(square, LEFT_PX, WIDTH_PX),
    "JPEG",
    LEFT_MARGIN,
    TOP_MARGIN,
    WIDTH,
    SQUARE_SIZE,
    "",
    "NONE"
  );
}

/**
  * @desc Creates PDF file
  * @param print string - if true, prints file. Otherwise saves.
*/
function makePDF(print = false) {
  const SQUARE_SIZE = parseInt(
    document.querySelector("[name=size]:checked").value
  );
  const PAPER_SEL = document.querySelector("#paper option:checked");
  const FORMAT = PAPER_SEL.value;
  const PAGE_WIDTH = parseFloat(PAPER_SEL.dataset.pagewidth);
  const MAX_WIDTH = parseInt(PAPER_SEL.dataset.contentwidth);
  const OVERLAP = parseInt(document.querySelector("#overlap").value);

  const PDF = new jsPDF({unit: "cm", format: FORMAT, compress: false});

  /**
    * @desc Adds image to PDF as seperate page(s)
    * @param image image - image to be added.
    * @param i int - number of image (1-8).
  */
  function processImage(image, i) {
    const TITLES = [
      "Top Left", "Top Center", "Top Right",
      "Middle Left", "Middle Center", "Middle Right",
      "Bottom Left", "Bottom Center", "Bottom Right"
    ];
    let title = TITLES[i];
    let titleWidth = PDF.getTextWidth(title);

    if (i > 0) {
      PDF.addPage({format: FORMAT});
    }

    PDF.setFontSize(8);
    PDF.text(title, 1.25, 1.25 + titleWidth, {angle: 90});
    addSquare(PDF, image, 0, MAX_WIDTH);

    if (SQUARE_SIZE > MAX_WIDTH) {
      const SLICE_WIDTH = MAX_WIDTH - OVERLAP;

      PDF.addPage({format: FORMAT});

      title = `${TITLES[i]} (Part 2)`;
      titleWidth = PDF.getTextWidth(title);

      PDF.text(title, 1.25, 1.25 + titleWidth, {angle: 90});
      addSquare(PDF, image, SLICE_WIDTH, SQUARE_SIZE - SLICE_WIDTH);
    }
  }

  /**
    * @desc Finishes PDF processing
  */
  function closePDF() {
    if (print) {
      PDF.autoPrint();
      document.querySelector("#printer").src = PDF.output("bloburl");
    } else {
      PDF.save("tictactoe.pdf");
    }
    document.querySelector(".loader").classList.remove("show");
  }

  /**
    * @desc Adds all images to PDF as a single page
  */
  function makeSinglePage() {
    const LEFT_ORIGIN = (PAGE_WIDTH / 2) - 4;
    const TOP_ORIGIN = 1.25;
    const OUTLINE_WIDTH = 0.02;

    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 3; row++) {
        let x = LEFT_ORIGIN + (3 * row);
        let y = TOP_ORIGIN + (3 * col);
        let image = document.querySelector(
          `.square:nth-child(${1 + row + (col * 3)})`
        );

        PDF.setFillColor(204, 204, 204);
        PDF.rect(
          x - OUTLINE_WIDTH,
          y - OUTLINE_WIDTH,
          2 + (2 * OUTLINE_WIDTH),
          2 + (2 * OUTLINE_WIDTH),
          "F"
        );

        PDF.addImage(image, "JPEG", x, y, 2, 2, "", "NONE");
      }
    }

    closePDF();
  }


  /**
    * @desc Throttles makePDF to avoid locking main thread too long
    * @param num int - number of image to be processed (0-8)
  */
  function throttledMakePDF(num) {
    let img = document.querySelector(`.square:nth-child(${num + 1})`);
    processImage(img, num);

    if (num < 8 ) {
      requestAnimationFrame(() => throttledMakePDF(num + 1));
    } else {
      closePDF();
    }
  }


  if (SQUARE_SIZE === 2) {
      makeSinglePage();
  } else {
    requestAnimationFrame(() => throttledMakePDF(0));
  }
}

//Set listeners
document.querySelector("#imgfile").addEventListener("change", processImage);
document.querySelector("#printbtn").addEventListener(
  "click",
  function () {
    document.querySelector(".loader").classList.add("show");
    setTimeout(()=>makePDF(true), 100); // allow spinner to start
  }
);
document.querySelector("#savebtn").addEventListener(
  "click",
  function () {
    document.querySelector(".loader").classList.add("show");
    setTimeout(()=>makePDF(false), 100); // allow spinner to start
  }
);
