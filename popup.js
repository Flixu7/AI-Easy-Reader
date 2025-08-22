document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('level');
    const simplifyButton = document.getElementById('simplify');
    const showOriginalToggle = document.getElementById('showOriginalToggle');
    const showOriginalCheckbox = document.getElementById('showOriginal');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const loading = document.getElementById('loading');
    const status = document.getElementById('status');

    // Add error handling
    if (!select || !simplifyButton || !showOriginalToggle || !showOriginalCheckbox || !apiKeyInput || !saveApiKeyButton) {
        console.error('Required DOM elements not found');
        return;
    }

    // Load saved settings
    chrome.storage.local.get(['simplifyLevel', 'showOriginal', 'openai_api_key'], (result) => {
        try {
            select.value = result.simplifyLevel || 'B1';
            showOriginalCheckbox.checked = result.showOriginal || false;
            if (result.openai_api_key) {
                apiKeyInput.value = result.openai_api_key;
            }
            updateToggleState();
        } catch (error) {
            console.error('Error loading settings:', error);
            showStatus('Error loading settings', 'error');
        }
    });

    // Save level when changed
    select.addEventListener('change', () => {
        try {
            chrome.storage.local.set({ simplifyLevel: select.value });
        } catch (error) {
            console.error('Error saving level:', error);
        }
    });

    // Handle toggle switch
    showOriginalToggle.addEventListener('click', () => {
        showOriginalCheckbox.checked = !showOriginalCheckbox.checked;
        updateToggleState();
        saveToggleState();
    });

    function updateToggleState() {
        if (showOriginalCheckbox.checked) {
            showOriginalToggle.classList.add('active');
        } else {
            showOriginalToggle.classList.remove('active');
        }
    }

    function saveToggleState() {
        try {
            chrome.storage.local.set({ showOriginal: showOriginalCheckbox.checked });
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (chrome.runtime.lastError) {
                    console.error('Error finding active tab:', chrome.runtime.lastError);
                    return;
                }
                if (tabs && tabs[0]) {
                    chrome.tabs.sendMessage(tabs[0].id, {
                        action: 'toggleOriginal',
                        show: showOriginalCheckbox.checked
                    }, (response) => {
                        if (chrome.runtime.lastError) {
                            console.error('Error sending message:', chrome.runtime.lastError);
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error handling toggle:', error);
        }
    }

    // Handle API key save
    saveApiKeyButton.addEventListener('click', () => {
        try {
            const apiKey = apiKeyInput.value.trim();
            if (!apiKey) {
                showStatus('Please enter an API key', 'error');
                return;
            }
            
            if (!apiKey.startsWith('sk-')) {
                showStatus('Invalid API key format. Should start with "sk-"', 'error');
                return;
            }
            
            chrome.storage.local.set({ openai_api_key: apiKey }, () => {
                showStatus('API key saved successfully', 'success');
            });
        } catch (error) {
            console.error('Error saving API key:', error);
            showStatus('Error saving API key', 'error');
        }
    });

    function showStatus(message, type = 'info') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';
        
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000); // Increased timeout for error messages
        }
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loading.classList.add('show');
            simplifyButton.disabled = true;
            simplifyButton.textContent = 'Processing...';
        } else {
            loading.classList.remove('show');
            simplifyButton.disabled = false;
            simplifyButton.textContent = 'Simplify Text';
        }
    }

    // Handle simplify button click
    simplifyButton.addEventListener('click', async () => {
        try {
            setLoading(true);
            showStatus('Starting text simplification (optimized for low token usage)...', 'info');

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            if (!tab) {
                showStatus('No active tab found', 'error');
                setLoading(false);
                return;
            }

            // Inject content script
            await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['contentScript.js']
            });

            // Send message to content script
            chrome.tabs.sendMessage(tab.id, { 
                action: 'simplify',
                level: select.value,
                showOriginal: showOriginalCheckbox.checked
            }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error('Error simplifying text:', chrome.runtime.lastError);
                    showStatus('Error: Could not communicate with page. Please refresh and try again.', 'error');
                } else if (response && response.success) {
                    if (response.count === 0) {
                        showStatus(response.message || 'No suitable text found to simplify', 'info');
                    } else {
                        const costEstimate = response.count * 0.001;
                        const errorMsg = response.errors > 0 ? ` (${response.errors} errors)` : '';
                        showStatus(`Simplified ${response.count} fragments${errorMsg} (~$${costEstimate.toFixed(3)})`, 'success');
                    }
                } else {
                    const errorMessage = response?.error || 'Unknown error occurred';
                    showStatus(`Error: ${errorMessage}`, 'error');
                }
                setLoading(false);
            });
        } catch (error) {
            console.error('Error during operation:', error);
            showStatus(`Error: ${error.message}`, 'error');
            setLoading(false);
        }
    });
});
  