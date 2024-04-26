import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import vertexShader from "./shaders/vertexShader";
import fragmentShader from "./shaders/fragmentShader";
import { GUI } from "dat.gui";

const gui = new GUI();

const renderer = new THREE.WebGLRenderer({ antialias: true });
const composer = new EffectComposer(renderer);

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);

// Camera positioning
camera.position.set(0, 0, 5);
orbit.update();

const torus = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.3, 100, 100),
  new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2() },
      uDisplace: { value: 2 },
      uSpread: { value: 1.2 },
      uNoise: { value: 16 },
    },
  })
);

scene.add(torus);

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

gui
  .add(torus.material.uniforms.uDisplace, "value", 0, 2, 0.1)
  .name("displacement");
gui.add(torus.material.uniforms.uSpread, "value", 0, 2, 0.1).name("spread");
gui.add(torus.material.uniforms.uNoise, "value", 10, 25, 0.1).name("noise");

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.4,
  0.0001,
  0.01
);

composer.addPass(bloomPass);

const clock = new THREE.Clock();

let animate = () => {
  const elapsedTime = clock.getElapsedTime();
  torus.material.uniforms.uTime.value = elapsedTime;
  torus.rotation.z = Math.sin(elapsedTime) / 4 + elapsedTime / 20 + 5;
  composer.render();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};
animate();
