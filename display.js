import fs from 'fs';
import {PNG} from 'pngjs';


//Not necessary
//Used to find path of file to display
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



//Constants
const XRES = 500;
const YRES = 500;
const MAXCOLOR = 255;

export default class Screen {
    constructor() {
        this.width = XRES;
        this.height = YRES;
    
        this.image = Array(this.height).fill().map(() => Array(this.width).fill({r:0, g:0, b:0}));
        this.zbuff = Array(this.height).fill().map(() => Array(this.width).fill(-Infinity));
    }

    plot(x, y, z, color) {
        let r = this.height - y - 1;
        let c = x;

        if (r >= 0 && r < this.height && c >= 0 && c < this.width) {

            if (false) { //debug
                this.image[r][c] = color;
            } else {
                if (z > this.zbuff[r][c] + 1) {
                    this.zbuff[r][c] = z;

                    this.image[r][c] = color;
                }
            }
        }
    }

    toRGB(color) {
        return `${color.r} ${color.g} ${color.b}`;
    }

    savePPM(fileName = 'image.ppm') {
        let data = `P3\n${this.width} ${this.height}\n${MAXCOLOR}\n`;

        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let colorString = this.toRGB(this.image[i][j]);
                data += `${colorString}\n`;
            }
        }


        fs.writeFile(fileName, data, err => {
            if (err) 
                console.log(err);
            else {
                
                console.log(`Image successfully created at: ${fileName}`);
            }
        });
    }


    savePNG(fileName = 'image.png') {
        let png = new PNG({ width: this.width, height: this.height});

        for (let r = 0; r < png.height; r++) {
            for (let c = 0; c < png.width; c++) {
                let p = (png.width * r + c)*4;
                
                png.data[p] = this.image[r][c].r;
                png.data[p + 1] = this.image[r][c].g;
                png.data[p + 2] = this.image[r][c].b;
                png.data[p + 3] = 255;
            }
        }

        png.pack().pipe(fs.createWriteStream(__dirname + '/' + fileName))
        .on("finish", () => {
            console.log(`Image successfully created: ${fileName}`);
        });
    }
}
