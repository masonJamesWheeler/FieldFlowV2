import { updateMode, updateDrawingStrokeWidth, updateDrawingFillStyle, updateDrawingMode, updateDrawingColor,
            updateEditingColor, updateEditingFillStyle, updateEditingDrawingMode, updateEditingStrokeWidth,
            editingStrokeWidth, drawingColor, drawingFillStyle, drawingMode, drawingStrokeWidth, editingColor, editingFillStyle, editingDrawingMode,
            updateDrawingShape, updateEditingShape, drawingShape, editingShape, updateDrawingEndStyle, updateEditingEndStyle, drawingEndStyle, editingEndStyle, editingPlayerPosition, updateEditingPlayerPosition
        } from './store';

// Constants
const MAX_PLAYERS = 11;
const DEFAULT_STROKE_WIDTH = 10;
const DEFAULT_PLAYER_SIZE = 40;
const DEFAULT_MODE = "Straight";
const DEFAULT_COLOR = "Black";
const DEFAULT_EDITING_COLOR = "Red";
const DEFAULT_FILL_STYLE = "Solid";
const DEFAULT_SHAPE = "Circle";
const DEFAULT_END_STYLE = "None";
const DEFAULT_PLAYER_POSITION = "";

 
// TypeScript Class Definitions

// Class: Point (x, y)
// Represents a point in 2D space with x and y coordinates
export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Method: add (point)
    // Adds the given point to this point and returns a new point
    add(point: Point) {
        return new Point(this.x + point.x, this.y + point.y);
    }

    // Method: angle (point)
    // Returns the angle between this point and the given point
    angle(point: Point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }

    // Method: distance (point)
    // Returns the distance between this point and the given point
    distance(point: Point) {
        return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
    }

    // Method: angleLock (point)
    // Returns a new point projected onto the closest 15-degree angle from this point to the given point
    angleLock(point: Point) {
        let distance = this.distance(point);
        let angle = this.angle(point);
        let anglelock = Math.round(angle / (Math.PI / 12)) * (Math.PI / 12);
        return new Point(this.x + distance * Math.cos(anglelock), this.y + distance * Math.sin(anglelock));
    }

    // Method: withinRadius (radius)
    // Returns true if this point is within the given radius from the origin (0, 0), false otherwise
    isClicked(point: Point, radius: number = DEFAULT_STROKE_WIDTH) {    
        return this.distance(point) <= radius;
    }

    // Method: updatePoint (point)
    // Moves this point to the new location
    updatePoint(point: Point) {
        this.x = point.x;
        this.y = point.y;
    }

    // Method: Translate (startPoint, endPoint)
    // Moves this point by the given amount
    translate(startPoint: Point|LinkedPoint, endPoint: Point|LinkedPoint) {
        this.x += endPoint.x - startPoint.x;
        this.y += endPoint.y - startPoint.y;
    }
}

// Class: LinkedPoint (x, y)
class LinkedPoint extends Point {
    linkedPoint: LinkedPoint | Point| null;
  
    constructor(x: number, y: number) {
      super(x, y);
      this.linkedPoint = null;
    }
  
    // Method: linkToPoint (point)
    linkToPoint(point: LinkedPoint|Point) {
      this.linkedPoint = point;
      if (point instanceof LinkedPoint) {
        point.linkedPoint = this;
      }
    }

    // Method: updateLinkedPoint (point)
    updateLinkedPoint(point: Point|LinkedPoint) {
        this.x = point.x;
        this.y = point.y;
        if (this.linkedPoint != null) {
            this.linkedPoint.updatePoint(point);
        }
    }

    // Method: reconnectLinkedPoint (point)
    reconnectLinkedPoint() {
        if (this.linkedPoint != null) {
            this.linkedPoint.x = this.x;
            this.linkedPoint.y = this.y;
        }
    }
  }

// Class: LineSegment (start, end, type, color, fill, width, endStyle)
// Represents a line segment or curve in 2D space with start and end points, styling and other properties
class LineSegment {
    start: Point;
    end: Point;
    controlPoint: Point;
    type: string;
    color: string;
    fill: string;
    width: number;
    endStyle: string;

    constructor(start: Point, end: Point, controlPoint: Point | null = null, type: string = DEFAULT_MODE, color: string = DEFAULT_COLOR, fill: string = DEFAULT_FILL_STYLE, width: number = DEFAULT_STROKE_WIDTH, endStyle: string = DEFAULT_END_STYLE) {
        this.start = start;
        this.end = end;
        this.type = type;
        this.color = color;
        this.fill = fill;
        this.width = width;
        this.endStyle = endStyle;
    }

    // Method: clicked (point)
    // Returns true if the point is within 5 pixels of the line segment
    clicked(point: Point) {
        let distance = this.distance(point);
        return distance <= 5;
    }

    // Method: distance (point)
    // Returns the distance from the given point to the line segment
    distance(point: Point) {
        if (this.type == DEFAULT_MODE) {
            return this.straightdistance(point);
        } else {
            return this.curvedistance(point);
        }
    }

    // Method: straightdistance (point)
    // Returns the distance from the point to the line
    straightdistance(point: Point) {
        let x1 = this.start.x;
        let y1 = this.start.y;
        let x2 = this.end.x;
        let y2 = this.end.y;
        let x0 = point.x;
        let y0 = point.y;

        let numerator = Math.abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1);
        let denominator = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
        
