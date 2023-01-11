export default class Vector {
    constructor(x, y, z) {
        this.components = [x, y, z];
        this.magnitude = Math.sqrt(x*x + y*y + z*z);
    }

    normalize() {
        this.components = this.components.map(component => component/this.magnitude);
    }

    subtract(vector) {
        return new Vector(...this.components.map((component, index) => component - vector.components[index]));
    }

    scale(factor) {
        return new Vector(...this.components.map((component, index) => component * factor));
    }

    dot(vector) {
        return this.components.map((component, index) => component * vector.components[index]).reduce((prev, current) => prev + current);
    }

    cross(vector) {
        return new Vector(
            this.components[1] * vector.components[2] - this.components[2] * vector.components[1],
            this.components[2] * vector.components[0] - this.components[0] * vector.components[2],
            this.components[0] * vector.components[1] - this.components[1] * vector.components[0],
        );
    }


}