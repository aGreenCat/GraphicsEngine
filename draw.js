var currentDrawColor = {r: 255, g: 0, b: 255};
var defaultDrawColor = {r: 255, g: 255, b: 0};

export function drawLine(x0, y0, x1, y1, s) {
    x0 = Math.floor(x0);
    y0 = Math.floor(y0);
    x1 = Math.floor(x1);
    y1 = Math.floor(y1);

    let z = -1000;

    console.log(x0)

    if (x0 > x1) {
        let temp = [x1, y1];
        x1 = x0;
        y1 = y0;
        x0 = temp[0];
        y0 = temp[1];
        //Switch coordinates
    }

    let deltaX = x1 - x0;
    let deltaY = y1 - y0;

    let A = deltaY;
    let B = - (deltaX);

    if (deltaY > 0) {
        //Octants 1 and 2
        if (deltaX > deltaY) {
            //Octant 1
        
            let d = 2*A + B;

            let x = x0;
            let y = y0;

            while (x <= x1) {
                s.plot(x, y, z, defaultDrawColor);
                
                if (d > 0) {
                    y++;
                    d += 2*B;
                }
                
                x++;
                d += 2*A;
            }
        } else {
            //Octant 2

            let d = A + 2*B;

            let x = x0;
            let y = y0;

            while (y <= y1) {
                s.plot(x, y, z, defaultDrawColor);
                
                if (d < 0) {
                    x++;
                    d += 2*A;
                }
                
                y++;
                d += 2*B;
            }
        }
    } else {
        //Octants 7 and 8
        if (deltaX > Math.abs(deltaY)) {
            //Octant 8
            let d = 2*A - B;

            let x = x0;
            let y = y0;

            while (x <= x1) {
                s.plot(x, y, z, defaultDrawColor);
                
                if (d < 0) {
                    y--;
                    d -= 2*B;
                }
                
                x++;
                d += 2*A;
            }
        } else {
            //Octant 7

            let d = A - 2*B;

            let x = x0;
            let y = y0;

            while (y >= y1) {
                s.plot(x, y, z, defaultDrawColor);
                
                if (d > 0) {
                    x++;
                    d += 2*A;
                }
                
                y--;
                d -= 2*B;
            }
        }
    }
}

export function drawScanline(y, x0, x1, z0, z1, s) {
    let [p0, p1] = [[x0, z0], [x1, z1]]
    let order = [p0, p1].sort((a, b) => a[0] - b[0]).map(coord => [Math.floor(coord[0]), coord[1]]);

    
    let delz = Math.floor(order[1][1] - order[0][1])/(order[1][0] - order[0][0]);
    y = Math.floor(y)

    // let count = 0;
    for (let x = order[0][0], z = order[0][1]; x <= order[1][0]; x++, z+=delz) {
        s.plot(x, y, z, currentDrawColor);

        // count++;
        // if (count == 1) break
    }
}

export function setColor (rr, gg, bb) {
    currentDrawColor = {r: Math.floor(rr), g: Math.floor(gg), b: Math.floor(bb)};
}