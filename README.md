# Tic Tac Toe Pro Printing Utility

## Introduction
"Tic Tac Toe Pro" is a magic effect produced by Bond Lee. Printing images to customize it always seemd more difficult than it needed to be.  So, I created a utility for my own use to make it easier. I thought I'd share it in case other people might find it useful.

Plese be aware, I am not affiliated with Bond Lee, the creator of this effect. I'm just a performer who uses it. So, if you're looking for information about how it works, how to perfom it, where to get it, you won't find it here. However, if you're an authorized user who'd like an easier way to print customized images, this could be what you're looking for.

Simply select size of your Tic Tac Toe Pro and provide the image you wish to use. Print it out directly from your browser. It will print one square per page. If you're using the stage size, each square will be split across two pages for pringing on letter size paper. (Or A4, if that's your thing.) Just cut them out, attach them, and you're good to go.

## Demo
Want to try it out? Just go here: https://magicalbrad.github.io/tictactoe/

## Usage
This utility was designed and tested using the Chrome browser, but it should work in any modern browser.

First, select the size you are using, Parlor or Stage.

Then, click the "Choose File" button and select your desired file. The image should be JPEG, PNG, or GIF format. Ideally, you should use a square image, large enough for pringing at your desired size. The image will be automatically scaled to fit, but a small image won't look good printed at a large size. Ideally, I'd recommend a minimum of 2303x2303 pixels for parlor size, or 4429x44429 pixels for stage size.

Finally, click print.

### Settings
There are a few settings you can adjust. Click on "Settings" to open the settings panel.

#### Max Printed Width
This controls the maximum width that will appear on any printed page, in centimeters. If the square is larger than this amount, it will be divided and printed across two pages. The default value of 15cm should work well for letter or A4 paper. If you are printing on sufficiently large paper, such as 11x17, you can set this to 25cm to allow stage size squares to be printed on a single page.

#### Overlap
When a square is split across two pages, this value controls the amount the two pieces will overlap where they meet. You can set it to 0cm, if you wish to have no overlap.

#### Background
This is the background color for the image. It will only be visible if the image you are using is not square or has transparent areas. If you change the background color, you will need to reload your image to see the change.

### Offline Use
The utility will always be available here: https://magicalbrad.github.io/tictactoe/

If you wish to be able to use it without being connected to the internet, copy all the source files to a directory on your computer. Open the index.html file in your browser. All processing happens in the browser, so no internet connection is required.
