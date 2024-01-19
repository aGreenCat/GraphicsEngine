import Matrix from './matrix.js';
import Screen from './display.js';
import fs from 'fs';

const scriptFile = './script';

let iter = -1;
function nextFileName() {
    iter++;
    return iter + '.png';
}

//Lighting

const A = {r: 30, g: 200, b:140};
const P = {r: 30, g: 200, b:140};

const lightPos = [500, 700, 300];

const k_a = {r: 0.1, g: 0.1, b: 0.1}
const k_d = {r: 0.6, g: 0.6, b: 0.6}
const k_s = {r: 0.6, g: 0.6, b: 0.6}

function parse(file) {
    const data = fs.readFileSync(file, {encoding: 'utf-8'});
    let lines = data.split("\r\n").map(line => line.trim());

    var s = new Screen();

    var edges = new Matrix();
    var surfaces = new Matrix();

    var csstack = [];
    let initcs = new Matrix();
    initcs.ident();
    csstack.push(initcs);

    const parametric = (fx, fy, fz, options) => {
        let steps = options.steps || 100;
        let mtrx = options.matrix || edges;

        let x0 = fx(0);
        let y0 = fy(0);
        let z0 = fz(0);
        let x1, y1, z1;

        for (let t = 1; t <= steps; t++) {
            x1 = fx(t/steps);
            y1 = fy(t/steps);
            z1 = fz(t/steps);
            mtrx.addEdge(x0, y0, z0, x1, y1, z1);
            x0 = x1;
            y0 = y1;
            z0 = z1;
        }
    }

    const toRadian = (t) => {
        return t * 2 * Math.PI;
    }

    const warn = (args, numargs) => {
        if (args.length != numargs) {
            throw(`Line ${i+1}: line expects ${numargs} arguments`);
        }
    } 


    const commands = {
        'clear': () => { //obsolete
            s = new Screen();

            edges.clear();
            surfaces.clear();
        },
        'push': () => {
            let temp = new Matrix();
            temp.copy(csstack[csstack.length-1]);
            csstack.push(temp);
        },
        'pop': () => {
            csstack.pop();
        },
        'line': args => {
            warn(args, 6);
            edges.addEdge(...args);

            edges.mult(csstack[csstack.length-1]);
            edges.drawEdges(s, {r: 0, g: 255, b:0});
            edges.clear();
        },
        'circle': args => {
            warn(args, 4);

            let [cx, cy, cz, r] = args;

            parametric(
                t => cx + r*Math.cos(toRadian(t)), 
                t => cy + r*Math.sin(toRadian(t)), 
                t => cz
            );

            edges.mult(csstack[csstack.length-1]);
            edges.drawEdges(s, {r: 0, g: 255, b:0});
            edges.clear();
        },
        'hermite': args => {
            warn(args, 8);

            let coefx = new Matrix();
            coefx.addColumn(...args.filter((v, i) => i % 2 == 0));
            let coefy = new Matrix();
            coefy.addColumn(...args.filter((v, i) => i % 2 == 1));

            let h = new Matrix();
            h.hermite();
            coefx.mult(h);

            h = new Matrix();
            h.hermite();
            coefy.mult(h);

            coefx = coefx.matrix.map(ar => ar[0]);
            coefy = coefy.matrix.map(ar => ar[0]);

            parametric(
                t => coefx[0]*((t)**3) + coefx[1]*((t)**2) + coefx[2]*(t) + coefx[3], 
                t => coefy[0]*((t)**3) + coefy[1]*((t)**2) + coefy[2]*(t) + coefy[3], 
                t => 0
            );

            edges.mult(csstack[csstack.length-1]);
            edges.drawEdges(s, {r: 0, g: 255, b:0});
            edges.clear();
        },
        'bezier': args => {
            warn(args, 8);

            let coefx = new Matrix();
            coefx.addColumn(...args.filter((v, i) => i % 2 == 0));
            let coefy = new Matrix();
            coefy.addColumn(...args.filter((v, i) => i % 2 == 1));
            
            let h = new Matrix();
            h.bezier();
            coefx.mult(h);

            h = new Matrix();
            h.bezier();
            coefy.mult(h);

            coefx = coefx.matrix.map(ar => ar[0]);
            coefy = coefy.matrix.map(ar => ar[0]);

            parametric(
                t => coefx[0]*((t)**3) + coefx[1]*((t)**2) + coefx[2]*(t) + coefx[3], 
                t => coefy[0]*((t)**3) + coefy[1]*((t)**2) + coefy[2]*(t) + coefy[3], 
                t => 0
            );

            edges.mult(csstack[csstack.length-1]);
            edges.drawEdges(s, {r: 0, g: 255, b:0});
            edges.clear();
        },
        'box': args => {
            warn(args, 6);

            let [x, y, z, w, h, d] = args;

            surfaces.addPolygon(x, y, z, x, y-h, z, x+w, y-h, z);
            surfaces.addPolygon(x, y, z, x+w, y-h, z, x+w, y, z);

            surfaces.addPolygon(x+w, y, z, x+w, y-h, z, x+w, y-h, z-d);
            surfaces.addPolygon(x+w, y, z, x+w, y-h, z-d, x+w, y, z-d);

            surfaces.addPolygon(x+w, y, z-d, x+w, y-h, z-d, x, y-h, z-d);
            surfaces.addPolygon(x+w, y, z-d, x, y-h, z-d, x, y, z-d);

            surfaces.addPolygon(x, y, z-d, x, y-h, z-d, x, y-h, z,);
            surfaces.addPolygon(x, y, z-d, x, y-h, z, x, y, z);

            surfaces.addPolygon(x, y, z-d, x, y, z, x+w, y, z);
            surfaces.addPolygon(x, y, z-d, x+w, y, z, x+w, y, z-d);

            surfaces.addPolygon(x, y-h, z, x, y-h, z-d, x+w, y-h, z-d);
            surfaces.addPolygon(x, y-h, z, x+w, y-h, z-d, x+w, y-h, z);

            surfaces.mult(csstack[csstack.length-1])
            surfaces.drawPolygons(s, A, P, ...lightPos, k_a, k_d, k_s);
            surfaces.clear();
        },
        'sphere': args => {
            warn(args, 4);

            let [cx, cy, cz, r] = args;

            let sphereSteps = 100;
            let spherePoints = new Matrix();

            let test = 0;
            for (let j = 0; j <= sphereSteps; j++) {
                let phi = toRadian(j/(sphereSteps));

                let [fx, fy, fz] = [
                    t => cx + r*Math.cos(toRadian(t)/2), 
                    t => cy + r*Math.sin(toRadian(t)/2)*Math.cos(phi), 
                    t => cz + r*Math.sin(toRadian(t)/2)*Math.sin(phi)
                ];

                
                for (let t = 0; t <= sphereSteps; t++) {
                    let smallt = t/(sphereSteps);
                    let x = fx(smallt);
                    let y = fy(smallt);
                    let z = fz(smallt);
                    spherePoints.addPoint(x, y, z);
                }
            }

            for (let j = 0; j < (sphereSteps**2)+sphereSteps; j++) {
                if (j % (sphereSteps+1) == 0) {
                    //pole one
                    surfaces.addPolygon(...spherePoints.getPoint(j), ...spherePoints.getPoint(j+1), ...spherePoints.getPoint(j+(sphereSteps+1)+1));
                } else if (j % (sphereSteps+1) == sphereSteps-1) {
                    //pole two
                    surfaces.addPolygon(...spherePoints.getPoint(j), ...spherePoints.getPoint(j+1), ...spherePoints.getPoint(j+(sphereSteps+1)));
                } else if (j % (sphereSteps+1) != sphereSteps) {
                    surfaces.addPolygon(...spherePoints.getPoint(j), ...spherePoints.getPoint(j+1), ...spherePoints.getPoint(j+(sphereSteps+1)));
                    surfaces.addPolygon(...spherePoints.getPoint(j+1), ...spherePoints.getPoint(j+1+(sphereSteps+1)), ...spherePoints.getPoint(j+(sphereSteps+1)));
          
                }
            }

            surfaces.mult(csstack[csstack.length-1])
            surfaces.drawPolygons(s, A, P, ...lightPos, k_a, k_d, k_s);
            surfaces.clear();
        },
        'torus': args => {
            warn(args, 5);
            
            let [cx, cy, cz, r, R] = args;

            let torusSteps = 100;
            let torusPoints = new Matrix();

            for (let j = 0; j <= torusSteps; j++) {
                let phi = toRadian(j/torusSteps);

                let [fx, fy, fz] = [
                    t => cx + (R + r*Math.cos(toRadian(t)))*Math.cos(phi), 
                    t => cy + r*Math.sin(toRadian(t)), 
                    t => cz - (R + r*Math.cos(toRadian(t)))*Math.sin(phi)
                ];

                
                for (let t = 0; t <= torusSteps; t++) {
                    let smallt = t/torusSteps;
                    let x = fx(smallt);
                    let y = fy(smallt);
                    let z = fz(smallt);
                    torusPoints.addPoint(x, y, z);
                }
            }

            for (let j = 0; j <= (torusSteps+1)**2; j++) {
                if (j % (torusSteps+1) != torusSteps) {
                    surfaces.addPolygon(...torusPoints.getPoint(j), ...torusPoints.getPoint(j+(torusSteps+1)+1), ...torusPoints.getPoint(j+1));
                    surfaces.addPolygon(...torusPoints.getPoint(j), ...torusPoints.getPoint(j+(torusSteps+1)), ...torusPoints.getPoint(j+(torusSteps+1)+1));
                }
            }

            surfaces.mult(csstack[csstack.length-1])
            surfaces.drawPolygons(s, A, P, ...lightPos, k_a, k_d, k_s);
            surfaces.clear();
        },
        'ident': () => { //obsolete
            transform.ident();
        },
        'scale': args => {
            warn(args, 3);

            let a = new Matrix();
            a.scale(...args);
            a.mult(csstack[csstack.length-1])
            csstack[csstack.length-1] = a;
        },
        'move': args => {
            warn(args, 3);

            let a = new Matrix();
            a.translate(...args);
            a.mult(csstack[csstack.length-1])
            csstack[csstack.length-1] = a;
        },
        'rotate': args => {
            warn(args, 2);

            let a = new Matrix();
            a.rotate(...args);
            a.mult(csstack[csstack.length-1]);
            csstack[csstack.length-1] = a;
        },
        'apply': () => {//obsolete
            edges.mult(transform);
            surfaces.mult(transform);
        },
        'display': () => {
            let name = nextFileName();
            commands['save'](name);
            console.log(`No display available, please view at ${name}`)
        },
        'save': args => {
            s.savePNG(args);
        }
    }

    for (var i = 0; i < lines.length; i++) {
        let cmd = lines[i];

        if (cmd == "" || cmd.charAt(0) == '#') {
            continue;
        }
        if (!commands[cmd]) {
            throw(`Line ${i+1}: "${cmd}" is not a command.`);
        }

        let param = lines[i+1];

        if (!!param && !commands.hasOwnProperty(param)) {
            param = param.split(' ');
            i++; //corrects line number in arg error msgs

            param = param.map(value => {
                if (Number.isNaN((parseFloat(value)))) {
                    return value
                } else {
                    return parseFloat(value);
                }
                
            });
            commands[cmd](param);
        } else {
            commands[cmd]();
        }
    }
}

parse(scriptFile);