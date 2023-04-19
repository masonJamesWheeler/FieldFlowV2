<script>
  import { onMount } from 'svelte';
  import Play from '../components/Play.svelte';
  import { drawingColor, drawingFillStyle, drawingMode, drawingStrokeWidth, editingColor, editingFillStyle, editingDrawingMode, editingStrokeWidth, mode,
    drawingShape, editingShape, drawingEndStyle, editingEndStyle, editingPlayerPosition} from "../lib/store.ts";
	import { append } from 'svelte/internal';
	import { AppState } from '../lib/classes';

  let deletePlayer = false;

</script>

<body>
<div class = "grid grid-cols-4 h-screen w-screen">
    <div class = "col-span-1 bg-gray-200 h-full">
      <!-- Options for play-drawing mode -->
      <li class = "flex flex-col justify-center items-center gap-y-8">
        <label>
          <input type=radio bind:group={$mode} name="mode" value={"AddPlayer"}>
          Add Player
        </label>
        
        <label>
          <input type=radio bind:group={$mode} name="mode" value={"Drawing"}>
          Draw
        </label>
        
        <label>
          <input type=radio bind:group={$mode} name="mode" value={"Edit"}>
          Edit Player
        </label>
      </li>
      <!-- Options for drawing types -->
      {#if $mode === 'Drawing'}
            <div class = "p-10">
              <label for="size">Size: {$drawingStrokeWidth}</label>
              <input type="range" min="0" max="60" class="range" bind:value={$drawingStrokeWidth} id="size" name="size">
            </div>
        <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
          <label>
            <input type=radio bind:group={$drawingFillStyle} name="fillStyle" value={"Solid"}>
            Solid
          </label>
          
          <label>
            <input type=radio bind:group={$drawingFillStyle} name="fillStyle" value={"Dashed"}>
            Dashed
          </label>
          
          <label>
            <input type=radio bind:group={$drawingFillStyle} name="fillStyle" value={"Zig-Zag"}>
            Zig-Zag
          </label>
        </li>
      {/if}
      <!-- Options for line types -->
      {#if $mode === 'Drawing'}
        <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
          <label>
            <input type=radio bind:group={$drawingMode} name="drawingMode" value={"Straight"}>
            Straight
          </label>
          
          <label>
            <input type=radio bind:group={$drawingMode} name="drawingMode" value={"Curve"}>
            Curve
          </label>
        </li>
      {/if}
      <!-- Options for colors -->
      {#if $mode == 'Drawing'}
      <div class = "flex flex-col justify-center items-center gap-y-8 my-6">
        <label for="playerColor">Player Color</label>
        <input type="color" id="playerColor" name="playerColor" bind:value={$drawingColor}>
      </div>
          <!-- Options for endstyles -->
          <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
            <label>
              <input type=radio bind:group={$drawingEndStyle} name="endStyle" value={"Arrow"}>
              Arrow
            </label>
            <label>
              <input type=radio bind:group={$drawingEndStyle} name="endStyle" value={"Circle"}>
              Circle
            </label>
            
            <label>
              <input type=radio bind:group={$drawingEndStyle} name="endStyle" value={"None"}>
              None
            </label>
            </li>
      {/if}

      <!-- Options for adding players -->
      {#if $mode === 'AddPlayer'}
        <div class = "flex flex-col justify-center items-center gap-y-8 my-6">
          <label for="playerColor">Player Color</label>
          <input type="color" id="playerColor" name="playerColor" bind:value={$drawingColor}>
        </div>
                    <!-- Options for drawing Shapes -->
                    <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
                      <label>
                        <input type=radio bind:group={$drawingShape} name="shape" value={"Circle"}>
                        Circle
                      </label>
                      
                      <label>
                        <input type=radio bind:group={$drawingShape} name="shape" value={"Rectangle"}>
                        Rectangle
                      </label>
                      
                      <label>
                        <input type=radio bind:group={$drawingShape} name="shape" value={"Star"}>
                        Star
                      </label>
                      </li>
      {/if}

      <!-- Options for editing players -->
      {#if $mode === 'Edit'}
      <div class = "p-10">
        <label for="size">Size: {$editingStrokeWidth}</label>
        <input type="range" min="0" max="60" class="range" bind:value={$editingStrokeWidth} id="size" name="size">
      </div>
      <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
        <label>
          <input type=radio bind:group={$editingFillStyle} name="fillStyle" value={"Solid"}>
          Solid
        </label>
        
        <label>
          <input type=radio bind:group={$editingFillStyle} name="fillStyle" value={"Dashed"}>
          Dashed
        </label>
        
        <label>
          <input type=radio bind:group={$editingFillStyle} name="fillStyle" value={"Zig-Zag"}>
          Zig-Zag
        </label>
      </li>
    {/if}
    <!-- Options for line types -->
    {#if $mode === 'Edit'}
      <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
        <label>
          <input type=radio bind:group={$editingDrawingMode} name="drawingMode" value={"Straight"}>
          Straight
        </label>
        
        <label>
          <input type=radio bind:group={$editingDrawingMode} name="drawingMode" value={"Curve"}>
          Curve
        </label>
      </li>
    {/if}
    <!-- Options for colors -->
    {#if $mode == 'Edit'}
    <div class = "flex flex-col justify-center items-center gap-y-8 my-6">
      <label for="playerColor">Player Color</label>
      <input type="color" id="playerColor" name="playerColor" bind:value={$editingColor}>
    </div>
      
        <!-- Options for endstyles -->
        <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
          <label>
            <input type=radio bind:group={$editingEndStyle} name="endStyle" value={"Arrow"}>
            Arrow
          </label>
          <label>
            <input type=radio bind:group={$editingEndStyle} name="endStyle" value={"Circle"}>
            Circle
          </label>
          
          <label>
            <input type=radio bind:group={$editingEndStyle} name="endStyle" value={"None"}>
            None
          </label>
          </li>

          <div class = "flex">
          <input type="text" placeholder="Player Position" class="input input-bordered mx-auto" bind:value={$editingPlayerPosition}/>
          </div>

        <!-- Delete button -->
        <li class = "flex flex-row justify-center items-center gap-x-2 my-6">
          <button class = "btn btn-error" on:click={() => (deletePlayer = true)}>Delete</button>
        </li>
    {/if}
    <div class = "flex-col w-full  justify-center mx-auto">
    <p class = "mx-auto">Beta V 1.02</p>
    <p>tips:</p>
    <p> esc : stop drawing</p>
    <p>shift: angle-lock</p>
  </div>
      </div>
      <!-- Tips to delete for final -->
    <div class = "col-span-3 mx-auto my-auto">
      <Play bind:value = {deletePlayer} />
    </div>
  </div>
</body>

           