        return numerator / denominator;
    }

    // Method: curvedistance (point)
    // Returns the distance from the point to the closest point on the curve
    // The curve is approximated by a series of straight line segments
    curvedistance(point: Point) {
        let distance = Infinity;
        let start = this.start;
        let end = this.end;
        let angle = start.angle(end);
        let length = start.distance(end);
        let segments = Math.ceil(length / DEFAULT_STROKE_WIDTH);
        let segmentLength = length / segments;

        for (let i = 0; i < segments; i++) {
            let segmentStart = new Point(start.x + i * segmentLength * Math.cos(angle), start.y + i * segmentLength * Math.sin(angle));
            let segmentEnd = new Point(start.x + (i + 1) * segmentLength * Math.cos(angle), start.y + (i + 1) * segmentLength * Math.sin(angle));
            let segment = new LineSegment(segmentStart, segmentEnd);
            distance = Math.min(distance, segment.straightdistance(point));
        }

        return distance;
    }

    // Method isLineClicked (point)
    // Returns true if the point is within line segment
    isLineClicked(point: Point) {
        // Returns true if the point is within 5 pixels of the line segment
        let distance = this.distance(point);
        if (distance <= DEFAULT_STROKE_WIDTH) {
            return this
        }
    }

    // Method: isPointClicked (point)
    isPointClicked(point: Point) {
        // Returns true if the point is within 5 pixels of the start or end point
        let startdistance = this.start.distance(point);
        let enddistance = this.end.distance(point);
        if (startdistance <= DEFAULT_STROKE_WIDTH) {
            return this.start;
        } else if (enddistance <= DEFAULT_STROKE_WIDTH) {
            return this.end;
        }
    }

    // Method dragLine (startDragPoint, currentCursorPoint)
    dragLine(startDragPoint: Point|LinkedPoint, currentCursorPoint: Point|LinkedPoint) {
        // Translate each of the points,
        this.start.translate(startDragPoint, currentCursorPoint);
        this.end.translate(startDragPoint, currentCursorPoint);

        if (this.controlPoint != null) {
            this.controlPoint.translate(startDragPoint, currentCursorPoint);
        }

        if (this.start instanceof LinkedPoint) {
            this.start.reconnectLinkedPoint();
        }
        if (this.end instanceof LinkedPoint) {
            this.end.reconnectLinkedPoint();
        }
    }

    // Method: draw (context)
    draw(context: CanvasRenderingContext2D, selected: boolean = false) {
        if (this.type == DEFAULT_MODE) {
            this.drawStraight(context, selected);
        } else if (this.type == "Curve" && this.controlPoint != null) {
            this.drawCurve(context, selected);
        }
    }

    // Method: drawstraight (context)
    drawStraight(context: CanvasRenderingContext2D, selected: boolean = false) {
        if (selected) {
            context.strokeStyle = DEFAULT_EDITING_COLOR; // Change this to the color you want for selected LineSegments
        } else {
            context.strokeStyle = this.color;
        }
        context.lineWidth = this.width;
        if (this.fill == "Dashed") {
            context.setLineDash([5, 5]);
        } else if (this.fill == DEFAULT_FILL_STYLE) {
            context.setLineDash([]);
        }
        // Draws the line segment as a straight line
        context.beginPath();
        context.moveTo(this.start.x, this.start.y);
        context.lineTo(this.end.x, this.end.y);
        context.stroke();
        context.closePath();
        if (this.endStyle == "Arrow") {
            this.drawArrow(context);
        }
    }

    // Method: drawcurve (context)
    drawCurve(context: CanvasRenderingContext2D, selected: boolean = false) {
        if (selected) {
            context.strokeStyle = DEFAULT_EDITING_COLOR; // Change this to the color you want for selected LineSegments
        } else {
            context.strokeStyle = this.color;
        }
        context.lineWidth = this.width;
        if (this.fill == "Dashed") {
            context.setLineDash([5, 5]);
        } else if (this.fill == DEFAULT_FILL_STYLE) {
            context.setLineDash([]);
        }
        // Draws the line segment as a curve
        context.beginPath();
        context.moveTo(this.start.x, this.start.y);
        context.quadraticCurveTo(this.controlPoint.x, this.controlPoint.y, this.end.x, this.end.y);
        context.stroke();
        context.closePath();
        if (this.endStyle == "Arrow") {
            this.drawArrow(context);
        }
    }
    // Method: drawArrow (context)
    drawArrow(context: CanvasRenderingContext2D) {
        let offsetX = 0;
        let offsetY = 0;
        let angle = 0;
        let x = 0;
        let y = 0;
        let arrowOffset = 0;

        if (this.type == DEFAULT_MODE) {
        // Draws an arrow at the end of the line segment
            angle = this.start.angle(this.end);
            x = this.end.x;
            y = this.end.y;

            // Define an arrow offset factor (between 0 and 1)
            arrowOffset = 1.05; // Change this value to adjust the arrow position along the line segment

            // Calculate the new starting point for the arrow
            offsetX = this.start.x + (this.end.x - this.start.x) * arrowOffset;
            offsetY = this.start.y + (this.end.y - this.start.y) * arrowOffset;

        } else if (this.type == "Curve") {
            angle = this.controlPoint.angle(this.end);
            x = this.end.x;
            y = this.end.y;

            // Define an arrow offset factor (between 0 and 1)
            arrowOffset = 1.05; // Change this value to adjust the arrow position along the line segment

            // Calculate the new starting point for the arrow
            offsetX = this.controlPoint.x + (this.end.x - this.controlPoint.x) * arrowOffset;
            offsetY = this.controlPoint.y + (this.end.y - this.controlPoint.y) * arrowOffset;
        }

        let arrowLength = 50;
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        context.lineTo(offsetX - arrowLength * Math.cos(angle + Math.PI / 6), offsetY - arrowLength * Math.sin(angle + Math.PI / 6));
        context.lineTo(offsetX - arrowLength * Math.cos(angle - Math.PI / 6), offsetY - arrowLength * Math.sin(angle - Math.PI / 6));
        context.lineTo(offsetX, offsetY);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }

    drawCircle(context: CanvasRenderingContext2D) {
        // Draws a circle at the end of the line segment
        let angle = this.start.angle(this.end);
        let x = this.end.x;
        let y = this.end.y;

        // Define an arrow offset factor (between 0 and 1)
        let arrowOffset = 1.1; // Change this value to adjust the arrow position along the line segment

        // Calculate the new starting point for the arrow
        let offsetX = this.start.x + (this.end.x - this.start.x) * arrowOffset;
        let offsetY = this.start.y + (this.end.y - this.start.y) * arrowOffset;

        let arrowLength = 50;
        context.beginPath();
        context.arc(offsetX, offsetY, 5, 0, 2 * Math.PI);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
        }

    // Method moveSegment (point)
    moveSegment(point: Point) {
        // Moves the line segment to a new point
        this.start = point;
    }
    

}

