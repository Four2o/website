/**
 * Bootstrap and initialization for the Allotment Planner.
 * Depends on: All other js modules (logger, structures, plants, config, utils, classes, world)
 */
(function() {
    'use strict';

    const log = window.AppLogger || {
        error: (msg, ctx) => { console.error('[Allotment]', msg, ctx || ''); },
        warn: (msg, ctx) => { console.warn('[Allotment]', msg, ctx || ''); },
        info: () => {}
    };

    function runIntegrationChecks() {
        const missing = [];
        if (typeof THREE === 'undefined') missing.push('Three.js');
        if (typeof Tweakpane === 'undefined') missing.push('Tweakpane');
        if (typeof anime === 'undefined') missing.push('Anime.js');
        if (!window.STRUCTURES || !Array.isArray(window.STRUCTURES) || window.STRUCTURES.length === 0) missing.push('STRUCTURES (js/structures.js)');
        if (!window.PLANTS || typeof window.PLANTS !== 'object' || Object.keys(window.PLANTS).length === 0) missing.push('PLANTS (js/plants.js)');
        if (!window.UNITS) missing.push('UNITS (js/config.js)');
        if (typeof window.createCamera !== 'function') missing.push('createCamera (js/utils.js)');
        if (typeof window.World !== 'function') missing.push('World (js/world.js)');

        if (missing.length > 0) {
            const msg = 'Missing dependencies: ' + missing.join(', ');
            log.error(msg, { missing });
            throw new Error(msg);
        }
    }

    function init() {
        runIntegrationChecks();

        const container = document.querySelector('#scene-container');
        if (!container) {
            log.error('Scene container #scene-container not found');
            throw new Error('Scene container not found. Check index.html structure.');
        }

        try {
            const world = new window.World(container);
            window.world = world;
            world.start();
            log.info('Application started successfully');
        } catch (err) {
            log.error('Failed to initialize application', { error: err });
            throw err;
        }
    }

    window.onerror = function(message, source, lineno, colno, error) {
        log.error('Uncaught error: ' + message, {
            source,
            lineno,
            colno,
            error: error && error.stack
        });
        return false;
    };

    window.onunhandledrejection = function(event) {
        log.error('Unhandled promise rejection', { reason: event.reason });
    };

    window.showToast = function(message, durationMs) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.textContent = message;
        toast.classList.remove('hidden');
        clearTimeout(window._toastTimeout);
        window._toastTimeout = setTimeout(() => {
            toast.classList.add('hidden');
        }, durationMs || 2000);
    };

    window.onload = function() {
        try {
            init();
        } catch (err) {
            log.error('Application failed to start', { error: err });
            const container = document.querySelector('#scene-container');
            if (container) {
                container.innerHTML = '<div style="padding:2em;color:#fff;font-family:sans-serif;text-align:center;">' +
                    '<h2>Failed to load</h2>' +
                    '<p>' + (err.message || 'Unknown error') + '</p>' +
                    '<p>Check the browser console for details.</p>' +
                    '</div>';
            }
            throw err;
        }
    };

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

    // Keyboard shortcuts modal
    (function() {
        const shortcutsBtn = document.getElementById('shortcuts-btn');
        const shortcutsModal = document.getElementById('shortcuts-modal');
        const closeShortcutsBtn = document.getElementById('close-shortcuts-modal');
        function showShortcuts() {
            if (shortcutsModal) {
                shortcutsModal.classList.remove('hidden');
                closeShortcutsBtn?.focus();
            }
        }
        function hideShortcuts() {
            if (shortcutsModal) shortcutsModal.classList.add('hidden');
        }
        if (shortcutsBtn) shortcutsBtn.addEventListener('click', showShortcuts);
        if (closeShortcutsBtn) closeShortcutsBtn.addEventListener('click', hideShortcuts);
        document.addEventListener('keydown', (e) => {
            if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
                if (document.activeElement?.matches('input, textarea')) return;
                if (shortcutsModal?.classList.contains('hidden')) showShortcuts();
                else hideShortcuts();
                e.preventDefault();
            }
            if (e.key === 'Escape' && shortcutsModal && !shortcutsModal.classList.contains('hidden')) {
                hideShortcuts();
            }
        });
    })();

    // Axis indicator toggle button logic + left tab switching
    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('axis-indicator-toggle-btn');
        if (btn) {
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
        }

        // Left tab switching for Settings / Save & Load / Reports
        const tabBar = document.getElementById('left-tabs');
        if (tabBar) {
            const buttons = Array.from(tabBar.querySelectorAll('.left-tab-button'));
            const panels = Array.from(document.querySelectorAll('.left-tab-panel'));
            function activate(targetId) {
                panels.forEach(p => {
                    if (p.id === targetId) p.classList.add('is-active');
                    else p.classList.remove('is-active');
                });
                buttons.forEach(b => {
                    if (b.getAttribute('data-target') === targetId) b.classList.add('is-active');
                    else b.classList.remove('is-active');
                });
            }
            buttons.forEach(btnEl => {
                btnEl.addEventListener('click', () => {
                    const target = btnEl.getAttribute('data-target');
                    if (target) activate(target);
                });
            });
        }
    });
})();
