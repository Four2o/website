/**
 * Starter layout templates for the Allotment Planner.
 * Each template has config (plot size, units, etc.) and objects (structures/planters).
 */
window.LAYOUT_TEMPLATES = [
    {
        id: 'empty',
        name: 'Empty plot',
        description: 'A blank plot ready for your design',
        config: { units: 'm', width: 10, length: 15, darkMode: false, gridVisible: true, rulersVisible: true, snapToGrid: true },
        objects: []
    },
    {
        id: 'small',
        name: 'Small plot',
        description: 'Compact 8×10m with shed and two planters',
        config: { units: 'm', width: 8, length: 10, darkMode: false, gridVisible: true, rulersVisible: true, snapToGrid: true },
        objects: [
            { name: 'Shed', pos: [-2.5, 0, 3.5], rotY: 0, dims: { width: 2, depth: 3, height: 2.2 } },
            { name: 'Planter', pos: [-1.5, 0, -2], rotY: 0, dims: { width: 1, depth: 2, height: 0.5, soilRows: 2, soilCols: 2 }, plants: [] },
            { name: 'Planter', pos: [1.5, 0, -2], rotY: 0, dims: { width: 1, depth: 2, height: 0.5, soilRows: 2, soilCols: 2 }, plants: [] }
        ]
    },
    {
        id: 'family',
        name: 'Family garden',
        description: '12×15m with shed, greenhouse, planters and water butt',
        config: { units: 'm', width: 12, length: 15, darkMode: false, gridVisible: true, rulersVisible: true, snapToGrid: true },
        objects: [
            { name: 'Shed', pos: [-4, 0, 5], rotY: 0, dims: { width: 2, depth: 3, height: 2.2 } },
            { name: 'Greenhouse', pos: [2, 0, 5], rotY: 0, dims: { width: 2, depth: 4, height: 2.5 } },
            { name: 'Water Butt', pos: [-5, 0, -6], rotY: 0, dims: { width: 0.8, depth: 0.8, height: 1.2 } },
            { name: 'Planter', pos: [-3, 0, -2], rotY: 0, dims: { width: 1.5, depth: 2.5, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [0, 0, -2], rotY: 0, dims: { width: 1.5, depth: 2.5, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [3, 0, -2], rotY: 0, dims: { width: 1.5, depth: 2.5, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Composter', pos: [5, 0, -6], rotY: 0, dims: { width: 1, depth: 1, height: 1 } }
        ]
    },
    {
        id: 'allotment',
        name: 'Full allotment',
        description: 'Large 15×20m with shed, greenhouse, polytunnel and multiple planters',
        config: { units: 'm', width: 15, length: 20, darkMode: false, gridVisible: true, rulersVisible: true, snapToGrid: true },
        objects: [
            { name: 'Shed', pos: [-5, 0, 7], rotY: 0, dims: { width: 2, depth: 3, height: 2.2 } },
            { name: 'Greenhouse', pos: [0, 0, 7], rotY: 0, dims: { width: 2, depth: 4, height: 2.5 } },
            { name: 'Polytunnel', pos: [-6, 0, -5], rotY: 0, dims: { width: 3, depth: 6, height: 2.2 } },
            { name: 'Water Butt', pos: [-7, 0, -9], rotY: 0, dims: { width: 0.8, depth: 0.8, height: 1.2 } },
            { name: 'Composter', pos: [7, 0, -9], rotY: 0, dims: { width: 1, depth: 1, height: 1 } },
            { name: 'Planter', pos: [-4, 0, 0], rotY: 0, dims: { width: 2, depth: 3, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [0, 0, 0], rotY: 0, dims: { width: 2, depth: 3, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [4, 0, 0], rotY: 0, dims: { width: 2, depth: 3, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [-4, 0, -3], rotY: 0, dims: { width: 2, depth: 3, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [0, 0, -3], rotY: 0, dims: { width: 2, depth: 3, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] },
            { name: 'Planter', pos: [4, 0, -3], rotY: 0, dims: { width: 2, depth: 3, height: 0.5, soilRows: 2, soilCols: 3 }, plants: [] }
        ]
    }
];