// Class Route (LineSegments)
// This is mainly a helper class for the Player class
export class Route {
    playerStart : Point;
    currentPoint : Point;
    paths : LineSegment[];
    endStyle : string;
    constructor(startingPaths: LineSegment[], playerStart: Point, endStyle = "Arrow") {
        this.paths = startingPaths;
        this.playerStart = playerStart;
        this.currentPoint = playerStart;
        this.endStyle = endStyle;
    }

    // Method: addSegment (point, type, color, fill, width, endStyle)
    addSegment(point: Point, type = DEFAULT_MODE, color = DEFAULT_COLOR, fill = DEFAULT_FILL_STYLE, width = 1, endStyle = this.endStyle) {
        // Reset the endStyle of the previous segment if it exists
        if (this.paths.length > 0) {
        this.paths[this.paths.length - 1].endStyle = DEFAULT_END_STYLE;
        }

        // Create LinkedPoints
        let startPoint = new LinkedPoint(this.currentPoint.x, this.currentPoint.y);
        let endPoint = new LinkedPoint(point.x, point.y);

        // If this is the first segment, link the players starting point to the first segment
        if (this.paths.length == 0) {
            startPoint.linkToPoint(this.playerStart);
        }
        else {
            // Link the previous segment to this one
            if (this.currentPoint != null) {
            startPoint.linkToPoint(this.currentPoint)
        }
    }

        // Adds a line segment to the route
        let segment = new LineSegment(startPoint, endPoint, null, type, color, fill, width, endStyle);
        this.currentPoint = endPoint;
        this.paths.push(segment);
    }

    // Method: moveControlPoint (point)
    moveControlPoint(point: Point) {
        // Moves the control point of the last line segment
        let segment = this.paths[this.paths.length - 1];
        segment.controlPoint = point;
    }
    // Method: isClicked (point)
    isClicked(point: Point) {
        // Returns the point or lineSegment that is clicked
        for (let i = 0; i < this.paths.length; i++) {
            let segment = this.paths[i];
            let clickedPoint = segment.isPointClicked(point);
            if (clickedPoint != null) {
                return clickedPoint;
            }
            let clickedLine = segment.isLineClicked(point);
            if (clickedLine != null) {
                return clickedLine;
            }
        }
        return null
    }

    // Method: draw (context)
    draw(context: CanvasRenderingContext2D, selectedObject: Player | LineSegment | Point | null) {
        let selected = false;
        // Draws the route
        for (let i = 0; i < this.paths.length; i++) {
            if (selectedObject == this.paths[i]) {
                selected = true;
            } else {
                selected = false;
            }
            this.paths[i].draw(context, selected);
        }
        // Draw the endStyle on the last line segment
        if (this.paths.length > 0) {
        if (this.endStyle == "Arrow") {
            this.paths[this.paths.length - 1].drawArrow(context);
        } else if (this.endStyle == DEFAULT_SHAPE) {
            this.paths[this.paths.length - 1].drawCircle(context);
        }
        // If the player is selected then draw the nodes
        if (selectedObject instanceof Player) {
            if (selectedObject.route == this) {
                this.drawNodes(context);
            }
        
        } else if (selectedObject instanceof LineSegment) {
            let start = selectedObject.start;
            let end = selectedObject.end;
            this.drawNode(context, start);
            this.drawNode(context, end);
        }
    }
    }

    drawNodes(context: CanvasRenderingContext2D) {
        let start
        let end
        // Draws the nodes for the route
        for (let i = 0; i < this.paths.length; i++) {
            start = this.paths[i].start;
            end = this.paths[i].end;
            this.drawNode(context, start);
        }
    }

    // Method: drawNode (context, point)
    drawNode(context: CanvasRenderingContext2D, point: Point) {
        // Draws a hollow node at the given point
        context.beginPath();
        // Outer circle
        context.arc(point.x, point.y, DEFAULT_STROKE_WIDTH, 0, 2 * Math.PI);
        context.fillStyle = DEFAULT_COLOR;
        context.fill();
        context.closePath();
        // Inner circle
        context.beginPath();
        context.arc(point.x, point.y, 5, 0, 2 * Math.PI);
        context.fillStyle = "White";
        context.fill();
        context.closePath();
    }

