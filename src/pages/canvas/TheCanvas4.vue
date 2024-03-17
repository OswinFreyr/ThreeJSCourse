<template>
  <div class="columnContainer">
    <h1>Un nuage</h1>
    <SceneController/>
    <canvas id="c"></canvas>
  </div>
</template>

<script>
import {initAndBuildThree} from '@/ThreeJS/canvas/Canvas4.js';
import SceneController from "@/components/SceneController.vue";

export default {
  components: {SceneController},
  mounted() {
    const canvas = this.$el.querySelector('#c');
    const container = canvas.parentElement;
    initAndBuildThree(container);
  },
  methods: {},
  beforeUnmount() {

  }
}
</script>

<style scoped>

</style>