export default class PaintStroke {
    constructor(p5, points, duration, fromColour, toColour) {
        this.p = p5;
        this.points = points; 
        this.fromColour = this.p.color(fromColour);
        this.toColour = this.p.color(toColour);
        this.index = 0;
        this.lifetime = parseInt(duration * 1000);
        this.hasInitiated = false;
        this.hasCompleted = false;
    }

    update() {
        if(this.hasCompleted){
            this.draw(this.points.length);
        }
        else if(!this.hasInitiated){
            const self = this;
            for (let i = 0; i < this.points.length; i++) {
                setTimeout(
                    function () {
                        self.draw(i);
                    },
                    (3 * i)
                );
            }
            this.hasInitiated = true;
        }
    }

    draw(numOfLoops) {
        let distance = 10;
        let spring = 0.5;
        let friction = 0.5;
        let size = 25;
        let diff = size / 8;
        let x = this.points[0].x,
            y = this.points[0].y,
            ax = 0,
            ay = 0, 
            a = 0,
            r = 0;

        if(numOfLoops === (this.points.length - 1)) {
            this.hasCompleted = true;
        }

        for (let i = 3; i < numOfLoops; i++) {
            const stroke = this.p.lerpColor(this.fromColour, this.toColour, (1 / this.points.length * i) );
            this.p.stroke(stroke);
            let oldR = r;
                ax += ( this.points[i].x - x ) * spring;
                ay += ( this.points[i].y - y ) * spring;
                ax *= friction; 
                ay *= friction;
                a += this.p.sqrt( ax*ax + ay*ay ) - a;
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
                    this.p.strokeWeight( oldR + diff );
                    this.p.line( x, y, oldX, oldY );
                    this.p.strokeWeight( oldR );
                    this.p.line( x+diff*2, y+diff*2, oldX+diff*2, oldY+diff*2 );
                    this.p.line( x-diff, y-diff, oldX-diff, oldY-diff );
                }
        }
    }
}