    // Method drag (startDragPoint, endDragPoint)
    drag(startDragPoint: Point, endDragPoint: Point) {
        // Loop through all the line segments and drag them
        for (let i = 0; i < this.paths.length; i++) {
            if (i % 2 == 0) {
            this.paths[i].dragLine(startDragPoint, endDragPoint);
            } else if (this.paths[i].controlPoint != null) {
                this.paths[i].controlPoint.translate(startDragPoint, endDragPoint);
            } else if (i == this.paths.length - 1) {
                this.paths[i].end.translate(startDragPoint, endDragPoint);
            }
        }
    }
}


// Class: Player (start, position, route, shape, color)
export class Player {
    start : Point;
    position : string;
    route : Route;
    shape : string;
    color : string;
    size: number;
    fillStyle: string;
    constructor(start: Point, position: string = "", route: Route, shape = DEFAULT_SHAPE, color = DEFAULT_COLOR, size = DEFAULT_PLAYER_SIZE, fillStyle = DEFAULT_FILL_STYLE) {
        this.start = start;
        this.position = position;
        this.route = route;
        this.shape = shape;
        this.color = color;
        this.size = size;
        this.fillStyle = fillStyle;
    }

    // Method: draw (context)
    draw(context: CanvasRenderingContext2D, selectedObject: Player | LineSegment | Point | null) {
        // Draws the player
        if (this.shape == DEFAULT_SHAPE) {
            this.drawCircle(context, this.size, selectedObject == this);
        } else if (this.shape == "Rectangle") {
            this.drawRectangle(context, this.size, this.size, selectedObject == this);
        }
        this.drawRoute(context, selectedObject);
        this.drawPosition(context);
    }

    // Method: drawcircle (context)
    drawCircle(context: CanvasRenderingContext2D, radius = this.size, selected: boolean = false) {
        if (selected) {
            context.fillStyle = DEFAULT_EDITING_COLOR; 
        } else {
            context.fillStyle = this.color;
        }
        // Draws the outer arc
        context.beginPath();
        context.arc(this.start.x, this.start.y, radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
        // Draws the inner arc
        context.beginPath();
        context.arc(this.start.x, this.start.y, 4*radius/5, 0, Math.PI * 2);
        context.fillStyle = "White";
        context.fill();
    }
    // Method: drawRectangle (context)
    drawRectangle(context: CanvasRenderingContext2D, width = this.size, height = this.size, selected: boolean = false) {
        if (selected) {
            context.fillStyle = DEFAULT_EDITING_COLOR; 
        } else {
            context.fillStyle = this.color;
        }
        // Double the width and height
        width *= 2;
        height *= 2;
        // Draws the player as a outline of a rectangle
        context.beginPath();
        // Draw the outer rectangle
        context.rect(this.start.x - width / 2, this.start.y - height / 2, width, height);
        context.fill();
        context.closePath();
        // Draw the inner rectangle
        context.beginPath();
        context.rect(this.start.x - 4*width / 5 / 2, this.start.y - 4*height / 5 / 2, 4*width / 5, 4*height / 5);
        context.fillStyle = "White";
        context.fill();
        context.closePath();
    }

    // Method: drawRoute (context)
    drawRoute(context: CanvasRenderingContext2D, selectedObject: Player | LineSegment | Point | null) {
        // Draws the route
        this.route.draw(context, selectedObject);
    }
    // Method: isClicked (point)
    isPlayerClicked(point: Point) {
        // Checks if the player is clicked
        let distance = this.start.distance(point);
        if (distance < this.size / 2) {
            return this;
        } else {
            return null;
        }
    }
    // Method: isRouteClicked (point)
    isRouteClicked(point: Point) {
        // Checks if the route is clicked
        return this.route.isClicked(point);
    }

    // Method dragRoute (StartDragPoint, EndDragPoint)
    dragRoute(startDragPoint: Point, endDragPoint: Point) {
        // Drags the route
        this.route.drag(startDragPoint, endDragPoint);
    }

    // Method drawPosition (context)
    drawPosition(context: CanvasRenderingContext2D) {
        // Draws the position of the player
        let position = new TextBox(this.start, this.size, this.size, this.position, 50, "Arial", "black", "white", "black", 0, -10);
        position.draw(context);
    }
}

// Class for a textbox (position, width, height, text, fontSize, font, color, backgroundColor, borderColor, borderWidth, padding)
export class TextBox {
    position: Point;
    width: number;
    height: number;
    text: string;
    fontSize: number;
    font: string;
    color: string;
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
    padding: number;
  
    constructor(position: Point, width: number, height: number, text: string, fontSize: number = 16, font: string = "Arial", color: string = "black", backgroundColor: string = "white", borderColor: string = "black", borderWidth: number = 1, padding: number = 5) {
      this.position = position;
      this.width = width;
      this.height = height;
      this.text = text;
      this.fontSize = fontSize;
      this.font = font;
      this.color = color;
      this.backgroundColor = backgroundColor;
      this.borderColor = borderColor;
      this.borderWidth = borderWidth;
      this.padding = padding;
    }
  
