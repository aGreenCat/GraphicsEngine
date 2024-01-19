import fs from 'fs';

var data = fs.readFileSync("svg.txt", {encoding: 'utf-8'});
data = data.split(" ");


var scriptFile = [];

var command;
var last = {x: 0, y: 0};
var current = {x: 0, y: 0};

for (let i = 0; i < data.length; i++) {
    let input = data[i];
    if ('MmLlHhVvCcZz'.includes(input)) {
        command = input;
    } else {
        let coords = input.split(',').map(num => parseFloat(num));
        console.log(coords)

        if (command == 'M') {
            current.x = coords[0];
            current.y = coords[1];

            last.x = current.x;
            last.y = current.y;
        }

        else if (command == 'm') {
            current.x = coords[0];
            current.y = coords[1];

            last.x = current.x;
            last.y = current.y;
        }

        else if (command == 'L') {
            scriptFile.push("line");

            last.x = current.x;
            last.y = current.y;

            current.x = coords[0];
            current.y = coords[1];
            
            scriptFile.push(`${last.x} ${last.y} 0 ${current.x} ${current.y} 0`);
        }

        else if (command == 'l') {
            scriptFile.push("line");

            last.x = current.x;
            last.y = current.y;

            current.x += coords[0];
            current.y += coords[1];
            
            scriptFile.push(`${last.x} ${last.y} 0 ${current.x} ${current.y} 0`);
        }

        else if (command == 'H') {
            scriptFile.push("line");

            last.x = current.x;
            last.y = current.y;

            current.x = coords[0];
            
            scriptFile.push(`${last.x} ${last.y} 0 ${current.x} ${current.y} 0`);
        }

        else if (command == 'h') {
            scriptFile.push("line");

            last.x = current.x;
            last.y = current.y;

            current.x += coords[0];
            
            scriptFile.push(`${last.x} ${last.y} 0 ${current.x} ${current.y} 0`);
        }

        else if (command == 'V') {
            scriptFile.push("line");

            last.x = current.x
            last.y = current.y;

            current.y = coords[0];
            
            scriptFile.push(`${last.x} ${last.y} 0 ${current.x} ${current.y} 0`);
        }

        else if (command == 'v') {
            scriptFile.push("line");

            last.x = current.x
            last.y = current.y;

            current.y += coords[0];
            
            scriptFile.push(`${last.x} ${last.y} 0 ${current.x} ${current.y} 0`);
        }

        else if (command == 'C') {
            scriptFile.push("bezier");

            last.x = current.x;
            last.y = current.y;

            let p1 = coords;
            let p2 = data[i+1].split(',').map((val, i) => parseFloat(val));
            let p3 = data[i+2].split(',').map((val, i) => parseFloat(val));

            current.x = p3[0];
            current.y = p3[1];

            console.log(p1, p2, p3);

            
            scriptFile.push(`${last.x} ${last.y} ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`);

            i+=2;
        }

        else if (command == 'c') {
            scriptFile.push("bezier");

            last.x = current.x;
            last.y = current.y;

            let p1 = coords;
            let p2 = data[i+1].split(',').map((val, i) => parseFloat(val));
            let p3 = data[i+2].split(',').map((val, i) => parseFloat(val));

            p1[0] += last.x
            p2[0] += last.x
            p3[0] += last.x

            p1[1] += last.y
            p2[1] += last.y
            p3[1] += last.y

            current.x = p3[0];
            current.y = p3[1];

            
            scriptFile.push(`${last.x} ${last.y} ${p1[0]} ${p1[1]} ${p2[0]} ${p2[1]} ${p3[0]} ${p3[1]}`);

            i+=2;
        }

        else {
            console.log(`${command} is not yet a command`)
        }
    }
}

fs.writeFileSync('gallery', scriptFile.join('\r\n') + "\r\nident\r\nscale\r\n3.78 -3.78 3.78\r\nmove\r\n0 500 0\r\napply\r\nsave\r\ngallery.png");