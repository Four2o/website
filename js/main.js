/**
 * Bootstrap and initialization for the Allotment Planner.
 * Depends on: All other js modules (structures, plants, config, utils, classes, world)
 */
(function() {
    'use strict';

    const STRUCTURES = window.STRUCTURES;
    if (!Array.isArray(STRUCTURES) || STRUCTURES.length === 0) {
        throw new Error('STRUCTURES data failed to load. Ensure js/structures.js is loaded before the main script.');
    }
    const PLANTS = window.PLANTS;
    if (!PLANTS || typeof PLANTS !== 'object' || Object.keys(PLANTS).length === 0) {
        throw new Error('PLANTS data failed to load. Ensure js/plants.js is loaded before the main script.');
    }

    function init() {
        const container = document.querySelector('#scene-container');
        const world = new window.World(container);
        window.world = world;
        world.start();
    }

    window.onload = init;

    // Info button/modal logic
    (function() {
        const infoBtn = document.getElementById('info-btn');
        const infoModal = document.getElementById('info-modal');
        const closeBtn = document.getElementById('close-info-modal');
        if (infoBtn && infoModal && closeBtn) {
            infoBtn.addEventListener('click', () => { infoModal.style.display = 'block'; });
            closeBtn.addEventListener('click', () => { infoModal.style.display = 'none'; });
        }
    })();

    // Axis indicator toggle button logic
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('axis-indicator-toggle-btn');
        if (!btn) return;
        function updateBtn() {
            try {
                if (window.world && window.world.controlsPanel && window.world.controlsPanel.config) {
                    if (window.world.controlsPanel.config.showAxisIndicator) {
                        btn.textContent = '👁️';
                        btn.title = 'Hide Axis Widget';
                    } else {
                        btn.textContent = '🚫';
                        btn.title = 'Show Axis Widget';
                    }
                }
            } catch (e) { /* Do nothing */ }
        }
        btn.addEventListener('click', function() {
            try {
                if (window.world && window.world.controlsPanel && window.world.toggleAxisIndicator) {
                    const newState = !window.world.controlsPanel.config.showAxisIndicator;
                    window.world.controlsPanel.config.showAxisIndicator = newState;
                    window.world.toggleAxisIndicator(newState);
                    updateBtn();
                }
            } catch (e) { /* Do nothing */ }
        });
        setInterval(updateBtn, 500);
        updateBtn();
    });
})();