    draw(context: CanvasRenderingContext2D) {
      const topLeftX = this.position.x - this.width / 2;
      const topLeftY = this.position.y - this.height / 2;
  
      context.beginPath();
      context.rect(topLeftX, topLeftY, this.width, this.height);
      context.fillStyle = this.backgroundColor;
      context.fill();
      if (this.borderWidth > 0) {
        context.lineWidth = this.borderWidth;
        context.strokeStyle = this.borderColor;
        context.stroke();
      }
      context.closePath();
  
      context.font = `${this.fontSize}px ${this.font}`;
      context.fillStyle = this.color;
      context.textAlign = "center";
      context.textBaseline = "top";
      const lines = this.text.split("\n");
      const lineHeight = this.fontSize + this.padding;
      const totalTextHeight = lineHeight * lines.length;
      lines.forEach((line, index) => {
        const yPos = topLeftY + this.height / 2 + lineHeight * index - totalTextHeight / 2;
        context.fillText(line, topLeftX + this.width / 2, yPos);
      });
    }
  }


// Class: AppState (Canvas)
export class AppState {
    // Canvas and context
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;

    // Mode for state machine
    mode: string;
    cursorOnCanvas: boolean = false;
    cursorLocation: Point;
    mouseDown: boolean = false;
    dragging: boolean = false;

    // Variables to manage state
    players: Player[];
    max_players: number = MAX_PLAYERS;
    background_image: HTMLImageElement;

    // Drawing settings
    drawingStrokeWidth: number = DEFAULT_STROKE_WIDTH;
    drawingPlayerSize: number = DEFAULT_PLAYER_SIZE;
    drawingMode: string = DEFAULT_MODE;
    drawingColor: string = DEFAULT_COLOR;
    drawingFillStyle: string = DEFAULT_FILL_STYLE;
    drawingShape: string = DEFAULT_SHAPE;
    drawingEndStyle: string = DEFAULT_END_STYLE;

    // Editing settings
    editingStrokeWidth: number = DEFAULT_STROKE_WIDTH;
    editingPlayerSize: number = DEFAULT_PLAYER_SIZE;
    editingMode: string = DEFAULT_MODE;
    editingColor: string = DEFAULT_COLOR;
    editingFillStyle: string = DEFAULT_FILL_STYLE;
    editingShape: string = DEFAULT_SHAPE;
    editingEndStyle: string = DEFAULT_END_STYLE;
    editingPlayerPosition: string = DEFAULT_PLAYER_POSITION;
    
    // Current player and selected object
    currentPlayer: Player | null = null;
    selectedObject: Player | LineSegment | Point | null = null;
    tempCurve: Boolean = false;
    dragStart: Point | null = null;
    
    // Keys held
    keys: {} = {};

    // Constructor
    constructor(canvas: HTMLCanvasElement, mode: string, players: Player[] = []) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.mode = mode;
        this.players = players;
        this.background_image = new Image();
        this.init();
}
    // Method: handleKeyDown (event)
    // Handles key down events while the cursor is on the canvas
    handleKeyDown(event: KeyboardEvent) {
        if (this.cursorOnCanvas) {
            this.keys[event.key] = true;
        }
    }

    // Method: handleKeyUp (event)
    // Handles key up events while the cursor is on the canvas
    handleKeyUp(event: KeyboardEvent) {
        if (this.cursorOnCanvas) {
            if (event.key == "Escape") {
                this.mode = "AddPlayer";
                this.currentPlayer = null;
                this.selectedObject = null;
                this.tempCurve = false;
                this.updateEverything();
            }
        }
        this.keys[event.key] = false;
    }

    // Method: handleClick (point)
    // Handles click events and performs different actions based on the mode
    handleClick(point: Point) {
        point = this.snapToPlayer(point).point;

        // Add Player mode
        if (this.mode == "AddPlayer") {
            this.addPlayer(point);

        // Edit mode
        } else if (this.mode == "Edit") {
            this.selectObject(point);
        // Drawing mode
        } else if (this.mode == "Drawing") {
            // Check if we are angle locking
            if (this.keys["Shift"]) {
                point = this.currentPlayer!.route.currentPoint.angleLock(point);
            }
            if (this.tempCurve != true) {
                this.currentPlayer!.route.addSegment(point, this.drawingMode, this.drawingColor, this.drawingFillStyle, this.drawingStrokeWidth, DEFAULT_END_STYLE);
            }
            if (this.drawingMode == "Curve" && this.tempCurve == false) {
                this.tempCurve = true;
            } else if (this.drawingMode == "Curve" && this.tempCurve == true) {
                this.tempCurve = false;
            }
        }
        this.updateEverything();
    }

    // Method: handleMouseDown (point)
    // Handles mouse down events and performs different actions based on the mode
    handleMouseDown(point: Point) {
        this.mouseDown = true;
        // Check if we are in edit mode
        if (this.mode == "Edit") {
            // If we are clicking on the current selected object, start dragging
            if (this.selectedObject != null) {
                if (this.selectedObject instanceof Player) {
                    if (this.selectedObject.isPlayerClicked(point)) {
                        this.dragging = true;
                        this.dragStart = point;
                    }
                } else if (this.selectedObject instanceof LineSegment) {
                    if (this.selectedObject.isLineClicked(point)) {
                        this.dragging = true;
                        this.dragStart = point;
                    }
            }   else if (this.selectedObject instanceof Point) {
                    if (this.selectedObject.isClicked(point)) {
                        this.dragging = true;
                        this.dragStart = point;
                    }
                }
            }
        }
    }

    // Method: handleMouseUp (point)
    // Handles mouse up events and performs different actions based on the mode
    handleMouseUp(point: Point) {
        this.mouseDown = false;
        this.dragging = false;
        this.dragStart = null;
    }

