// Warm_Wooly
// 6/18/24 v1.9

window.resizeTo(400, 400); // Resize

function getCurrentURL() {
  return window.location.href
}

function urlText(usearch) {
  usearch = usearch.replace(/%20/g, " ")
  usearch = usearch.replace(/&amp;/g, "&")
  usearch = usearch.replace(/%C3%A9/g, "é")
  usearch = usearch.replace(/%c3%A9/g, "é")
  usearch = usearch.replace(/%C3%a7/g, "ç")
  usearch = usearch.replace(/%c3%a7/g, "ç")
  usearch = usearch.replace(/%3C/g, "<")
  usearch = usearch.replace(/%3c/g, "<")
  usearch = usearch.replace(/%3E/g, ">")
  usearch = usearch.replace(/%3e/g, ">")
  return usearch
}

var urlid
function urlId() {
  var url = getCurrentURL()
  var ui = url.split("#")[1]
  var colorType = url.split("#")[2]

  if (colorType == "bright") { document.getElementById("ExpandedImage").classList.add("brightImage") }
  else if (colorType == "dark") { document.getElementById("ExpandedImage").classList.add("darkImage") };

  // Prevent undefined urlid
  if (ui == undefined) {
    ui = "git/first.jpg"
  }

  return ui
}

var urlRead = urlText(urlId())

document.getElementById("PageTitle").innerHTML = urlRead.split("/")[urlRead.split("/").length - 1]

document.getElementById("ExpandedImage").src = urlRead
document.getElementById("ImageExpander").classList.remove("hidden")

// Set the size of the window relative to the image
var img = document.getElementById('ExpandedImage');
var imgEx = document.getElementById('ImageExpander');
var imgCover = document.getElementById('ImageCover');
var shift = false;
var fixed = false;

function popupResize() {
  if (!fixed) {
    if (currentRotation % 180 === 0) { // Check if rotated
      var width = img.naturalWidth;
      var height = img.naturalHeight;
      //imgEx.style.width = "100%";
      //imgEx.style.height = "100%";
      //imgEx.style.top = "0px";
      //imgEx.style.left = "0px";
    } else {
      var width = img.naturalHeight;
      var height = img.naturalWidth;
      //imgEx.style.width = (100) + "%";
      //imgEx.style.height = (100) + "%";
      //imgEx.style.top = (height/-2) + "px";
      //imgEx.style.left = (width/-2) + "px";

    }

    var newWidth = window.innerWidth;
    var newHeight = window.innerWidth * (height / width);

    if (newHeight > window.innerHeight) {
      newHeight = window.innerHeight;
      newWidth = window.innerHeight * (width / height);
    }

    console.log(width, height, window.innerWidth, window.innerHeight, window.outerHeight, newWidth, newHeight)

    window.resizeTo(newWidth, newHeight + (window.outerHeight - window.innerHeight));
  }
}

// Close popup window
function removePopup() {
  window.close()
}

// Detect keystrokes
document.addEventListener('keydown', function(event) {
  if (event.key === "Z" || event.key === "z") { flipRotate("horizontalFlip") }
  if (event.key === "X" || event.key === "x") { flipRotate("verticalFlip") }
  if (event.key === "R" || event.key === "r") { flipRotate("rotate") }
  if (event.key === "F" || event.key === "f") { flipRotate("reverseRotate") }
  if (event.key === "A" || event.key === "a") { flipRotate("stretchHorizontalFlip") }
  if (event.key === "S" || event.key === "s") { flipRotate("stretchVerticalFlip") }
  if (event.key === "Q" || event.key === "q") { flipRotate("reset") }
  if (event.key === "B" || event.key === "b") { flipRotate("blur") }
  if (event.key === "N" || event.key === "n") { flipRotate("invert") }
  if (event.key === "M" || event.key === "m") { flipRotate("sepia") }
  if (event.key === "G" || event.key === "g") { flipRotate("grayscale") }
  if (event.key === "H" || event.key === "h") { flipRotate("hueRotate") }
  if (event.key === "P" || event.key === "p") { flipRotate("fixSize") }
  if (event.key === "I" || event.key === "i") { flipRotate("increaseSize") }
  if (event.key === "O" || event.key === "o") { flipRotate("decreaseSize") }
  if (event.key === "Y" || event.key === "y") { flipRotate("veryIncreaseSize") }
  if (event.key === "U" || event.key === "u") { flipRotate("veryDecreaseSize") }
  if (event.key === "1") { flipRotate("shiftFirst") }
  if (event.key === "2") { flipRotate("shiftSecond") }
  if (event.key === "3") { flipRotate("shiftThird") }
  if (event.key === "4") { flipRotate("shiftFourth") }
  if (event.key === "5") { flipRotate("shiftFifth") }
  if (event.key === "ArrowLeft") { flipRotate("moveLeft") }
  if (event.key === "ArrowRight") { flipRotate("moveRight") }
  if (event.key === "ArrowUp") { flipRotate("moveUp") }
  if (event.key === "ArrowDown") { flipRotate("moveDown") }
  if (event.key === "Shift") { shift = true }
})

