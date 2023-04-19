<script>
  import { onMount } from 'svelte';
  import { AppState, Point } from "../lib/classes.ts"
  import { mode, drawingColor, drawingFillStyle, drawingMode, drawingStrokeWidth, drawingEndStyle, drawingShape,
     editingColor, editingFillStyle, editingDrawingMode, editingStrokeWidth, editingEndStyle, editingShape, editingPlayerPosition } from "../lib/store.ts";

  export let value;

//   when value turns to true, then call deletePlayer
  $: if (value) {
    appState.deletePlayer()
    value = false;
  }

  let appState;
  let canvas;
  let width = 2600;
  let height = 2000;

  onMount(() => {
    appState = new AppState(canvas, mode);

    if (appState.canvas != null) {
        // create event listener for the keydown event
        document.addEventListener('keydown', (event) => {
            appState.handleKeyDown(event);
        });

        // create event listener for the keyup event
        document.addEventListener('keyup', (event) => {
            appState.handleKeyUp(event);
        });
    }
  });

  $: if (appState) {
    appState.mode = $mode;
    appState.drawingColor = $drawingColor;
    appState.drawingFillStyle = $drawingFillStyle;
    appState.drawingMode = $drawingMode;
    appState.drawingStrokeWidth = $drawingStrokeWidth;
    appState.drawingEndStyle = $drawingEndStyle;
    appState.drawingShape = $drawingShape;

    appState.editingColor = $editingColor;
    appState.editingFillStyle = $editingFillStyle;
    appState.editingMode = $editingDrawingMode;
    appState.editingStrokeWidth = $editingStrokeWidth;
    appState.editingEndStyle = $editingEndStyle;
    appState.editingShape = $editingShape;
    appState.editingPlayerPosition = $editingPlayerPosition;

  }

    function getMousePos(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        // scale the mouse position to the canvas size
        const x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
        const y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
        let point =  new Point(x, y);
        return point;
    }

    function handleClick(event) {
        const point = getMousePos(canvas, event);
        appState.handleClick(point);
    }

    function handleMouseMove(event) {
        const point = getMousePos(canvas, event);
        appState.handleMouseMove(point);
    }

    function handleMouseDown(event) {
        const point = getMousePos(canvas, event);
        appState.handleMouseDown(point);
    }
    function handleMouseUp(event) {
        const point = getMousePos(canvas, event);
        appState.handleMouseUp(point);
    }


</script>

<canvas id="canvas" width="{width}" height="{height}" style= "width:800px;"  bind:this={canvas}
on:click={handleClick}
on:mousemove={handleMouseMove}
on:mouseleave={appState.handleMouseLeave()}
on:mouseenter={appState.handleMouseEnter()}
on:mousedown={handleMouseDown}
on:mouseup={handleMouseUp}
/>

