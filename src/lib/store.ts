import { writable } from "svelte/store";

export const mode = writable("AddPlayer");

// Setting for drawing lines
export const drawingStrokeWidth = writable(10);
export const drawingFillStyle = writable("Solid");
export const drawingMode = writable("Straight");
export const drawingColor = writable("black");
export const drawingShape = writable("Circle");
export const drawingEndStyle = writable("Arrow");

// Settings for editing Lines
export const editingStrokeWidth = writable(10);
export const editingFillStyle = writable("Solid");
export const editingDrawingMode = writable("Straight");
export const editingColor = writable("black");
export const editingShape = writable("Circle");
export const editingEndStyle = writable("Arrow");
export const editingPlayerPosition = writable("");

// function to update the values in the store

// Custom store update methods
export function updateMode(value) {
    mode.set(value);
  }
  
export function updateDrawingStrokeWidth(value) {
    drawingStrokeWidth.set(value);
  }
  
export function updateDrawingFillStyle(value) {
    drawingFillStyle.set(value);
  }
  
export function updateDrawingMode(value) {
    drawingMode.set(value);
  }
  
export function updateDrawingColor(value) {
    drawingColor.set(value);
  }

export function updateDrawingShape(value) {
    drawingShape.set(value);
    }
export function updateDrawingEndStyle(value) {
    drawingEndStyle.set(value);
    }
  
export function updateEditingStrokeWidth(value) {
    editingStrokeWidth.set(value);
    }

export function updateEditingFillStyle(value) {
    editingFillStyle.set(value);
    }

export function updateEditingDrawingMode(value) {
    editingDrawingMode.set(value);
    }

export function updateEditingColor(value) {
    editingColor.set(value);
}

export function updateEditingShape(value) {
    editingShape.set(value);
}
export function updateEditingEndStyle(value) {
    editingEndStyle.set(value);
}

export function updateEditingPlayerPosition(value) {
    editingPlayerPosition.set(value);
}





  