document.addEventListener('keyup', function(event) {
  if (event.key === "Shift") { shift = false}
})

// Flip/rotate an image based on keystrokes
var currentRotation = 0;
var horizontalFlip = 1;
var verticalFlip = 1;
var horizontalDirection = 1;
var verticalDirection = 1;
var blur = 0;
var sepia = 0;
var invert = 0;
var grayscale = 0;
var hueRotate = 0;
var increaseSpeed = 1;

function flip(t) {
  var type; var direction
  if (t == "hor" || t == "horS") { type = horizontalFlip; direction = horizontalDirection; }
  else if (t == "ver" || t == "verS") { type = verticalFlip; direction = verticalDirection; };

  if (type >= 1) { direction = -1} else if (type <= -0.9) { direction = 1 };
  if (t == "horS" || t == "verS") { if (type >= 0) { direction = 1} else { direction = -1 }; };
  
  if (shift) {
    type += 0.1 * direction;
  } else {
    if (type % 1 != 0) {
      while (type % 1 != 0) { if (type > 0) { type = 1 } else { type = -1 }};
    } else {
      type *= -1
    }
  }

  if (t == "horS" || t == "verS") { direction *= -1 };
  
  return [type, direction]
}

function rotate(degrees) {
  if (shift) {
    degrees = degrees / 18
    currentRotation += degrees
  } else {
    if (currentRotation % 90 != 0) {
      while (currentRotation % 90 != 0) { currentRotation += degrees / 90; }
    } else {
      currentRotation += degrees
    }
  }
  
  return currentRotation
}

document.getElementById("ImageExpander").style.top = "0px";
document.getElementById("ImageExpander").style.left = "0px";

