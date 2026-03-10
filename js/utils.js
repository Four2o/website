/**
 * Utility functions for scene, camera, renderer, and plot creation.
 * Depends on: THREE
 */
(function() {
    'use strict';
    function createCamera() {
        const c = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
        c.position.set(-20, 25, 20);
        c.lookAt(0, 0, 0);
        return c;
    }
    function createLights() {
        const hemiLight = new THREE.HemisphereLight(0xadd8e6, 0x6B8E23, 0.6);
        const sunLight = new THREE.DirectionalLight(0xffefd5, 1.2);
        sunLight.position.set(-25, 30, 15);
        sunLight.target.position.set(0, 0, 0);
        sunLight.castShadow = true;
        sunLight.shadow.camera.left = -50;
        sunLight.shadow.camera.right = 50;
        sunLight.shadow.camera.top = 50;
        sunLight.shadow.camera.bottom = -50;
        sunLight.shadow.camera.near = 0.5;
        sunLight.shadow.camera.far = 100;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
        return { hemiLight: hemiLight, sunLight: sunLight };
    }
    function createScene() { return new THREE.Scene(); }
    function createRenderer() {
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        r.physicallyCorrectLights = true;
        r.shadowMap.enabled = true;
        r.shadowMap.type = THREE.PCFSoftShadowMap;
        return r;
    }
    function createPlot() {
        const plotThickness = 0.2;
        const geometry = new THREE.BoxGeometry(1, plotThickness, 1);
        const material = new THREE.MeshStandardMaterial({ color: '#556B2F' });
        const plotMesh = new THREE.Mesh(geometry, material);
        plotMesh.position.y = -plotThickness / 2;
        plotMesh.name = 'ground';
        plotMesh.receiveShadow = true;
        const grid = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 }));
        return { ground: plotMesh, grid: grid, thickness: plotThickness };
    }
    function disposeObject(obj) {
        if (!obj) return;
        if (obj.children) {
            [...obj.children].forEach(disposeObject);
        }
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(mat => { if (mat.map) mat.map.dispose(); mat.dispose(); });
            } else {
                if (obj.material.map) obj.material.map.dispose();
                obj.material.dispose();
            }
        }
    }
    window.createCamera = createCamera;
    window.createLights = createLights;
    window.createScene = createScene;
    window.createRenderer = createRenderer;
    window.createPlot = createPlot;
    window.disposeObject = disposeObject;
})();
