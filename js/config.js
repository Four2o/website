/**
 * Configuration constants and unit converters for the Allotment Planner.
 * Depends on: THREE (for clock)
 */
(function() {
    'use strict';
    window.UNITS = {
        m:  { factor: 1,       symbol: 'm',  system: 'metric', label: 'Meters' },
        cm: { factor: 100,     symbol: 'cm', system: 'metric', label: 'Centimeters' },
        ft: { factor: 3.28084, symbol: 'ft', system: 'imperial', label: 'Feet' },
        in: { factor: 39.3701, symbol: 'in', system: 'imperial', label: 'Inches' }
    };
    window.METRIC_SUBDIVISIONS = { '1m': 1.0, '50cm': 0.5, '25cm': 0.25, '10cm': 0.1 };
    window.IMPERIAL_SUBDIVISIONS = { '1yd': 0.9144, '1ft': 0.3048, '6in': 0.1524, '1in': 0.0254 };
    window.clock = new THREE.Clock();
    window.THEMES = {
        light: { sky: '#87CEEB', ground: '#6B8E23', text: '#222222', grid: '#444444', gradientTop: '#87CEEB', gradientBottom: '#6e9ac2' },
        dark: { sky: '#111827', ground: '#556B2F', text: '#EEEEEE', grid: '#FFFFFF', gradientTop: '#0d1a2f', gradientBottom: '#111827' }
    };
    window.convertFromMeters = function(value, toUnit) { return value * window.UNITS[toUnit].factor; };
    window.convertToMeters = function(value, fromUnit) { return value / window.UNITS[fromUnit].factor; };
})();
