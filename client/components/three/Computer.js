import { CSS3DRenderer, CSS3DObject } from "three/examples/jsm/renderers/CSS3DRenderer"
import * as THREE from "three"

export class CSS3DDemo {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.webGLRenderer = new THREE.WebGLRenderer();
    this.css3DRenderer = new CSS3DRenderer();

    this.webGLRenderer.setSize('480px', '360px');
    this.webGLRenderer.setClearColor(0xffffff);

    this.css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    this.css3DRenderer.domElement.style.top = "0px";
    this.css3DRenderer.domElement.style.left = "0px";
    this.css3DRenderer.domElement.style.position = "absolute";

    var iframe = window.document.createElement( 'iframe' );
    iframe.style.width = '480px';
    iframe.style.height = '360px';
    iframe.style.border = '0px';
    iframe.src = ['https://www.youtube.com/embed/Y1B4I20SvUA?rel=0']

    const object = new CSS3DObject(iframe);
    object.position.set( 0,3,-10 );
    object.scale.set(1 / 200, 1 / 200, 1 / 200);
    this.scene.add(object);


    window.document.body.appendChild(this.webGLRenderer.domElement);
    window.document.body.appendChild(this.css3DRenderer.domElement);
    this.render();
  }

  render() {
    window.requestAnimationFrame(() => this.render());
    this.css3DRenderer.render(this.scene, this.camera);
    this.webGLRenderer.render(this.scene, this.camera);
  }
}