    dragObject(point: Point, object: Player | LineSegment | Point | LinkedPoint | null) {
        if (this.dragging) {
            if (object == null) {
                this.dragging = false;
                return;
            }
            if (object instanceof LinkedPoint) {
                console.log("Dragging point");
                object.updateLinkedPoint(point);
            } else if (object instanceof Point) {
                console.log("Dragging linked point");
                object.updatePoint(point);
            } else if (object instanceof LineSegment) {
                object.dragLine(this.dragStart!, point);
            } else if (object instanceof Player) {
                object.dragRoute(this.dragStart!, point);
            }
        }
    }

    // Method: handleMouseMove (point)
    // Handles mouse movement events on the canvas and updates the display accordingly
    handleMouseMove(point: Point) {
        this.cursorLocation = point;
        // Add Player mode
        if (this.mode == "AddPlayer") {
            this.clear();
            // Check if we are snapping to a player
            let snappedPoint = this.snapToPlayer(point).point;
            let playerPoint = this.snapToPlayer(point).playerPoint!;
            // Check if the playerPoint is type Point
            if (playerPoint instanceof Point) {
                if (snappedPoint.x == point.x || snappedPoint.y == point.y) {
                    this.drawPlayerProjection(snappedPoint);
                    this.drawProjectionLine(playerPoint, snappedPoint, "Snapped");
                }
            } else {
                this.drawPlayerProjection(point);
            }
        // Drawing mode
        } else if (this.mode == "Drawing") {
            if (this.currentPlayer != null) {
                // Check if we are drawing a curve
                if (this.drawingMode == "Curve" && this.tempCurve == true) {
                    this.currentPlayer!.route.moveControlPoint(point);
                }

                this.clear();
                this.drawProjectionLine(this.currentPlayer!.route.currentPoint, point, this.drawingMode);
            }
        // Edit mode
        } else if (this.mode == "Edit") {
            if (this.dragging) {
                if (this.selectedObject != null) {
                    this.dragObject(point, this.selectedObject);
                    this.dragStart = point;
                }
            }
            this.clear();
            this.drawPlayers();            
        }
    }



    // Method: handleMouseLeave ()
    // Handles mouse leave events on the canvas, clearing and redrawing the players
    handleMouseLeave() {
        this.clear();
        this.drawPlayers();
        this.cursorOnCanvas = false;
    }

    // Method: handleMouseEnter ()
    // Handles mouse enter events on the canvas, updating the cursorOnCanvas status
    handleMouseEnter() {
        this.cursorOnCanvas = true;
    }
        // Method: clear ()
    // Clears the canvas and redraws the background and players
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        
        // Get the temporary end style of the currentPlayer
        let tempEndStyle = DEFAULT_END_STYLE;
        if (this.currentPlayer != null && this.mode == "Drawing") {
            tempEndStyle = this.currentPlayer.route.endStyle;
            this.currentPlayer.route.endStyle = DEFAULT_END_STYLE;
        }
        
        this.drawPlayers();
        
