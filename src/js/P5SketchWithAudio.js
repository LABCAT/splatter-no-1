import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';
import PaintStroke from './classes/PaintStroke';

import audio from "../audio/splatter-no-1.ogg";
import midi from "../audio/splatter-no-1.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.splatterCanvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    const noteSet1 = result.tracks[5].notes; // Thor 2 Copy - Comsmo Bass 2
                    const noteSet2 = result.tracks[9].notes; // Thor 2 Copy - Super Velo Brass
                    const noteSet3 = result.tracks[6].notes.filter(note => note.midi !== 43); // Kong 1 - Sparkle
                    const noteSet4 = result.tracks[8].notes; // Thor 2 - Anime Melody
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.scheduleCueSet(noteSet3, 'executeCueSet3');
                    p.scheduleCueSet(noteSet4, 'executeCueSet4');
                    p.audioLoaded = true;
                    document.getElementById("loader").classList.add("loading--complete");
                    document.getElementById("play-icon").classList.remove("fade-out");
                }
            );
            
        }

        p.preload = () => {
            p.song = p.loadSound(audio, p.loadMidi);
            p.song.onended(p.logCredits);
        }

        p.scheduleCueSet = (noteSet, callbackName, poly = false)  => {
            let lastTicks = -1,
                currentCue = 1;
            for (let i = 0; i < noteSet.length; i++) {
                const note = noteSet[i],
                    { ticks, time } = note;
                if(ticks !== lastTicks || poly){
                    note.currentCue = currentCue;
                    p.song.addCue(time, p[callbackName], note);
                    lastTicks = ticks;
                    currentCue++;
                }
            }
        } 

        p.backgroundColour = 0;

        p.strokes = [];

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.splatterCanvas = p.createGraphics(p.canvasWidth, p.canvasHeight);
            p.paintStrokeCanvas = p.createGraphics(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.background(p.backgroundColour);
            p.noLoop();

            for (let i = 0; i < 66; i++) {
                p.strokes.push(
                    {
                        points: p.generatePoints()
                    }
                );
            }
        }

        p.draw = () => {
            if(p.audioLoaded && p.song.isPlaying()){
                p.background(p.backgroundColour);
                p.image(p.splatterCanvas, 0, 0);
                p.image(p.paintStrokeCanvas, 0, 0);
            }
        }

        p.executeCueSet1 = (note) => {
            const { currentCue } = note, 
                x = p.random(0, p.width),
                y = p.random(0, p.height),
                divisors = [];
            if(currentCue < 152) {
                if (currentCue % 23 === 1) {
                    p.splatterCanvas.clear();
                }


                for (let i = 0; i < 1080; i++) {
                    divisors.push(p.random(2,200));
                }
                p.splatter(
                    x, 
                    y, 
                    p.random(p.height / 4, p.height / 8), 
                    divisors, 
                    p.color(p.random(0, 360), 100, 100)
                );
                p.redraw();
            }
        }

        p.strokesIndex = 0;

        p.executeCueSet2 = (note) => {
            const { currentCue, duration } = note,
                points = p.strokes[p.strokesIndex].points,
                delayAmount = duration / 2 * 1000 / points.length,
                paintStroke = new PaintStroke(
                    p.paintStrokeCanvas,
                    p.strokes[p.strokesIndex].points,
                    duration,
                    p.color(p.random(360), 100, 100),
                    p.color(p.random(360), 100, 100)
                );

            if (currentCue % 11 === 1) {
                p.paintStrokeCanvas.clear();
            }

            for (let i = 0; i < points.length; i++) {
                setTimeout(
                    function () {
                        paintStroke.draw(i);
                        p.redraw();
                    },
                    (delayAmount * i)
                );
            }
            p.strokesIndex++;
        }
        
        p.executeCueSet3 = (note) => {
            const { currentCue, ticks } = note;
            if((ticks / p.PPQ) % 4 === 2) {
                p.backgroundColour = p.color(
                    p.random(360), 
                    p.random(100), 
                    p.random(100)
                );
            }
            p.redraw();
            if([1, 21, 51].includes(currentCue)){
                p.backgroundColour = p.color(0, 0, 100);
                p.clear();
                p.splatterCanvas.clear();
                p.paintStrokeCanvas.clear();
            }
        }

        p.executeCueSet4 = (note) => {
            const { currentCue } = note, 
                x = p.random(0, p.width),
                y = p.random(0, p.height),
                divisors = [];

            if (currentCue % 23 === 1) {
                p.splatterCanvas.clear();
            }

            for (let i = 0; i < 1080; i++) {
                divisors.push(p.random(2,200));
            }

            let size = p.random(p.height / 4, p.height / 6), 
                reducer = size / 12, 
                hue = p.random(0, 360);

            for (let i = 0; i < 12; i++) {
                p.splatter(x, y, size, divisors, p.color(hue, 100, 100), true);
                size = size - reducer;
                hue = hue + 15 >= 360 ? hue - 340 : hue + 15;
            }
            p.redraw();
        }

        p.splatter = (x, y, size, divisors, colour, fill = false) => {
            p.splatterCanvas.strokeWeight(1);
            p.splatterCanvas.stroke(colour);
            if(fill) {
                p.splatterCanvas.fill(colour);
            }
            else {
                p.splatterCanvas.noFill();
            }
            p.splatterCanvas.beginShape();
            for (let i = 0; i < 1080; i++) {
                const divisor = divisors[i];
                
                p.splatterCanvas.curveVertex(
                    x + size * Math.cos(i) / divisor, 
                    y + size * Math.sin(i) / divisor
                );
            }
            p.splatterCanvas.endShape();
        }

        p.generatePoints = () => {
            const points = [],
                numOfPoints = p.random(30, 40),
                xMultiplier = p.random(0, 20),
                yMultiplier = p.random(0, 20),
                direction = p.random(['left','right','up','down']);

            let x = p.random(0, p.width),
                y = p.random(0, p.height);
            points.push(
                {
                    "x":x,
                    "y":y
                }
            );

            for (let i = 0; i < numOfPoints; i++) {
                const noiseX = p.noise(i, 0) * xMultiplier;
                const noiseY = p.noise(0, i) * yMultiplier;
                switch (direction) {
                    case 'left':
                        x = x - noiseX;
                        y = y - noiseY;
                        break;
                    case 'right':
                        x = x + noiseX;
                        y = y + noiseY;
                        break;
                    case 'up':
                        x = x + noiseX;
                        y = y - noiseY;
                        break;
                    case 'down':
                        x = x - noiseX;
                        y = y + noiseY;
                        break;
                    default:
                        break;
                }
                
                points.push(
                    {
                        "x":x,
                        "y":y
                    }
                );
            }
            return points;
        }

        p.mousePressed = () => {
            if(p.audioLoaded){
                if (p.song.isPlaying()) {
                    p.song.pause();
                } else {
                    if (parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)) {
                        p.reset();
                    }
                    document.getElementById("play-icon").classList.add("fade-out");
                    p.canvas.addClass("fade-in");
                    p.song.play();
                }
            }
        }

        p.creditsLogged = false;

        p.logCredits = () => {
            if (
                !p.creditsLogged &&
                parseInt(p.song.currentTime()) >= parseInt(p.song.buffer.duration)
            ) {
                p.creditsLogged = true;
                    console.log(
                    "Music By: http://labcat.nz/",
                    "\n",
                    "Animation By: https://github.com/LABCAT/"
                );
                p.song.stop();
            }
        };

        p.reset = () => {

        }

        p.updateCanvasDimensions = () => {
            p.canvasWidth = window.innerWidth;
            p.canvasHeight = window.innerHeight;
            p.canvas = p.resizeCanvas(p.canvasWidth, p.canvasHeight);
        }

        if (window.attachEvent) {
            window.attachEvent(
                'onresize',
                function () {
                    p.updateCanvasDimensions();
                }
            );
        }
        else if (window.addEventListener) {
            window.addEventListener(
                'resize',
                function () {
                    p.updateCanvasDimensions();
                },
                true
            );
        }
        else {
            //The browser does not support Javascript event binding
        }
    };

    useEffect(() => {
        new p5(Sketch, sketchRef.current);
    }, []);

    return (
        <div ref={sketchRef}>
            <PlayIcon />
        </div>
    );
};

export default P5SketchWithAudio;
