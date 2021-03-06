class Scene {
    constructor() {

    }

    init() {
        let dom = document.getElementById('center');

        let w = Math.floor(dom.clientWidth);
        let h = Math.floor(dom.clientHeight);

        let scene = new THREE.Scene();
        let camera = new THREE.PerspectiveCamera( 75, w / h, 0.1, 1000 );

        let directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
        scene.add( directionalLight );
        scene.add(new THREE.AmbientLight( 0x888888 ));

        let renderer = new THREE.WebGLRenderer();
        renderer.setSize( w, h );
        dom.appendChild( renderer.domElement );
        
        cameraLookAt(camera, 132,77,132, 0,1,0, 64,32,64);

        var controls = new THREE.OrbitControls(camera, renderer.domElement);
        //controls.target.set(64,32,64);
        controls.target.set(64,20,64);
        controls.update();

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.controls = controls;

        SELECTION.init(renderer.domElement);

        let obs = new ResizeObserver(() => {
            //console.log(dom.clientWidth + " " + dom.clientHeight);
            renderer.setSize(dom.clientWidth, dom.clientHeight);
        });
        obs.observe(dom);

        this.visibleLayers = {};
        this.features = {}; // key: { visible: true, instance: <> }

        this.updateLayerVisibility();
        $('#layers-list').tree({
            onCheck: (e) => {
                this.updateLayerVisibility();
            }
        });

        animate();
    }

    updateLayerVisibility() {
        let layers = $('#layers-list').tree('getChecked');
        this.visibleLayers = {};
        for (let i of layers) {
            this.visibleLayers[i.id] = true;
        }

        for (let f in this.features) {
            if (this.features[f].visible && !this.visibleLayers[f]) {
                this.scene.remove(this.features[f].instance);
                this.features[f].visible = false;
            }
            if (!this.features[f].visible && this.visibleLayers[f]) {
                this.scene.add(this.features[f].instance);
                this.features[f].visible = true;
            }
        }
    }
    
    setTerrain(terrain) {
        // mesh, wireframe, walls, roofs
        for (let i of ['layer-terrain', 'layer-grid', 'layer-walls', 'layer-roofs']) {
            if (this.features[i] && this.features[i].visible) this.scene.remove(this.features[i].instance);
        }

        this.features['layer-terrain'] = { visible: false, instance: terrain.mesh };
        this.features['layer-grid'] = { visible: false, instance: terrain.wireframe };
        this.features['layer-walls'] = { visible: false, instance: terrain.walls };
        this.features['layer-roofs'] = { visible: false, instance: terrain.roofs };

        this.updateLayerVisibility();

        this.loaded_terrain = terrain;
    }

    setObjects(objects) {
        for (let i of ['layer-scenery-trees', 'layer-scenery-skills', 'layer-scenery-decoration', 'layer-scenery-misc', 'layer-scenery-unique']) {
            if (this.features[i] && this.features[i].visible) this.scene.remove(this.features[i].instance);
        }

        this.features['layer-scenery-trees'] = { visible: false, instance: objects.trees };
        this.features['layer-scenery-skills'] = { visible: false, instance: objects.skills };
        this.features['layer-scenery-decoration'] = { visible: false, instance: objects.decoration };
        this.features['layer-scenery-misc'] = { visible: false, instance: objects.misc };
        this.features['layer-scenery-unique'] = { visible: false, instance: objects.unique };

        this.updateLayerVisibility();

        this.loaded_objects = objects;
    }

    getVisibleObjects() {
        let groups = [];
        for (let i of ['layer-scenery-trees', 'layer-scenery-skills', 'layer-scenery-decoration', 'layer-scenery-misc', 'layer-scenery-unique']) {
            if (this.features[i] && this.features[i].visible) groups.push(this.features[i].instance);
        }
        return groups;
    }

    frame() {
        this.renderer.render( this.scene, this.camera );
    }
}

function cameraLookAt(camera, px, py, pz, ux, uy, uz, lx, ly, lz) {
    camera.position.set(px, py, pz);
    camera.up = new THREE.Vector3(ux,uy,uz);
    camera.lookAt(lx,ly,lz);
}

function createCube(color) {
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshBasicMaterial( { wireframe: true, color: color } );
    return new THREE.Mesh( geometry, material );
}

var SCENE = new Scene();

function animate() {
    requestAnimationFrame( animate );
	SCENE.frame();
}