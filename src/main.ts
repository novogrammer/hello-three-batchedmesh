import './style.css'

import * as THREE from "three";
import Stats from "stats-gl";

const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
<canvas id="view"></canvas>
`;
const stats = new Stats();
app.appendChild( stats.dom );

interface UpdaterParams{
  object3d:THREE.Object3D;
  time:number;
  // deltaTime:number;
};
type Updater = (params:UpdaterParams)=>void;

async function mainAsync(){
  const canvas=document.querySelector<HTMLCanvasElement>("#view")!;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    // alpha: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  stats.init( renderer );


  const scene = new THREE.Scene();

  const ambientLight= new THREE.AmbientLight(0xffffff,0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff,1);
  directionalLight.position.set(10,10,10);
  scene.add(directionalLight);

  // {
  //   const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  //   const material = new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
  //   const cube = new THREE.Mesh( geometry, material );
  //   scene.add( cube );
  //   cube.lookAt(new THREE.Vector3(1,1,1));
  // }

  let dummyScene:THREE.Scene|null=null;
  let batchedMesh:THREE.BatchedMesh|null=null;
  {
    const material=new THREE.MeshStandardMaterial( { color: 0x00ff00 } );
    const materialDummy=new THREE.MeshStandardMaterial( { color: 0xff00ff } );
    const MAX_GEOMETRY_COUNT=10000;
    const MAX_VERTEX_COUNT=MAX_GEOMETRY_COUNT*6*4;
    const IS_BATCHED=true;
    batchedMesh=new THREE.BatchedMesh(MAX_GEOMETRY_COUNT,MAX_VERTEX_COUNT);
    batchedMesh.visible=IS_BATCHED;
    batchedMesh.material=material;
    scene.add(batchedMesh);

    dummyScene=new THREE.Scene();
    dummyScene.visible=!IS_BATCHED;
    // scene.add(dummyScene);

    const branchGeometry=new THREE.BoxGeometry(0.5,1,0.5);
    branchGeometry.translate(0,0.5,0);
    function makeMesh(){
      const mesh=new THREE.Mesh(branchGeometry,materialDummy);
      return mesh;
    }
    const MAX_DEPTH=11;

    const updater1:Updater=({object3d,time}:UpdaterParams)=>{
      object3d.position.y=1;
      object3d.rotation.z=(30+Math.sin(time)*5)*THREE.MathUtils.DEG2RAD;
      object3d.scale.set(0.8,0.8,0.8);
    }

    const updater2:Updater=({object3d,time}:UpdaterParams)=>{
      object3d.position.y=1;
      object3d.rotation.z=-(40+Math.sin(time)*5)*THREE.MathUtils.DEG2RAD;
      object3d.scale.set(0.7,0.7,0.7);
    }

    function appendBranch(parent:THREE.Object3D,depth=0){


      const meshA=makeMesh();
      meshA.userData.updater=updater1;
      parent.add(meshA);
      const meshB=makeMesh();
      meshB.userData.updater=updater2;
      parent.add(meshB);
      if(depth<MAX_DEPTH){
        appendBranch(meshA,depth+1);
        appendBranch(meshB,depth+1);
      }
    }

    const meshBase=makeMesh();
    dummyScene.add(meshBase);
    appendBranch(meshBase);


    let geometryCount=0;
    dummyScene.traverse((object3d)=>{
      if(object3d instanceof THREE.Mesh){
        batchedMesh.addGeometry(object3d.geometry);
        geometryCount++;
      }
    });
    console.log(`geometryCount: ${geometryCount}`);


    
  }



  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
  camera.position.set(0,2,5);

  function render(timeMS: DOMHighResTimeStamp, _frame: XRFrame){
    const time=timeMS/1000;
    if(dummyScene){

      if(batchedMesh){
        let index=0;
        dummyScene.traverse((object3d:THREE.Object3D)=>{
          if(object3d.userData.updater){
            const updater=object3d.userData.updater as Updater;
            updater({object3d,time})
          }
        });
        dummyScene.updateWorldMatrix(false,true);
        dummyScene.traverse((object3d:THREE.Object3D)=>{
          if(object3d instanceof THREE.Mesh){
            batchedMesh.setMatrixAt(index,object3d.matrixWorld)
            index++;
          }
        });
        }
  
    }

    renderer.render(scene,camera);
    stats.update();
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

