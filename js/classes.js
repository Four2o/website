/**
 * UI and helper classes for the Allotment Planner.
 * Depends on: THREE, Tweakpane, window.UNITS, window.METRIC_SUBDIVISIONS, window.IMPERIAL_SUBDIVISIONS,
 *             window.convertFromMeters, window.convertToMeters, window.clock, window.THEMES,
 *             window.STRUCTURES, window.PLANTS
 */
(function() {
    'use strict';
    const UNITS = window.UNITS;
    const METRIC_SUBDIVISIONS = window.METRIC_SUBDIVISIONS;
    const IMPERIAL_SUBDIVISIONS = window.IMPERIAL_SUBDIVISIONS;
    const convertFromMeters = window.convertFromMeters;
    const convertToMeters = window.convertToMeters;
    const clock = window.clock;
    const STRUCTURES = window.STRUCTURES;
    const PLANTS = window.PLANTS;

    class UndoManager {
        constructor(world) {
            this.world = world;
            this.undoStack = [];
            this.redoStack = [];
            this.maxHistory = 50;
            this.isUndoingOrRedoing = false;
            this.undoBtn = document.getElementById('undoBtn');
            this.redoBtn = document.getElementById('redoBtn');
            this.undoBtn.addEventListener('click', () => this.undo());
            this.redoBtn.addEventListener('click', () => this.redo());
            this.updateButtons();
        }
        saveState() {
            if (this.isUndoingOrRedoing) return;
            const currentState = this.world.getCurrentLayoutData();
            this.undoStack.push(JSON.stringify(currentState));
            if (this.undoStack.length > this.maxHistory) this.undoStack.shift();
            this.redoStack = [];
            this.updateButtons();
        }
        undo() {
            if (this.undoStack.length <= 1) return;
            this.isUndoingOrRedoing = true;
            const currentState = this.undoStack.pop();
            this.redoStack.push(currentState);
            const previousState = this.undoStack[this.undoStack.length - 1];
            this.world.rebuildSceneFromData(JSON.parse(previousState), "Undo");
            this.isUndoingOrRedoing = false;
            this.updateButtons();
        }
        redo() {
            if (this.redoStack.length === 0) return;
            this.isUndoingOrRedoing = true;
            const nextState = this.redoStack.pop();
            this.undoStack.push(nextState);
            this.world.rebuildSceneFromData(JSON.parse(nextState), "Redo");
            this.isUndoingOrRedoing = false;
            this.updateButtons();
        }
        clear() {
            this.undoStack = [];
            this.redoStack = [];
            this.saveState();
            this.updateButtons();
        }
        updateButtons() {
            this.undoBtn.disabled = this.undoStack.length <= 1;
            this.redoBtn.disabled = this.redoStack.length === 0;
        }
    }

    class AxisIndicator {
        constructor(container) {
            this.container = container;
            this.width = 100;
            this.height = 100;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 10);
            this.camera.up.set(0, 1, 0);
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.renderer.setSize(this.width, this.height);
            this.renderer.setPixelRatio(1);
            this.container.style.width = this.width + 'px';
            this.container.style.height = this.height + 'px';
            this.container.appendChild(this.renderer.domElement);
            const length = 1, headLength = 0.2, headWidth = 0.1;
            this.scene.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), length, 0xff0000, headLength, headWidth));
            this.scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), length, 0x00ff00, headLength, headWidth));
            this.scene.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0, 0), length, 0x0000ff, headLength, headWidth));
        }
        update(mainCamera) {
            const camDistance = 3;
            const basePosition = new THREE.Vector3(0, 0, camDistance);
            basePosition.applyQuaternion(mainCamera.quaternion);
            this.camera.position.copy(basePosition);
            this.camera.lookAt(0, 0, 0);
            this.renderer.render(this.scene, this.camera);
        }
        onResize() {
            this.camera.aspect = this.width / this.height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.width, this.height);
        }
    }

    class Loop {
        constructor(camera, scene, renderer) { this.camera = camera; this.scene = scene; this.renderer = renderer; this.updatables = []; }
        start(world) {
            this.renderer.setAnimationLoop(() => {
                this.tick();
                this.renderer.render(this.scene, this.camera);
                if (world && world.axisIndicator && world.axisIndicatorVisible) world.axisIndicator.update(world.camera);
            });
        }
        tick() { const delta = clock.getDelta(); for (const object of this.updatables) { if (object.update) object.update(delta); } }
    }

    class Rulers {
        constructor() { this.container = new THREE.Group(); this.container.position.y = 0.01; }
        _createTextSprite(text, position, color = 'white', fontSize = 48) {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            context.font = `${fontSize}px Arial`;
            const textWidth = context.measureText(text).width;
            canvas.width = textWidth + 16; canvas.height = fontSize + 16;
            context.font = `${fontSize}px Arial`; context.fillStyle = color; context.textAlign = 'center'; context.textBaseline = 'middle';
            context.fillText(text, canvas.width / 2, canvas.height / 2);
            const texture = new THREE.CanvasTexture(canvas);
            const spriteMaterial = new THREE.SpriteMaterial({ map: texture, depthTest: true, transparent: true });
            const sprite = new THREE.Sprite(spriteMaterial);
            sprite.scale.set(canvas.width * 0.005, canvas.height * 0.005, 1.0);
            sprite.position.copy(position);
            return sprite;
        }
        update(width, length, unitsKey, theme, subdivisions = 1) {
            while (this.container.children.length > 0) this.container.remove(this.container.children[0]);
            const cF = UNITS[unitsKey].factor, unitSymbol = UNITS[unitsKey].symbol;
            const majorTickLength = 0.4, minorTickLength = 0.2, textOffsetFromEdge = 0.6, unitsLabelOffset = 0.5;
            const hL = length / 2, plotEdgeZ = -hL, wT = [];
            for (let i = 0; i <= width; i += subdivisions) {
                const xP = -width / 2 + i;
                if (Math.abs(i - Math.round(i)) < 0.001) {
                    wT.push(new THREE.Vector3(xP, 0, plotEdgeZ), new THREE.Vector3(xP, 0, plotEdgeZ - majorTickLength));
                    this.container.add(this._createTextSprite(Math.round(i * cF).toString(), new THREE.Vector3(xP, 0, plotEdgeZ - textOffsetFromEdge), theme.text));
                } else { wT.push(new THREE.Vector3(xP, 0, plotEdgeZ), new THREE.Vector3(xP, 0, plotEdgeZ - minorTickLength)); }
            }
            this.container.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wT), new THREE.LineBasicMaterial({ color: theme.text, transparent: true })));
            this.container.add(this._createTextSprite(`(${unitSymbol})`, new THREE.Vector3(width / 2 + unitsLabelOffset, 0, plotEdgeZ - textOffsetFromEdge), theme.text));
            const hW = width / 2, plotEdgeX = -hW, lT = [];
            for (let i = 0; i <= length; i += subdivisions) {
                const zP = -length / 2 + i;
                if (Math.abs(i - Math.round(i)) < 0.001) {
                    lT.push(new THREE.Vector3(plotEdgeX, 0, zP), new THREE.Vector3(plotEdgeX - majorTickLength, 0, zP));
                    const tS = this._createTextSprite(Math.round(i * cF).toString(), new THREE.Vector3(plotEdgeX - textOffsetFromEdge, 0, zP), theme.text);
                    tS.center.set(1.0, 0.5); this.container.add(tS);
                } else { lT.push(new THREE.Vector3(plotEdgeX, 0, zP), new THREE.Vector3(plotEdgeX - minorTickLength, 0, zP)); }
            }
            this.container.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(lT), new THREE.LineBasicMaterial({ color: theme.text, transparent: true })));
            this.container.add(this._createTextSprite(`(${unitSymbol})`, new THREE.Vector3(plotEdgeX - textOffsetFromEdge, 0, length / 2 + unitsLabelOffset), theme.text));
        }
    }

    class ControlsPanel {
        constructor(world) {
            this.world = world;
            this.pane = new Tweakpane.Pane({ title: 'Allotment Controls', container: document.querySelector('#main-controls-container') });
            this.config = {
                units: 'm', width: 10, length: 15,
                gridVisible: true, rulersVisible: true, snapToGrid: true,
                darkMode: false, subdivisions: 1.0,
                gridOpacity: 0.3, rulerOpacity: 1.0, viewLocked: false,
                showLabels: false, isometricZoom: 1.0, timeOfDay: 12.0, showAxisIndicator: true,
            };
            const plotFolder = this.pane.addFolder({ title: 'Plot Dimensions' });
            const unitOptions = Object.keys(UNITS).reduce((acc, key) => { acc[UNITS[key].label] = key; return acc; }, {});
            plotFolder.addInput(this.config, 'units', { options: unitOptions }).on('change', (ev) => this.onUnitsChange(ev.value));
            this.widthInput = plotFolder.addInput(this.config, 'width', { label: 'Width (m)', min: 1, max: 100, step: 1 });
            this.lengthInput = plotFolder.addInput(this.config, 'length', { label: 'Length (m)', min: 1, max: 100, step: 1 });
            this.widthInput.on('change', () => this.updatePlotFromUI()); this.lengthInput.on('change', () => this.updatePlotFromUI());
            this.viewFolder = this.pane.addFolder({ title: 'View Options' });
            this.subdivisionInput = null; this.updateSubdivisionInput();
            this.viewFolder.addInput(this.config, 'timeOfDay', { label: 'Time of Day', min: 5, max: 21, step: 0.1 }).on('change', (ev) => this.world.updateSunPosition(ev.value));
            this.viewFolder.addInput(this.config, 'gridVisible').on('change', (ev) => this.world.setGridVisible(ev.value));
            this.viewFolder.addInput(this.config, 'gridOpacity', { min: 0, max: 1, step: 0.05 }).on('change', (ev) => this.world.setGridOpacity(ev.value));
            this.viewFolder.addInput(this.config, 'rulersVisible').on('change', (ev) => this.world.setRulersVisible(ev.value));
            this.viewFolder.addInput(this.config, 'rulerOpacity', { min: 0, max: 1, step: 0.05 }).on('change', (ev) => this.world.setRulerOpacity(ev.value));
            this.viewFolder.addInput(this.config, 'darkMode').on('change', (ev) => this.world.setTheme(ev.value));
            this.viewFolder.addInput(this.config, 'showLabels', { label: 'Show Labels' }).on('change', (ev) => this.world.updateAllObjectLabelsVisibility());
            this.viewFolder.addInput(this.config, 'showAxisIndicator', { label: 'Show Axis Indicator' }).on('change', (ev) => this.world.toggleAxisIndicator(ev.value));
            this.viewFolder.addButton({ title: 'Plant Summary' }).on('click', () => this.world.togglePlantSummaryPanel());
            this.viewFolder.addButton({ title: 'Top-Down View' }).on('click', () => this.world.goToTopView());
            this.viewFolder.addButton({ title: 'Isometric View' }).on('click', () => this.world.goToIsometricView());
            this.viewFolder.addInput(this.config, 'isometricZoom', { label: 'Isometric Zoom', min: 0.1, max: 5.0, step: 0.1 }).on('change', () => this.world._updateIsometricCameraPosition());
            this.viewFolder.addInput(this.config, 'viewLocked', { label: 'Lock View' }).on('change', (ev) => this.world.setViewLock(ev.value));
            this.pane.addFolder({ title: 'Interaction' }).addInput(this.config, 'snapToGrid');
        }
        updateSubdivisionInput() {
            if (this.subdivisionInput) this.subdivisionInput.dispose();
            const currentSystem = UNITS[this.config.units].system;
            const newOptions = currentSystem === 'metric' ? METRIC_SUBDIVISIONS : IMPERIAL_SUBDIVISIONS;
            if (!Object.values(newOptions).includes(this.config.subdivisions)) this.config.subdivisions = currentSystem === 'metric' ? 1.0 : 0.3048;
            this.subdivisionInput = this.viewFolder.addInput(this.config, 'subdivisions', { label: 'Subdivisions', options: newOptions });
            this.subdivisionInput.on('change', () => this.updatePlotFromUI());
            this.pane.refresh();
        }
        onUnitsChange(newUnitsKey) {
            const oldUnitsKey = this.config.units;
            const newUnitInfo = UNITS[newUnitsKey];
            const widthInMeters = convertToMeters(this.config.width, oldUnitsKey);
            const lengthInMeters = convertToMeters(this.config.length, oldUnitsKey);
            this.config.width = parseFloat(convertFromMeters(widthInMeters, newUnitsKey).toFixed(1));
            this.config.length = parseFloat(convertFromMeters(lengthInMeters, newUnitsKey).toFixed(1));
            this.config.units = newUnitsKey;
            this.widthInput.label = `Width (${newUnitInfo.symbol})`;
            this.lengthInput.label = `Length (${newUnitInfo.symbol})`;
            this.updateSubdivisionInput();
            this.pane.refresh();
            this.updatePlotFromUI();
            this.world.updatePlantSummaryPanel();
            if (this.world.selectedObject) this.world._updateDimensionLabels();
            this.world.undoManager.saveState();
        }
        updatePlotFromUI() {
            const widthInMeters = convertToMeters(this.config.width, this.config.units);
            const lengthInMeters = convertToMeters(this.config.length, this.config.units);
            this.world.updatePlot(widthInMeters, lengthInMeters, this.config.units, this.config.subdivisions);
        }
    }

    class Sidebar {
        constructor(world) {
            this.world = world;
            this.selectedItem = null;
            const sidebarContainer = document.querySelector('#sidebar-container');
            this.searchInput = document.createElement('input');
            this.searchInput.id = 'sidebar-search-input';
            this.searchInput.type = 'text';
            this.searchInput.placeholder = 'Search...';
            sidebarContainer.prepend(this.searchInput);
            this.paneContainer = document.querySelector('#sidebar-pane-container');
            this.pane = new Tweakpane.Pane({ container: this.paneContainer });
            this.pane.title = "Placeables";
            this.allButtons = [];
            this.allFolders = [];
            const structuresFolder = this.pane.addFolder({ title: 'Structures', expanded: true });
            this.allFolders.push(structuresFolder);
            STRUCTURES.forEach(item => {
                const button = structuresFolder.addButton({ title: item.name });
                button.on('click', () => { this.selectedItem = item; this.world.enterPlacementMode(item); });
                this.allButtons.push({ element: button.element, title: item.name.toLowerCase(), folder: structuresFolder });
            });
            for (const category in PLANTS) {
                const categoryFolder = this.pane.addFolder({ title: category.charAt(0).toUpperCase() + category.slice(1), expanded: false });
                this.allFolders.push(categoryFolder);
                PLANTS[category].forEach(plantDef => {
                    const button = categoryFolder.addButton({ title: plantDef.name });
                    button.on('click', () => { this.selectedItem = plantDef; this.world.enterPlacementMode(plantDef); });
                    this.allButtons.push({ element: button.element, title: plantDef.name.toLowerCase(), folder: categoryFolder });
                });
            }
            this.searchInput.addEventListener('input', (e) => this.filterItems(e.target.value));
        }
        filterItems(query) {
            const normalizedQuery = query.toLowerCase().trim();
            this.allButtons.forEach(btn => { btn.element.style.display = btn.title.includes(normalizedQuery) ? 'block' : 'none'; });
            this.allFolders.forEach(folder => {
                folder.element.style.display = this.allButtons.some(btn => btn.folder === folder && btn.element.style.display !== 'none') ? 'block' : 'none';
            });
        }
        deselect() { this.selectedItem = null; }
    }

    class InfoPanel {
        constructor() {
            this.panel = document.querySelector('#info-panel');
            this.title = document.querySelector('#info-title');
            this.details = document.querySelector('#info-details');
            this.button = document.querySelector('#info-button');
            this.button.onclick = null;
            this.button.addEventListener('click', () => this.hide());
        }
        show(title, details, buttonConfig) {
            this.title.textContent = title;
            this.details.textContent = details;
            this.button.onclick = null;
            if (buttonConfig && buttonConfig.onClick) {
                this.button.textContent = buttonConfig.text;
                this.button.style.display = 'inline-block';
                this.button.onclick = buttonConfig.onClick;
            } else {
                this.button.textContent = 'OK';
                this.button.style.display = 'inline-block';
                this.button.onclick = () => this.hide();
            }
            this.panel.classList.remove('hidden');
        }
        hide() { this.panel.classList.add('hidden'); }
    }

    window.UndoManager = UndoManager;
    window.AxisIndicator = AxisIndicator;
    window.Loop = Loop;
    window.Rulers = Rulers;
    window.ControlsPanel = ControlsPanel;
    window.Sidebar = Sidebar;
    window.InfoPanel = InfoPanel;
})();
