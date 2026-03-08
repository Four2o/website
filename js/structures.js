window.STRUCTURES = [
    { name: 'Shed', width: 2, depth: 3, height: 2.2, snappable: false, resizable: true, materialProps: { color: 0xA0522D, roughness: 0.9 } },
    { name: 'Greenhouse', width: 2, depth: 4, height: 2.5, snappable: false, resizable: true, materialProps: { color: 0x9ACD32, roughness: 0.1, transparent: true, opacity: 0.5 } },
    { name: 'Planter', width: 1, depth: 2, height: 0.5, snappable: false, resizable: true,
      materialProps: { color: 0xCD853F, roughness: 0.8, transparent: true, opacity: 0.8 },
      isHollow: true, defaultWallThickness: 0.05, defaultSoilHeight: 0.3,
      soilRows: 2, soilCols: 2
    },
    { name: 'Water Butt', width: 0.8, depth: 0.8, height: 1.2, snappable: false, resizable: false, materialProps: { color: 0x2E4034, roughness: 0.2, metalness: 0.1 } }, // Not resizable
    { name: 'Fence Section', width: 2, depth: 0.1, height: 1.0, snappable: true, resizable: true, materialProps: { color: 0x8B4513, roughness: 0.9 } },
    { name: 'Gate', width: 1.2, depth: 0.1, height: 1.2, snappable: true, resizable: true, materialProps: { color: 0x8B4513, roughness: 0.9 } },
    { name: 'Chicken Coop', width: 2.5, depth: 1.5, height: 1.8, snappable: false, resizable: true, materialProps: { color: 0xB5651D, roughness: 0.9 } },
    { name: 'Polytunnel', width: 3, depth: 6, height: 2.2, snappable: false, resizable: true, materialProps: { color: 0xF5F5F5, roughness: 0.2, transparent: true, opacity: 0.6 } },
    { name: 'Composter', width: 1, depth: 1, height: 1, snappable: false, resizable: true, materialProps: { color: 0x654321, roughness: 0.95 } },
    { name: 'EU Pallet', width: 1.2, depth: 0.8, height: 0.144, snappable: false, resizable: false, materialProps: { color: 0xDEB887, roughness: 1.0 } }, // Not resizable
];