function flipRotate(action) {
  if (action == "horizontalFlip") {
    var horFlip = flip("hor");
    horizontalFlip = horFlip[0]
    horizontalDirection = horFlip[1]
  } else if (action == "verticalFlip") {
    var verFlip = flip("ver");
    verticalFlip = verFlip[0]
    verticalDirection = verFlip[1]
  } else if (action == "stretchHorizontalFlip") {
    horFlip = flip("horS");
    horizontalFlip = horFlip[0]
    horizontalDirection = horFlip[1]
  } else if (action == "stretchVerticalFlip") {
    verFlip = flip("verS");
    verticalFlip = verFlip[0]
    verticalDirection = verFlip[1]
  } else if (action == "rotate") {
    if (horizontalFlip * verticalFlip < 0) { currentRotation = rotate(-90);
    } else { currentRotation = rotate(90); }
  } else if (action == "reverseRotate") {
    if (horizontalFlip * verticalFlip < 0) { currentRotation = rotate(90);
    } else { currentRotation = rotate(-90); }
  } else if (action == "blur") {
    if (shift) { blur += 10;
    } else if (blur >= 10) { blur = 0 } else { blur = 10 }
  } else if (action == "invert") {
    if (invert >= 10) { invert = 0 } else { invert = 100 }
  } else if (action == "sepia") {
    if (sepia >= 10) { sepia = 0 } else { sepia = 100 }
  } else if (action == "grayscale") {
    if (grayscale >= 10) { grayscale = 0 } else { grayscale = 100 }
  } else if (action == "hueRotate") {
    if (shift) { hueRotate -= 10 } else { hueRotate += 10 }
  } else if (action == "fixSize") {
    if (fixed) {
      document.getElementById("ImageExpander").style.width = "100%";
      document.getElementById("ImageExpander").style.height = "100%";
      document.getElementById("ImageExpander").style.top = "0px";
      document.getElementById("ImageExpander").style.left = "0px";
      fixed = false;
    }
    else {
      document.getElementById("ImageExpander").style.width = document.getElementById("ImageExpander").getBoundingClientRect().width + "px";
      document.getElementById("ImageExpander").style.height = document.getElementById("ImageExpander").getBoundingClientRect().height + "px";
      fixed = true;
    };
  } else if (action == "increaseSize") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width + increaseSpeed) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height + increaseSpeed) + "px";
      } else {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width + increaseSpeed * 15) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height + increaseSpeed * 15) + "px";
      }
    };
  } else if (action == "decreaseSize") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width - increaseSpeed) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height - increaseSpeed) + "px";
      } else {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width - increaseSpeed * 15) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height - increaseSpeed * 15) + "px";
      }
    };
  } else if (action == "veryIncreaseSize") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width * 1.1) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height * 1.1) + "px";
      } else {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width * 2) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height * 2) + "px";
      }
    };
  } else if (action == "veryDecreaseSize") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width / 1.1) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height / 1.1) + "px";
      } else {
        document.getElementById("ImageExpander").style.width = (document.getElementById("ImageExpander").getBoundingClientRect().width / 2) + "px";
      document.getElementById("ImageExpander").style.height = (document.getElementById("ImageExpander").getBoundingClientRect().height / 2) + "px";
      }
    };
  } else if (action == "moveLeft") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.left = (parseInt(document.getElementById("ImageExpander").style.left.replace("px", "")) + increaseSpeed) + "px";
      } else {
        document.getElementById("ImageExpander").style.left = (parseInt(document.getElementById("ImageExpander").style.left.replace("px", "")) + increaseSpeed * 15) + "px";
      }
    };
  } else if (action == "moveRight") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.left = (parseInt(document.getElementById("ImageExpander").style.left.replace("px", "")) - increaseSpeed) + "px";
      } else {
        document.getElementById("ImageExpander").style.left = (parseInt(document.getElementById("ImageExpander").style.left.replace("px", "")) - increaseSpeed * 15) + "px";
      }
    };
  } else if (action == "moveUp") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.top = (parseInt(document.getElementById("ImageExpander").style.top.replace("px", "")) + increaseSpeed) + "px";
      } else {
        document.getElementById("ImageExpander").style.top = (parseInt(document.getElementById("ImageExpander").style.top.replace("px", "")) + increaseSpeed * 15) + "px";
      }
    };
  } else if (action == "moveDown") {
    if (fixed) {
      if (shift) {
        document.getElementById("ImageExpander").style.top = (parseInt(document.getElementById("ImageExpander").style.top.replace("px", "")) - increaseSpeed) + "px";
      } else {
        document.getElementById("ImageExpander").style.top = (parseInt(document.getElementById("ImageExpander").style.top.replace("px", "")) - increaseSpeed * 15) + "px";
      }
    };
  } else if (action == "shiftFirst") { increaseSpeed = 1;
  } else if (action == "shiftSecond") { increaseSpeed = 3;
  } else if (action == "shiftThird") { increaseSpeed = 10;
  } else if (action == "shiftFourth") { increaseSpeed = 25;
  } else if (action == "shiftFifth") { increaseSpeed = 100;
  } else if (action == "reset") {
    horizontalFlip = 1;
    verticalFlip = 1;
    currentRotation = 0;
    blur = 0;
    sepia = 0;
    invert = 0;
    grayscale = 0;
    hueRotate -= hueRotate % 360;
  }

  // Apply transformations to image
  img.style.transform = 'scaleX(' + horizontalFlip + ') scaleY(' + verticalFlip + ') rotate(' + currentRotation + 'deg)';
  imgCover.style.backdropFilter = 'blur(' + blur + 'px)' + ' invert(' + invert + '%)' + ' sepia(' + sepia + '%)' + ' grayscale(' + grayscale + '%)' + ' hue-rotate(' + hueRotate + 'deg)';
}