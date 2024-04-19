import './style.css'

import * as THREE from "three";

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<canvas id="view"></canvas>
`;

async function mainAsync(){
  const canvas=document.querySelector<HTMLCanvasElement>("#view")!;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    // alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const ambientLight= new THREE.AmbientLight(0xffffff,0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff,1);
  directionalLight.position.set(10,10,10);
  scene.add(directionalLight);

  {
    const geometry = new THREE.BoxGeometry( 1, 1, 1 );
    const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.lookAt(new THREE.Vector3(1,1,1));
  }



  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.z=5;

  function render(_time: DOMHighResTimeStamp, _frame: XRFrame){
    // if(mesh && mesh.morphTargetInfluences){
    //   mesh.morphTargetInfluences[0]=Math.sin(time/1000*0.3)*0.5+0.5;
    //   mesh.morphTargetInfluences[1]=Math.sin(time/1000*0.5)*0.5+0.5;
    // }
    // if(mixer){
    //   mixer.setTime(time/1000);
    // }

    renderer.render(scene,camera);
  }
  renderer.setAnimationLoop(render);



  function onWindowResize() {
  
    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect=window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  
  }
  window.addEventListener("resize",onWindowResize);

}

mainAsync().catch((error)=>{
  console.error(error);
});

