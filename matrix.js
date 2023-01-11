import * as pen from './draw.js';
import Vector from './vector.js';

export default class Matrix {
    constructor() {
        this.clear();
    }

    clear() {
        this.points = 0;
        this.matrix = [[], [], [], []];
    }

    ident() {
        this.points = 4
        this.matrix = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]];
    }

    addEdge(x0, y0, z0, x1, y1, z1) {
        this.addPoint(x0, y0, z0);
        this.addPoint(x1, y1, z1);
    }

    addPoint(x, y, z) {
        this.addColumn(x, y, z, 1);
    }

    addPolygon(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
        this.addPoint(x0, y0, z0);
        this.addPoint(x1, y1, z1);
        this.addPoint(x2, y2, z2);
    }

    getPoint(index) {
        return [this.matrix[0][index], this.matrix[1][index], this.matrix[2][index]];
    }

    addColumn(a, b, c, d) {
        this.points += 1;

        this.matrix[0].push(a);
        this.matrix[1].push(b);
        this.matrix[2].push(c);
        this.matrix[3].push(d);
    }

    toString() {
        let str = '';
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < this.points; c++) {
                str += this.matrix[r][c];
                if (c == this.points-1 && r != 3) {
                    str += '\n';
                } else {
                    str += ' ';
                }
            }
        }

        return str;
    }

    translate(x, y, z) {
        this.ident();
        this.matrix[0][3] = x;
        this.matrix[1][3] = y;
        this.matrix[2][3] = z;
    }

    scale(fx, fy, fz) {
        this.ident();
        this.matrix[0][0] = fx;
        this.matrix[1][1] = fy;
        this.matrix[2][2] = fz;
    }

    rotate(axis, degrees) {
        this.ident();
        let angle = degrees * Math.PI / 180;

        if (axis == 'x') {
            this.matrix[1][1] = Math.cos(angle);
            this.matrix[1][2] = -1*Math.sin(angle);
            this.matrix[2][1] = Math.sin(angle);
            this.matrix[2][2] = Math.cos(angle);
        } else if (axis == 'y') {
            this.matrix[2][2] = Math.cos(angle);
            this.matrix[2][0] = -1*Math.sin(angle);
            this.matrix[0][2] = Math.sin(angle);
            this.matrix[0][0] = Math.cos(angle);
        } else if (axis == 'z') {
            this.matrix[0][0] = Math.cos(angle);
            this.matrix[0][1] = -1*Math.sin(angle);
            this.matrix[1][0] = Math.sin(angle);
            this.matrix[1][1] = Math.cos(angle);
        }
    }

    hermite() {
        this.points = 4
        //is an inverse, mult with points
        this.matrix[0] = [2, -2, 1, 1];
        this.matrix[1] = [-3, 3, -2, -1];
        this.matrix[2] = [0, 0, 1, 0];
        this.matrix[3] = [1, 0, 0, 0];
    }

    bezier() {
        this.points = 4
        this.matrix[0] = [-1, 3, -3, 1];
        this.matrix[1] = [3, -6, 3, 0];
        this.matrix[2] = [-3, 3, 0, 0];
        this.matrix[3] = [1, 0, 0, 0];
    }

    mult(m) {
        if (m.matrix[0].length != this.matrix.length) {
            console.log("Bad multiplication");
            return;
        }
        let newMatrix = [[], [], [], []];

        for (let r = 0; r < m.matrix.length; r++) {
            let replaceRow = [];
            for (let mc = 0; mc < this.points; mc++) {
                let row = m.matrix[r].slice(0);
                row.forEach((element, index) => {
                    row[index] = element * this.matrix[index][mc];
                });
                replaceRow.push(row.reduce((a, b) => a+b));
            }
            newMatrix[r] = replaceRow;
        }
        this.matrix = newMatrix;
        this.points = this.matrix[0].length;
    }

    drawEdges(s, c) {
        pen.setColor(c.r, c.g, c.b);

        for (let i = 0; i < this.points; i+=2) {
            pen.drawLine(this.matrix[0][i], this.matrix[1][i], this.matrix[0][i+1], this.matrix[1][i+1], this.matrix[0][i+2], this.matrix[1][i+2], s);
        }
    }

    drawPolygons(s, A, P, lightx, lighty, lightz, k_a, k_d, k_s) {
        for (let i = 0; i < this.points; i+=3) {

            let [p0, p1, p2] = [
                [this.matrix[0][i], this.matrix[1][i], this.matrix[2][i]], 
                [this.matrix[0][i+1], this.matrix[1][i+1], this.matrix[2][i+1]], 
                [this.matrix[0][i+2], this.matrix[1][i+2], this.matrix[2][i+2]]
            ];

            let R = new Vector(...p1).subtract(new Vector(...p0));
            let S = new Vector(...p2).subtract(new Vector(...p0));

            let N = R.cross(S);
            let V = new Vector(0, 0, 1);
            let L = new Vector(lightx, lighty, lightz).subtract(new Vector((p0[0]+p1[0]+p2[0])/3, (p0[1]+p1[1]+p2[1])/3, (p0[2]+p1[2]+p2[2])/3));

            if (N.dot(V) > 0) {
                L.normalize();
                N.normalize();

                let spec = ((N.scale(2*N.dot(L))).subtract(L).dot(V))**17;

                const lim = (val) => {
                    return Math.max(Math.min(255, val), 0);
                }

                let I = {
                    r: lim(A.r*k_a.r) + lim(P.r*k_d.r*(N.dot(L))) + lim(P.r*k_s.r*spec),
                    g: lim(A.g*k_a.g) + lim(P.g*k_d.g*(N.dot(L))) + lim(P.g*k_s.g*spec),
                    b: lim(A.b*k_a.b) + lim(P.b*k_d.b*(N.dot(L))) + lim(P.b*k_s.b*spec)
                }

                for (let c in I) {
                    I[c] = lim(I[c]);
                }

                pen.setColor(I.r, I.g, I.b);
                //Illuminashunnn

                this.convertScanlines(p0, p1, p2, s);
            }
        }
    }

    convertScanlines(p0, p1, p2, s) {
        let order = [p0, p1, p2].sort((a, b) => a[1] - b[1]).map(coord => [coord[0], Math.floor(coord[1]), coord[2]]);

        let [delx0, delx1, delx2] = [
                                (order[2][0] - order[0][0])/Math.floor(order[2][1] - order[0][1]+1),
                                (order[1][0] - order[0][0])/Math.floor(order[1][1] - order[0][1]+1),
                                (order[2][0] - order[1][0])/Math.floor(order[2][1] - order[1][1]+1)]

        let [delz0, delz1, delz2] = [
                                (order[2][2] - order[0][2])/Math.floor(order[2][1] - order[0][1] + 1),
                                (order[1][2] - order[0][2])/Math.floor(order[1][1] - order[0][1] + 1),
                                (order[2][2] - order[1][2])/Math.floor(order[2][1] - order[1][1] + 1)]                        


        let [x0, x1] = [order[0][0], order[0][0]];
        let y = order[0][1];
        let [z0, z1] = [order[0][2], order[0][2]]

        if (order[0][1] == order[1][1]) {
            x1 = order[1][0];
            z1 = order[1][2];
            pen.drawScanline(y, x0, x1, z0, z1, s);
        } else {
            for (; y <= order[1][1]; y++, x0+=delx0, x1+=delx1, z0+=delz0, z1+=delz1) {
                pen.drawScanline(y, x0, x1, z0, z1, s);
            }
        }
        for (; y <= order[2][1]; y++, x0+=delx0, x1+=delx2, z0+=delz0, z1+=delz2) {
            pen.drawScanline(y, x0, x1, z0, z1, s);
        }
    }

    copy(m) {
        this.points = m.points
        for (let j = 0; j < 4; j ++) {
            for (let i = 0; i < m.points; i++) {
                this.matrix[j][i] = m.matrix[j][i];
            }
        }
    }
}