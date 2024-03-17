<template>
  <div class="columnContainer">
    <h1>Canvas 2</h1>
    <SceneController/>
    <div class="optionsContainer">
      <button @click="resetCubePosition">Reset Cube Position</button>
      <div class="checkboxContainer">
        <label for="isMovingCheckbox">Make move</label>
        <input type="checkbox" id="isMovingCheckbox" @change="setMoving($event.target.checked)">
      </div>

      <button @click="resetCubeRotation">Reset Cube Rotation</button>
      <div class="checkboxContainer">
        <label for="isMovingCheckboxOnX">Rotate on X</label>
        <input type="checkbox" id="isMovingCheckboxOnX" @change="setMovingOnX($event.target.checked)">
      </div>
      <div class="checkboxContainer">
        <label for="isMovingCheckboxOnX">Rotate on Y</label>
        <input type="checkbox" id="isMovingCheckboxOnY" @change="setMovingOnY($event.target.checked)">
      </div>
      <div class="checkboxContainer">
        <label for="isMovingCheckboxOnX">Rotate on Z</label>
        <input type="checkbox" id="isMovingCheckboxOnZ" @change="setMovingOnZ($event.target.checked)">
      </div>
    </div>

    <canvas id="c"></canvas>
  </div>
</template>

<script>
import {initAndBuildThree, resetCubePosition, setMoving, resetCubeRotation, setMovingOnX, setMovingOnY, setMovingOnZ} from '@/ThreeJS/canvas/Canvas2.js';
import SceneController from "@/components/SceneController.vue";
export default {
  components: {SceneController},
  mounted() {
    const canvas = this.$el.querySelector('#c');
    const container = canvas.parentElement;
    initAndBuildThree(container);
  },
  methods: {setMoving, resetCubePosition, resetCubeRotation, setMovingOnZ, setMovingOnY, setMovingOnX},
  beforeUnmount() {

  }
}
</script>

<style scoped>

</style>