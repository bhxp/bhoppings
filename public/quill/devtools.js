import { config } from './config.js';

// Dev tools for color testing
export function initDevTools() {
    // Create dev tools container
    const devTools = document.createElement('div');
    devTools.id = 'dev-tools';
    devTools.classList.add('dev-tools');
    
    if (config.devMode) {
        devTools.classList.add('active');
    }
    
    devTools.innerHTML = `
        <div class="dev-tools-header">
            <h3>Dev Tools</h3>
            <span class="close-dev-tools">&times;</span>
        </div>
        <div class="dev-tools-body">
            <div class="color-control">
                <h4>Primary Accent Color</h4>
                <div class="color-inputs">
                    <div class="color-preview primary-preview"></div>
                    <div class="color-sliders">
                        <label>R: <span class="primary-r-value">255</span>
                            <input type="range" class="primary-r-slider" min="0" max="255" value="${config.accentPrimaryColor.r * 255}">
                        </label>
                        <label>G: <span class="primary-g-value">255</span>
                            <input type="range" class="primary-g-slider" min="0" max="255" value="${config.accentPrimaryColor.g * 255}">
                        </label>
                        <label>B: <span class="primary-b-value">255</span>
                            <input type="range" class="primary-b-slider" min="0" max="255" value="${config.accentPrimaryColor.b * 255}">
                        </label>
                    </div>
                </div>
                <div class="color-presets">
                    <h4>Primary Presets</h4>
                    <div class="preset-buttons primary-presets">
                        <button data-color="0,191,165" style="background: rgb(0,191,165)"></button>
                        <button data-color="0,255,127" style="background: rgb(0,255,127)"></button>
                        <button data-color="0,163,255" style="background: rgb(0,163,255)"></button>
                        <button data-color="163,0,255" style="background: rgb(163,0,255)"></button>
                        <button data-color="255,64,129" style="background: rgb(255,64,129)"></button>
                    </div>
                </div>
                <div class="color-output">
                    <h4>Primary CSS Variables</h4>
                    <code class="primary-css-output">--accent-primary: #00bfa5;</code>
                    <button class="copy-css primary-copy">Copy</button>
                </div>
            </div>

            <div class="color-control" style="margin-top: 25px;">
                <h4>Secondary Accent Color</h4>
                <div class="color-inputs">
                    <div class="color-preview secondary-preview"></div>
                    <div class="color-sliders">
                        <label>R: <span class="secondary-r-value">255</span>
                            <input type="range" class="secondary-r-slider" min="0" max="255" value="${config.accentSecondaryColor.r * 255}">
                        </label>
                        <label>G: <span class="secondary-g-value">255</span>
                            <input type="range" class="secondary-g-slider" min="0" max="255" value="${config.accentSecondaryColor.g * 255}">
                        </label>
                        <label>B: <span class="secondary-b-value">255</span>
                            <input type="range" class="secondary-b-slider" min="0" max="255" value="${config.accentSecondaryColor.b * 255}">
                        </label>
                    </div>
                </div>
                <div class="color-presets">
                    <h4>Secondary Presets</h4>
                    <div class="preset-buttons secondary-presets">
                        <button data-color="25,204,255" style="background: rgb(25,204,255)"></button>
                        <button data-color="198,97,255" style="background: rgb(198,97,255)"></button>
                        <button data-color="255,69,69" style="background: rgb(255,69,69)"></button>
                        <button data-color="255,199,38" style="background: rgb(255,199,38)"></button>
                        <button data-color="58,255,126" style="background: rgb(58,255,126)"></button>
                    </div>
                </div>
                <div class="color-output">
                    <h4>Secondary CSS Variables</h4>
                    <code class="secondary-css-output">--accent-secondary: #00c2ff;</code>
                    <button class="copy-css secondary-copy">Copy</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(devTools);
    
    // Toggle dev tools with F8 key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F8') {
            e.preventDefault();
            devTools.classList.toggle('active');
            updatePrimaryColorPreview();
            updateSecondaryColorPreview();
        }
    });
    
    // Close button
    const closeBtn = devTools.querySelector('.close-dev-tools');
    closeBtn.addEventListener('click', function() {
        devTools.classList.remove('active');
    });
    
    // Primary Color Controls
    const primaryRSlider = devTools.querySelector('.primary-r-slider');
    const primaryGSlider = devTools.querySelector('.primary-g-slider');
    const primaryBSlider = devTools.querySelector('.primary-b-slider');
    const primaryRValue = devTools.querySelector('.primary-r-value');
    const primaryGValue = devTools.querySelector('.primary-g-value');
    const primaryBValue = devTools.querySelector('.primary-b-value');
    const primaryColorPreview = devTools.querySelector('.primary-preview');
    const primaryCssOutput = devTools.querySelector('.primary-css-output');
    const primaryCopyButton = devTools.querySelector('.primary-copy');
    
    // Secondary Color Controls
    const secondaryRSlider = devTools.querySelector('.secondary-r-slider');
    const secondaryGSlider = devTools.querySelector('.secondary-g-slider');
    const secondaryBSlider = devTools.querySelector('.secondary-b-slider');
    const secondaryRValue = devTools.querySelector('.secondary-r-value');
    const secondaryGValue = devTools.querySelector('.secondary-g-value');
    const secondaryBValue = devTools.querySelector('.secondary-b-value');
    const secondaryColorPreview = devTools.querySelector('.secondary-preview');
    const secondaryCssOutput = devTools.querySelector('.secondary-css-output');
    const secondaryCopyButton = devTools.querySelector('.secondary-copy');
    
    // Update functions
    function updatePrimaryColorPreview() {
        const r = parseInt(primaryRSlider.value);
        const g = parseInt(primaryGSlider.value);
        const b = parseInt(primaryBSlider.value);
        
        primaryRValue.textContent = r;
        primaryGValue.textContent = g;
        primaryBValue.textContent = b;
        
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        const hexColor = rgbToHex(r, g, b);
        
        primaryColorPreview.style.backgroundColor = rgbColor;
        primaryCssOutput.textContent = `--accent-primary: ${hexColor};`;
        
        // Update config values (normalized to 0-1 range)
        config.accentPrimaryColor.r = r / 255;
        config.accentPrimaryColor.g = g / 255;
        config.accentPrimaryColor.b = b / 255;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--accent-primary', hexColor);
        document.documentElement.style.setProperty('--accent-primary-rgb', `${r}, ${g}, ${b}`);
        
        updateGradients();
    }
    
    function updateSecondaryColorPreview() {
        const r = parseInt(secondaryRSlider.value);
        const g = parseInt(secondaryGSlider.value);
        const b = parseInt(secondaryBSlider.value);
        
        secondaryRValue.textContent = r;
        secondaryGValue.textContent = g;
        secondaryBValue.textContent = b;
        
        const rgbColor = `rgb(${r}, ${g}, ${b})`;
        const hexColor = rgbToHex(r, g, b);
        
        secondaryColorPreview.style.backgroundColor = rgbColor;
        secondaryCssOutput.textContent = `--accent-secondary: ${hexColor};`;
        
        // Update config values (normalized to 0-1 range)
        config.accentSecondaryColor.r = r / 255;
        config.accentSecondaryColor.g = g / 255;
        config.accentSecondaryColor.b = b / 255;
        
        // Update CSS variables
        document.documentElement.style.setProperty('--accent-secondary', hexColor);
        document.documentElement.style.setProperty('--accent-secondary-rgb', `${r}, ${g}, ${b}`);
        
        updateGradients();
    }
    
    // Event listeners for primary sliders
    primaryRSlider.addEventListener('input', updatePrimaryColorPreview);
    primaryGSlider.addEventListener('input', updatePrimaryColorPreview);
    primaryBSlider.addEventListener('input', updatePrimaryColorPreview);
    
    // Event listeners for secondary sliders
    secondaryRSlider.addEventListener('input', updateSecondaryColorPreview);
    secondaryGSlider.addEventListener('input', updateSecondaryColorPreview);
    secondaryBSlider.addEventListener('input', updateSecondaryColorPreview);
    
    // Primary preset buttons
    const primaryPresetButtons = devTools.querySelectorAll('.primary-presets button');
    primaryPresetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const colorValues = this.dataset.color.split(',');
            primaryRSlider.value = colorValues[0];
            primaryGSlider.value = colorValues[1];
            primaryBSlider.value = colorValues[2];
            updatePrimaryColorPreview();
        });
    });
    
    // Secondary preset buttons
    const secondaryPresetButtons = devTools.querySelectorAll('.secondary-presets button');
    secondaryPresetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const colorValues = this.dataset.color.split(',');
            secondaryRSlider.value = colorValues[0];
            secondaryGSlider.value = colorValues[1];
            secondaryBSlider.value = colorValues[2];
            updateSecondaryColorPreview();
        });
    });
    
    // Copy buttons
    primaryCopyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(primaryCssOutput.textContent)
            .then(() => {
                primaryCopyButton.textContent = 'Copied!';
                setTimeout(() => {
                    primaryCopyButton.textContent = 'Copy';
                }, 1500);
            });
    });
    
    secondaryCopyButton.addEventListener('click', function() {
        navigator.clipboard.writeText(secondaryCssOutput.textContent)
            .then(() => {
                secondaryCopyButton.textContent = 'Copied!';
                setTimeout(() => {
                    secondaryCopyButton.textContent = 'Copy';
                }, 1500);
            });
    });
    
    // Helper functions
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    
    function updateGradients() {
        // Update all particle colors
        if (window.updateParticleColors) {
            window.updateParticleColors(
                config.accentPrimaryColor,
                config.accentSecondaryColor
            );
        }
    }
    
    // Initialize values
    updatePrimaryColorPreview();
    updateSecondaryColorPreview();
}