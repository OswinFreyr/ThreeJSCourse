<template>
  <div class="columnContainer">
    <h1></h1>
    <SceneController/>
    <button @click="handleReloadScene" id="reloadButton">Reload Scene (wait 5s)</button>
    <div id="info">
      MOUSE to look around - ESCAPE to exit the control with mouse<br/>
      WASD/ZQSD to move and SPACE to jump
    </div>
    <canvas id="c"></canvas>
  </div>
</template>

<script>
import {initAndBuildThree} from '@/ThreeJS/canvas/EvaluationCanvas.js';
import SceneController from "@/components/SceneController.vue";
import {reloadScene} from "@/ThreeJS/BasicAndMouse";

export default {
  components: {SceneController},
  mounted() {
    const canvas = this.$el.querySelector('#c');
    const container = canvas.parentElement;
    initAndBuildThree(container, canvas);
  },
  methods: {
    handleReloadScene() {
      const canvas = this.$el.querySelector('#c');
      const container = canvas.parentElement;
      reloadScene(container, '/scene/scene.json')
          .then(() => {
            console.log("Scene reloaded successfully.");
          })
          .catch(error => {
            console.error("Error reloading scene:", error);
          });
    }
  },
  beforeUnmount() {
  }
}
</script>

<style scoped>
#info {
  position: absolute;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  text-align: center;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none;
  z-index: 1;
}
</style>