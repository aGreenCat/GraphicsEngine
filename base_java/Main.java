import java.util.*;
import java.io.*;
import java.awt.*;

public class Main {
  public static void main(String[] args) {

    Color c = Color.GREEN;
    Screen s = new Screen();
    EdgeMatrix edges = new EdgeMatrix();
    PolygonMatrix polys = new PolygonMatrix();

    GfxVector view = new GfxVector(0, 0, 1);
    Color ambient = new Color(100, 100, 100);
    GfxVector lightPos = new GfxVector(0, 0, 1);
    Color lightColor = new Color(0, 255, 255);

    Matrix transform = new Matrix();
    transform.ident();
    Stack<Matrix> csystems = new Stack<Matrix>();
    csystems.push(transform);

    if (args.length == 1) {
      //System.out.println(args[0]);
      try {
        gfxParse(new Scanner(new File(args[0])), edges, polys, csystems, s, c, view, ambient, lightPos, lightColor);
      }
      catch(FileNotFoundException e) {}
    }
    else {
      System.out.println("using system.in");
      gfxParse(new Scanner(System.in), edges, polys, csystems, s, c, view, ambient, lightPos, lightColor);
    }

  }//main

  public static void gfxParse(Scanner input, EdgeMatrix edges, PolygonMatrix polys, Stack<Matrix> csystems, Screen s, Color c, GfxVector view, Color ambient, GfxVector lightPos, Color lightColor) {

    String command = "";
    double[] xvals = new double[4];
    double[] yvals = new double[4];
    double[] zvals = new double[4];
    double theta, r0, r1;
    char axis;
    Matrix tmp;
    int curveType;
    double step2d = 0.01;
    int step3d = 100;

    while (input.hasNext()) {
      command = input.next();
      System.out.println(command);

      if (command.equals("push")) {
        csystems.push( csystems.peek().copy() );
      }//push

      else if (command.equals("pop")) {
        csystems.pop();
      }//pop

      else if (command.equals("line")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        xvals[1] = input.nextDouble();
        yvals[1] = input.nextDouble();
        zvals[1] = input.nextDouble();

        edges.addEdge(xvals[0], yvals[0], zvals[0],
                      xvals[1], yvals[1], zvals[1]);
        edges.mult(csystems.peek());
        edges.drawEdges(s, c);
        edges.clear();
      }//line

      else if (command.equals("box")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        xvals[1] = input.nextDouble();
        yvals[1] = input.nextDouble();
        zvals[1] = input.nextDouble();

        polys.addBox(xvals[0], yvals[0], zvals[0],
                     xvals[1], yvals[1], zvals[1]);
        polys.mult(csystems.peek());
        polys.drawPolygons(s, view, ambient, lightPos, lightColor);
        polys.clear();
      }//line

      else if (command.equals("sphere")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        r0 = input.nextDouble();
        polys.addSphere(xvals[0], yvals[0], zvals[0], r0, step3d);
        polys.mult(csystems.peek());
        polys.drawPolygons(s, view, ambient, lightPos, lightColor);
        polys.clear();
      }//sphere

      else if (command.equals("torus")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        r0 = input.nextDouble();
        r1 = input.nextDouble();
        polys.addTorus(xvals[0], yvals[0], zvals[0], r0, r1, step3d);
        polys.mult(csystems.peek());
        polys.drawPolygons(s, view, ambient, lightPos, lightColor);
        polys.clear();
      }//torus

      else if (command.equals("circle")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        r0 = input.nextDouble();
        edges.addCricle(xvals[0], yvals[0], zvals[0], r0, step2d);
        edges.mult(csystems.peek());
        edges.drawEdges(s, c);
        edges.clear();
      }//circle

      else if (command.equals("bezier") || command.equals("hermite")) {
        if (command.equals("bezier"))
          curveType = Matrix.BEZIER;
        else
          curveType = Matrix.HERMITE;
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        xvals[1] = input.nextDouble();
        yvals[1] = input.nextDouble();
        xvals[2] = input.nextDouble();
        yvals[2] = input.nextDouble();
        xvals[3] = input.nextDouble();
        yvals[3] = input.nextDouble();

        edges.addCurve(xvals[0], yvals[0], xvals[1], yvals[1],
                       xvals[2], yvals[2], xvals[3], yvals[3], step2d, curveType);
        edges.mult(csystems.peek());
        edges.drawEdges(s, c);
        edges.clear();
      }//curve

      else if (command.equals("scale")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        tmp = new Matrix(Matrix.SCALE, xvals[0], yvals[0], zvals[0]);
        tmp.mult(csystems.pop());
        csystems.push(tmp);
      }//scale

      else if (command.equals("move")) {
        xvals[0] = input.nextDouble();
        yvals[0] = input.nextDouble();
        zvals[0] = input.nextDouble();
        tmp = new Matrix(Matrix.TRANSLATE, xvals[0], yvals[0], zvals[0]);
        tmp.mult(csystems.pop());
        csystems.push(tmp);
      }//move

      else if (command.equals("rotate")) {
        axis = input.next().toUpperCase().charAt(0);
        theta = Math.toRadians(input.nextDouble());
        tmp = new Matrix(Matrix.ROTATE, theta, axis);
        tmp.mult(csystems.pop());
        csystems.push(tmp);
      }//rotate

      else if (command.equals("clear")) {
        edges = new EdgeMatrix();
        polys = new PolygonMatrix();
        s.clearScreen();
      }//clear edge matrix

      else if (command.equals("display")) {
        s.display();
      }

      else if (command.equals("save")) {
        command = input.next();
        s.saveExtension(command);
      }//save

      else if (command.charAt(0) == '#') {
        //comment, ignore
        input.nextLine();
      }
      else {
        System.out.println("invalid command: " + command);
      }
    }//read loop
  }//gfxParse

}
