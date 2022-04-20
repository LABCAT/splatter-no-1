import React, { useRef, useEffect } from "react";
import "./helpers/Globals";
import "p5/lib/addons/p5.sound";
import * as p5 from "p5";
import { Midi } from '@tonejs/midi'
import PlayIcon from './functions/PlayIcon.js';

import audio from "../audio/splatter-no-1.ogg";
import midi from "../audio/splatter-no-1.mid";

const P5SketchWithAudio = () => {
    const sketchRef = useRef();

    const Sketch = p => {

        p.canvas = null;

        p.canvasWidth = window.innerWidth;

        p.canvasHeight = window.innerHeight;

        p.audioLoaded = false;

        p.player = null;

        p.PPQ = 3840 * 4;

        p.loadMidi = () => {
            Midi.fromUrl(midi).then(
                function(result) {
                    console.log(result);
                    const noteSet1 = result.tracks[5].notes; // Thor 2 Copy - Comsmo Bass 2
                    const noteSet2 = result.tracks[9].notes; // Thor 2 Copy - Super Velo Brass
                    const noteSet3 = result.tracks[6].notes.filter(note => note.midi !== 43); // Kong 1 - Sparkle
                    p.scheduleCueSet(noteSet1, 'executeCueSet1');
                    p.scheduleCueSet(noteSet2, 'executeCueSet2');
                    p.scheduleCueSet(noteSet3, 'executeCueSet3');
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

        p.setup = () => {
            p.canvas = p.createCanvas(p.canvasWidth, p.canvasHeight);
            p.colorMode(p.HSB);
            p.background(p.backgroundColour);
            p.noLoop();
        }

        p.draw = () => {
            p.paintStroke();
            if(p.audioLoaded && p.song.isPlaying()){
                p.background(p.backgroundColour);
                for (let i = 0; i < p.splatters.length; i++) {
                    const splatter = p.splatters[i], 
                        {x, y, size, divisors, colour} = splatter;
                    p.splatter(x, y, size, divisors, colour);
                }

                for (let i = 0; i < p.strokes.length; i++) {
                    const stroke = p.strokes[i], 
                        { origin, destination } = stroke;
                    p.paintStroke(origin, destination);
                }
            }
        }

        p.splatters = [];

        p.executeCueSet1 = (note) => {
            const { currentCue } = note, 
                x = p.random(0, p.width),
                y = p.random(0, p.height),
                divisors = [];

            if (currentCue % 23 === 1) {
                p.splatters = [];
            }


            for (let i = 0; i < 2000; i++) {
                divisors.push(p.random(2,200));
            }

            p.splatters.push(
                {
                    x: x,
                    y: y,
                    size: p.height / 8 * p.random(1.2, 1.5),
                    divisors: divisors,
                    colour: p.color(p.random(360), 100, 100),
                }
            );
            p.redraw();
        }

        p.executeCueSet2 = (note) => {
            const { durationTicks } = note;

            if(durationTicks > 8000) {
                p.backgroundColour = p.color(
                    p.random(360), 
                    p.random(100), 
                    p.random(100)
                );
                p.redraw();
            }
        }

        p.strokes = [];

        p.executeCueSet3 = (note) => {
            p.strokes.push(
                {
                    origin: p.createVector(p.random(0, p.width), p.random(0, p.height)),
                    destination: p.createVector(p.random(0, p.width), p.random(0, p.height)),
                }
            );
            p.redraw();
        }

        p.splatter = (x, y, size, divisors, colour) => {
            // p.noFill();
            p.strokeWeight(1);
            p.stroke(colour);
            p.fill(
                colour._getHue(),
                colour._getSaturation(),
                colour._getBrightness(),
                1
            );
            p.beginShape();
            for (let i = 0; i < 2000; i++) {
                const divisor = divisors[i];
                
                p.curveVertex(
                    x + size * Math.cos(i) / divisor, 
                    y + size * Math.sin(i) / divisor
                );
            }
            p.endShape();
        }

        p.paintStroke = (origin = '', destination = '') => {
            // const origin = p.createVector(p.random(0, p.width), p.random(0, p.height)),
            //     destination = p.createVector(p.random(0, p.width), p.random(0, p.height)),
            //     segments = 6, 
            //     points = [{x: origin.x, y: origin.y}];
            // p.beginShape()
            // p.noFill()

            // // Add the first point
            // p.stroke('white')
            // p.strokeWeight(5)
            // p.curveVertex(origin.x, origin.y)
            // p.curveVertex(origin.x, origin.y)  // duplicate start point

            // // Draw line
            // for (let i = 1; i < segments; i++){

            //     // const dist = window.p5.Vector.sub(destination, origin).mult(i)
            //     const point = p.createVector(p.random(origin.x, destination.x), p.random(origin.y, destination.y))

            //     // Add point to curve
            //     p.curveVertex(point.x, point.y);
            //     points.push({x: point.x, y: point .y});

            // }
            // p.vertex(destination.x, destination.y)  // Duplicate ending point
            // p.endShape()
            // points.push({x: destination.x, y: destination.y});
            let distance = 10;
            let spring = 0.5;
            let friction = 0.5;
            let size = 25;
            let diff = size/8;
            const test = [{"x":77,"y":242},{"x":77,"y":242},{"x":77,"y":243},{"x":80,"y":243},{"x":88,"y":243},{"x":102,"y":241},{"x":117,"y":238},{"x":139,"y":234},{"x":172,"y":226},{"x":210,"y":219},{"x":249,"y":213},{"x":287,"y":209},{"x":319,"y":204},{"x":342,"y":201},{"x":358,"y":196},{"x":366,"y":193},{"x":369,"y":190}] 
            let x = test[0].x,
                y = test[0].y,
                ax = 0,
                ay = 0, 
                a = 0,
                r = 0,
                f = 0;

            
            p.stroke(0, 0, 100);
            for (let i = 3; i < test.length; i++) {
                let oldR = r;
                ax += ( test[i].x - x ) * spring;
                ay += ( test[i].y - y ) * spring;
                ax *= friction; 
                ay *= friction;
                a += p.sqrt( ax*ax + ay*ay ) - a;
                a *= 0.6;
                r = size * 1 / i - a;

                
                for(let i = 0; i < distance; ++i ) {
                    let oldX = x;
                    let oldY = y;
                    x += ax / distance;
                    y += ay / distance;
                    oldR += ( r - oldR ) / distance;
                    if(oldR < 1) {
                        oldR = 1;
                    }
                    p.strokeWeight( oldR + diff );
                    p.line( x, y, oldX, oldY );
                    p.strokeWeight( oldR );
                    p.line( x+diff*2, y+diff*2, oldX+diff*2, oldY+diff*2 );
                    p.line( x-diff, y-diff, oldX-diff, oldY-diff );
                }
            }
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
