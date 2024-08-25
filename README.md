
# eSOM - simple and modern Self-Organizing Maps (SOM)

- [Download v0.3.0 (windows installer)][1]

<img alt="eSOM Logo" src="https://github.com/DuarteGSilva/eSOM/blob/main/img/eSOM_logo.png?raw=true" width=256/>

## Description

This app, made with the [ElectronJS Framework][1] was originally a more modern approach for training, using and testing Kohonen Neural Networks or Self-Organizing Maps for use in chem-informatics, but can be used in any relevant context in order to utilize the power of these special networks.

## Tutorial

### Getting Started

The app is very straightforward to use, start by downloading the installer above (or running the code in this repository with electron). There are only two screens to this app, the "home screen" and the "SOM screen", you will start in the home screen on app launch, from there you can only quit the app, go to the SOM screen or open Chrome Dev Tools (might be helpful for debugging if you know what you are doing). You can go to the SOM screen by clicking on "Self Organizing Map" which is where most of the app's features lie.

NOTE: The installer is made with electron and when run installs the app to `%APPDATA%/../Local/esom`, you then need to go there and create a desktop shortcut manually, or run it from there.

### Data

Before you do anything else you need data, if you don't have any yet you can test the app using the *[provided example data][3]*. If you have some data you want to train a network on, make sure it is formatted like in these files. 

NOTE: The data ***does NOT need to be normalized*** as the network normalizes it for you using a z-normalization algorithm.

### Training a SOM

To train a SOM with this app is very simple (provided your data is well formatted), just open the file by clicking on "Load Training Data" and then click "Train Network" (Note: you might want to click on "Paint Network" after training it to see a better picture of the network in question). 

You can however customize the training with a set of parameters which I'm not gonna explain here, to change these click on "Network Options".

#### Algorithms

This app features **two algorithms** for training SOMs. The traditional one is found anywhere referencing SOMs, but the experimental one was coded by me while trying to over-optimize the traditional one.  
This new algorithm is ***roughly 20x faster*** or close to that. So what the traditional algorithm does in ~300 epochs this one can (and will only) do in ~15 (as if you let it run for too many epochs it gliches producing no significant map).

### Testing a SOM

Once again, very simple, just click on "Map Objects" and select the test file, the graphic will show where each object would have "landed" on the map, along with what color it was supposed to be, and at the bottom the percentage of matches between the supposed/actual color.

### Saving/Loading a Network

Couldn't be more straightforward, save a network anytime by clicking on the button with the same name and load it by selecting the .json file you created by saving it. There is also an example file for a saved network *[here][3]*.

### Disclaimer

This app is in an unfinished state. So while the descriptors page works as far as I have tested it there might be bugs within it and the other pages are not done at all (with the exception of the descriptors one which has a start in it's own branch that wil only be merged when in a more "complete" state).

##


[1]: <https://www.dropbox.com/scl/fi/1k72so5sq5wd58ibypfc2/eSOM-0.3.0-Setup.exe?rlkey=y8q3k1bdth47a507ir7fw77yr&st=gkmk62ub&dl=0> "'eSOM-v0.3.0 Setup.exe' Download"
[2]: <https://www.electronjs.org/> "electronjs.org"
[3]: <https://github.com/DuarteGSilva/eSOM/tree/main/example%20data> "Example Data - github"
