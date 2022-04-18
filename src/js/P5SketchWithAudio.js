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
            if(p.audioLoaded && p.song.isPlaying()){
                p.background(p.backgroundColour);
                for (let i = 0; i < p.splatters.length; i++) {
                    const splatter = p.splatters[i], 
                        {x, y, size, divisors, colour} = splatter;

                    p.splatter(x, y, size, divisors, colour);
                    
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

        p.executeCueSet3 = (note) => {
            p.paintStroke();
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

                if(Math.random() < 0.2) {
                    
                    // p.fill(
                    //     colour[0],
                    //     colour[1],
                    //     colour[2],
                    //     p.random(193)
                    // );
                    // p.ellipse(
                    //     x + size * Math.cos(i) / (divisor / p.random(1, 1.1)), 
                    //     y + size * Math.sin(i) / (divisor / p.random(1, 1.1)),
                    //     size / 50,
                    //     size / 50
                    // );
                }
            }
            p.endShape();
        }

        p.paintStroke = () => {
            const origin = p.createVector(p.random(0, p.width), p.random(0, p.height)),
                destination = p.createVector(p.random(0, p.width), p.random(0, p.height)),
                segments = 6, 
                points = [{x: origin.x, y: origin.y}];
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
            let x = 0,
                y = 0, 
                ax = 0,
                ay = 0, 
                a = 0,
                r = 0,
                f = 0;

            for (let i = 1; i < 100; i++) {
                let scale = p.min(1, (i - 1) / 99),
                    dist = window.p5.Vector.sub(destination, origin).mult(i/10),
                    pos = window.p5.Vector.add(origin, dist);
                let oldR = r;
                if(!f) {
                    f = 1;
                    x = pos.x;
                    y = pos.y;
                }
                ax += ( pos.x - x ) * spring;
                ay += ( pos.y - y ) * spring;
                ax *= friction;
                ay *= friction;
                a += p.sqrt( ax*ax + ay*ay ) - a;
                a *= 0.6;
                r = size - a;
                
                for(let i = 0; i < distance; ++i ) {
                    let oldX = x;
                    let oldY = y;
                    x += ax / distance;
                    y += ay / distance;
                    oldR += ( r - oldR ) / distance;
                    if(oldR < 1) {
                        oldR = 1;
                    }
                    p.stroke('white');
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