        if (this.currentPlayer != null && this.mode == "Drawing") {
            this.currentPlayer.route.endStyle = tempEndStyle;
        }
    }

    // Method: drawBackground ()
    // Draws the background image on the canvas
    drawBackground() {
        this.ctx.drawImage(this.background_image, 0, 0, this.canvas.width, this.canvas.height);
    }

    // Method: addPlayer (point)
    // Adds a player to the canvas
    addPlayer(point: Point) {
        let start = point;
        let route = new Route([], start);
        let player = new Player(start, DEFAULT_PLAYER_POSITION, route, this.drawingShape, this.drawingColor, this.drawingPlayerSize, this.drawingFillStyle);
        
        if (this.players.length < this.max_players) {
            this.players.push(player);
            this.currentPlayer = player;
            this.mode = "Drawing";
            this.selectedObject = player;
        }
        
        this.drawPlayers();
    }

    // Method: drawPlayers ()
    // Continuously draws the players on the canvas
    drawPlayers() {
        // Draw each player in the players array
        for (let i = 0; i < this.players.length; i++) {
            this.players[i].draw(this.ctx, this.selectedObject);
        }
    }

        // Method: drawPlayerProjection (point)
    // Draws a projection of the player at the given point
    drawPlayerProjection(point: Point) {
        let start = point;
        this.ctx.lineWidth = this.drawingStrokeWidth;
        
        if (this.drawingShape == DEFAULT_SHAPE) {
            // Draw the outer circle at the point
            this.ctx.beginPath();
            this.ctx.arc(start.x, start.y, DEFAULT_PLAYER_SIZE, 0, Math.PI * 2);
            this.ctx.fillStyle = DEFAULT_COLOR;
            this.ctx.fill();
            this.ctx.closePath();

            // Draw the inner circle
            this.ctx.beginPath();
            this.ctx.arc(start.x, start.y, 4*DEFAULT_PLAYER_SIZE/5, 0, Math.PI * 2);
            this.ctx.fillStyle = "White";
            this.ctx.fill();
            this.ctx.closePath();
        } else if (this.drawingShape == "Rectangle") {
            // Draw the outer rectangle
            this.ctx.beginPath();
            this.ctx.rect(start.x - DEFAULT_PLAYER_SIZE, start.y - DEFAULT_PLAYER_SIZE, 2*DEFAULT_PLAYER_SIZE, 2*DEFAULT_PLAYER_SIZE);
            this.ctx.fillStyle = DEFAULT_COLOR;
            this.ctx.fill();
            this.ctx.closePath();

            // Draw the inner rectangle
            this.ctx.beginPath();
            this.ctx.rect(start.x - 4*DEFAULT_PLAYER_SIZE/5, start.y - 4*DEFAULT_PLAYER_SIZE/5, 8*DEFAULT_PLAYER_SIZE/5, 8*DEFAULT_PLAYER_SIZE/5);
            this.ctx.fillStyle = "White";
            this.ctx.fill();
            this.ctx.closePath();
        }
    }

    // Method: drawProjectionLine (point1, point2, mode)
    // Draws a projection line between point1 and point2 based on the given mode
    drawProjectionLine(point1: Point, point2: Point, mode: string) {
        this.ctx.lineWidth = this.drawingStrokeWidth;
        this.ctx.strokeStyle = this.drawingColor;
        
        if (this.drawingFillStyle == "Dashed") {
            this.ctx.setLineDash([5, 5]);
        } else {
            this.ctx.setLineDash([]);
        }

        if (mode == "Snapped") {
            // Draw a dashed projection line if we are angle locking
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(point1.x, point1.y);
            this.ctx.lineTo(point2.x, point2.y);
            this.ctx.strokeStyle = DEFAULT_COLOR;
            this.ctx.stroke();
            this.ctx.closePath();
            this.ctx.setLineDash([]);
        } else if (mode == DEFAULT_MODE || mode == "Curve" && this.tempCurve == false) {
            // Check if we are angle locking
            if (this.keys["Shift"]) {
                point2 = this.currentPlayer!.route.currentPoint.angleLock(point2);
            }
            // Draw a projection line to the cursor
            this.ctx.beginPath();
            this.ctx.moveTo(point1.x, point1.y);
            this.ctx.lineTo(point2.x, point2.y);
            this.ctx.strokeStyle = this.drawingColor;
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    // Method: snapToPlayer (point)
    // Snaps the given point to a player within a certain proximity
    snapToPlayer(point: Point) {
        let playerPoint: Point | null = null;

        // Check if we are within 5 pixels of a vertical or horizontal line of any of the 
        // existing players
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            let x = player.start.x;
            let y = player.start.y;

            if (Math.abs(point.x - x) < DEFAULT_STROKE_WIDTH) {
                point.x = x;
                playerPoint = player.start;
            }
            if (Math.abs(point.y - y) < DEFAULT_STROKE_WIDTH) {
                point.y = y;
                playerPoint = player.start;
            }
        }
        return {point: point, playerPoint: playerPoint};
    }

    // Method: selectObject (point)
    // Selects an object on the canvas based on the given point
    selectObject(point: Point) {
        let selectedObject;

        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            selectedObject = player.isPlayerClicked(point);

            if (selectedObject != null) {
                this.selectedObject = selectedObject;

                if (this.mouseDown) {
                    this.dragging = true;
                }

                if (this.selectedObject instanceof Player) {
                    this.currentPlayer = this.selectedObject;
                    this.drawingShape = this.currentPlayer.shape;
                    this.drawingColor = this.currentPlayer.color;
                    this.editingPlayerPosition = this.currentPlayer.position
                }
                return;
            }

            selectedObject = player.route.isClicked(point);

            if (selectedObject != null) {
                if (this.mouseDown) {
                    this.dragging = true;
                }

                this.selectedObject = selectedObject;

                if (this.selectedObject instanceof LineSegment) {
                    this.editingColor = this.selectedObject.color;
                    this.editingStrokeWidth = this.selectedObject.width;
                    this.editingFillStyle = this.selectedObject.fill;
                }
                return;
            }
        }
        this.deselectObject();
    }

    // Method: deselectObject ()
    // Deselects the currently selected object
    deselectObject() {
        this.selectedObject = null;
        this.currentPlayer = null;
        this.drawingShape = DEFAULT_SHAPE;
        this.drawingColor = DEFAULT_COLOR;
        this.drawingStrokeWidth = DEFAULT_STROKE_WIDTH;
        this.drawingFillStyle = DEFAULT_FILL_STYLE;
        this.editingColor = DEFAULT_COLOR;
        this.editingStrokeWidth = DEFAULT_STROKE_WIDTH;
        this.editingFillStyle = DEFAULT_FILL_STYLE;
        this.editingPlayerPosition = DEFAULT_PLAYER_POSITION;
        this.editingPlayerSize = DEFAULT_PLAYER_SIZE;
    }        


    // Method: changeSize (selectedObject, size)
    // Changes the size of the selected object to the given size
    changeSize(selectedObject: Player | LineSegment | Point | null, size: number) {
        if (selectedObject == null) {
            return;
        }

        if (selectedObject instanceof Player) {
            selectedObject.size = size;
        }

        if (selectedObject instanceof LineSegment) {
            selectedObject.width = size;
        }
    }
    // Method: changeColor (selectedObject, color)
    // Changes the color of the selected object to the given color
    changeColor(selectedObject: Player | LineSegment | Point | null, color: string) {
        if (selectedObject == null) {
            return;
        }
        if (selectedObject instanceof Player) {
            selectedObject.color = color;
        }
        if (selectedObject instanceof LineSegment) {
            selectedObject.color = color;
        }
    }

    // Method: changeFillStyle (selectedObject, fillStyle)
    // Changes the fill style of the selected object to the given fillStyle
    changeFillStyle(selectedObject: Player | LineSegment | Point | null, fillStyle: string) {
        if (selectedObject == null || selectedObject instanceof Player) {
            return;
        }
        if (selectedObject instanceof LineSegment) {
            selectedObject.fill = fillStyle;
        }
    }

    // Method: changeShape (selectedObject, shape)
    // Changes the shape of the selected object to the given shape
    changeShape(selectedObject: Player | LineSegment | Point | null, shape: string) {
        if (selectedObject == null) {
            return;
        }
        if (selectedObject instanceof Player) {
            selectedObject.shape = shape;
        }
    }

    // Method: changeEndStyle (selectedObject, endStyle)
    // Changes the end style of the selected object to the given endStyle
    changeEndStyle(selectedObject: Player | LineSegment | Point | null, endStyle: string) {
        if (selectedObject == null) {
            return;
        }
        if (selectedObject instanceof LineSegment) {
            selectedObject.endStyle = endStyle;
        }
        if (selectedObject instanceof Player) {
            selectedObject.route.endStyle = endStyle;
        }
    }

    // Method: changePosition (selectedObject, position)
    // Changes the position of the selected object to the given position
    changePosition(selectedObject: Player, position: string) {
        if (selectedObject == null) {
            return;
        }
        if (selectedObject instanceof Player) {
            selectedObject.position = position;
        }
    }

    // Method: updateEverything ()
    // Updates all the stores and redraws the canvas
    updateEverything() {
        updateDrawingStrokeWidth(this.drawingStrokeWidth);
        updateDrawingColor(this.drawingColor);
        updateDrawingFillStyle(this.drawingFillStyle);
        updateDrawingMode(this.drawingMode);
        updateDrawingShape(this.drawingShape);
        updateDrawingEndStyle(this.drawingEndStyle);
        updateEditingStrokeWidth(this.editingStrokeWidth);
        updateEditingColor(this.editingColor);
        updateEditingFillStyle(this.editingFillStyle);
        updateEditingDrawingMode(this.editingMode);
        updateEditingShape(this.editingShape);
        updateEditingEndStyle(this.editingEndStyle);
        updateEditingPlayerPosition(this.editingPlayerPosition);
        updateMode(this.mode);
        this.clear();
    }

    // Method: deletePlayer ()
    // Deletes the currently selected player if it exists
    deletePlayer() {
        if (this.selectedObject == null) {
            return;
        }
        if (this.selectedObject instanceof Player) {
            let index = this.players.indexOf(this.selectedObject);
            this.players.splice(index, 1);
            this.selectedObject = null;
            this.currentPlayer = null;
        }
        this.clear();
    }


    // Method: init ()
    // Initializes the app state and sets up subscriptions to store changes
    init() {
        this.background_image = new Image();
        this.background_image.src = "/images/background.png";

        // Once the Image is loaded, draw it to the canvas
        this.background_image.onload = () => {
            this.drawBackground();
        };

        // Functions to trigger when store values change
        drawingStrokeWidth.subscribe(value => {
            this.drawingStrokeWidth = value;
            updateDrawingStrokeWidth(this.drawingStrokeWidth);
            this.clear();
        });

        drawingColor.subscribe(value => {
            this.drawingColor = value;
            updateDrawingColor(this.drawingColor);
            this.clear();
        });

        drawingFillStyle.subscribe(value => {
            this.drawingFillStyle = value;
            updateDrawingFillStyle(this.drawingFillStyle);
            this.clear();
        });

        drawingMode.subscribe(value => {
            this.drawingMode = value;
            updateDrawingMode(this.drawingMode);
            this.clear();
        });

        drawingShape.subscribe(value => {
            this.drawingShape = value;
            updateDrawingShape(this.drawingShape);
            this.clear();
        });

        drawingEndStyle.subscribe(value => {
            this.drawingEndStyle = value;
            updateDrawingEndStyle(this.drawingEndStyle);
            this.clear();
        });

        editingStrokeWidth.subscribe(value => {
            this.editingStrokeWidth = value;
            updateEditingStrokeWidth(this.editingStrokeWidth);
            this.changeSize(this.selectedObject, this.editingStrokeWidth);
            this.clear();
        });

        editingColor.subscribe(value => {
            this.editingColor = value;
            updateEditingColor(this.editingColor);
            this.changeColor(this.selectedObject, this.editingColor);
            this.clear();
        });

        editingFillStyle.subscribe(value => {
            this.editingFillStyle = value;
            updateEditingFillStyle(this.editingFillStyle);
            this.changeFillStyle(this.selectedObject, this.editingFillStyle);
            this.clear();
        });

        editingDrawingMode.subscribe(value => {
            this.editingMode = value;
            updateDrawingMode(this.editingMode);
            this.clear();
        });

        editingShape.subscribe(value => {
            this.editingShape = value;
            updateEditingShape(this.editingShape);
            this.changeShape(this.selectedObject, this.editingShape);
            this.clear();
        });

        editingEndStyle.subscribe(value => {
            this.editingEndStyle = value;
            updateEditingEndStyle(this.editingEndStyle);
            this.changeEndStyle(this.selectedObject, this.editingEndStyle);
            this.clear();
        });

        editingPlayerPosition.subscribe(value => {
            this.editingPlayerPosition = value;
            updateEditingPlayerPosition(this.editingPlayerPosition);
            if (this.selectedObject instanceof Player) {
                this.changePosition(this.selectedObject, this.editingPlayerPosition);
            }
            this.clear();
        });


        console.log("App initialized");
    }
 }

        

    

    



