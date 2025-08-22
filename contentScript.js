console.log('Content script loaded');

// Function to get API key securely
async function getApiKey() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['openai_api_key'], (result) => {
            if (chrome.runtime.lastError) {
                reject(new Error('Error accessing storage'));
                return;
            }
            
            let apiKey = result.openai_api_key;
            
            if (!apiKey) {
                // If not found, prompt user
                apiKey = prompt('Wprowadź swój OpenAI API Key:');
                if (apiKey) {
                    chrome.storage.local.set({ openai_api_key: apiKey }, () => {
                        resolve(apiKey);
                    });
                } else {
                    reject(new Error('API Key jest wymagany do działania rozszerzenia'));
                }
            } else {
                resolve(apiKey);
            }
        });
    });
}

// Function to validate API key format
function validateApiKey(apiKey) {
    return apiKey && apiKey.startsWith('sk-') && apiKey.length > 20;
}

const style = document.createElement('style');
style.textContent = `
    .simplified-text {
        background: linear-gradient(90deg, rgba(0,243,255,0.1), rgba(157,0,255,0.1)) !important;
        padding: 2px 4px;
        border-radius: 4px;
        transition: all 0.3s ease;
        border-left: 3px solid #00f3ff;
    }
    .simplified-text:hover {
        background: linear-gradient(90deg, rgba(0,243,255,0.2), rgba(157,0,255,0.2)) !important;
        transform: scale(1.02);
    }
    .original-text {
        color: #666;
        font-style: italic;
        font-size: 0.9em;
        opacity: 0.7;
    }
    .simplification-loading {
        background: rgba(0,243,255,0.05) !important;
        border-left: 3px solid #ffaa00;
        animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
        0%, 100% { opacity: 0.5; }
        50% { opacity: 1; }
    }
`;
document.head.appendChild(style);

// Function to call OpenAI API with minimal token usage
async function callOpenAI(text, targetLevel) {
    // Short, optimized prompt
    const prompt = `Simplify to CEFR ${targetLevel}: "${text}"`;

    try {
        const apiKey = await getApiKey();
        if (!validateApiKey(apiKey)) {
            throw new Error('Nieprawidłowy lub brakujący API Key.');
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Simplify English text to specified CEFR level. Return only simplified text.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 500,
                temperature: 0.1,
                presence_penalty: 0,
                frequency_penalty: 0
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        } else {
            throw new Error('Invalid API response');
        }
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        throw error;
    }
}

// Function to get text nodes with better filtering
const getTextNodes = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => {
            const parent = node.parentNode;
            if (!parent) return NodeFilter.FILTER_REJECT;
            
            const tagName = parent.nodeName;
            const className = parent.className || '';
            const classString = String(className); // Ensure it's a string
            
            // Reject more elements to reduce processing
            if (tagName === 'SCRIPT' || 
                tagName === 'STYLE' || 
                tagName === 'NOSCRIPT' ||
                tagName === 'INPUT' ||
                tagName === 'TEXTAREA' ||
                tagName === 'BUTTON' ||
                tagName === 'SELECT' ||
                tagName === 'OPTION' ||
                classString.includes('simplified-text') ||
                classString.includes('original-text') ||
                classString.includes('nav') ||
                classString.includes('menu') ||
                classString.includes('footer') ||
                classString.includes('header') ||
                classString.includes('sidebar')) {
                return NodeFilter.FILTER_REJECT;
            }
            
            const text = node.nodeValue.trim();
            
            // More strict filtering to reduce token usage
            if (text.length < 20 || text.length > 500) {
                return NodeFilter.FILTER_REJECT;
            }
            
            // Check if text contains mainly letters and is meaningful
            const letterRatio = (text.match(/[a-zA-Z]/g) || []).length / text.length;
            if (letterRatio < 0.5) {
                return NodeFilter.FILTER_REJECT;
            }
            
            // Reject common UI text
            const lowerText = text.toLowerCase();
            if (lowerText.includes('cookie') || 
                lowerText.includes('privacy') || 
                lowerText.includes('terms') ||
                lowerText.includes('subscribe') ||
                lowerText.includes('newsletter') ||
                lowerText.includes('advertisement') ||
                lowerText.includes('click here') ||
                lowerText.includes('read more')) {
                return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
        }
    });
    
    const textNodes = [];
    let node;
    let count = 0;
    const maxNodes = 20;
    
    while ((node = walker.nextNode()) && count < maxNodes) {
        textNodes.push(node);
        count++;
    }
    return textNodes;
};

// Function to simplify text
async function simplifyText(text, targetLevel) {
    try {
        const simplified = await callOpenAI(text, targetLevel);
        return simplified;
    } catch (error) {
        console.error('Error simplifying text:', error);
        throw error;
    }
}

// Function to create simplified element
function createSimplifiedElement(originalText, simplifiedText, showOriginal) {
    const container = document.createElement('span');
    container.innerHTML = `
        <span class="original-text" style="display:${showOriginal ? 'block' : 'none'}; margin-bottom: 4px;">
            <strong>Original:</strong> ${originalText}
        </span>
        <span class="simplified-text">
            <strong></strong> ${simplifiedText}
        </span>
    `;
    return container;
}

// Function to create loading element
function createLoadingElement(originalText) {
    const container = document.createElement('span');
    container.className = 'simplification-loading';
    container.innerHTML = `
        <span style="display:block; margin-bottom: 4px;">
            <strong>Original:</strong> ${originalText}
        </span>
        <span>
            <strong>Processing...</strong>
        </span>
    `;
    return container;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        console.log('Received message:', request);
        
        if (request.action === 'simplify') {
            handleSimplify(request, sendResponse);
            return true;
        } else if (request.action === 'toggleOriginal') {
            handleToggleOriginal(request, sendResponse);
            return true;
        }
    } catch (error) {
        console.error('Error handling message:', error);
        sendResponse({ success: false, error: error.message });
    }
});

// Handle text simplification with reduced batch size
async function handleSimplify(request, sendResponse) {
    try {
        const { level, showOriginal } = request;
        const textNodes = getTextNodes(document.body);
        let simplifiedCount = 0;
        let errorCount = 0;
        
        console.log(`Found ${textNodes.length} text nodes to simplify`);
        
        if (textNodes.length === 0) {
            sendResponse({ 
                success: true, 
                count: 0,
                errors: 0,
                total: 0,
                message: 'No suitable text found to simplify'
            });
            return;
        }
        
        // Process nodes in smaller batches to reduce token usage
        const batchSize = 3;
        for (let i = 0; i < textNodes.length; i += batchSize) {
            const batch = textNodes.slice(i, i + batchSize);
            
            // Add loading elements
            const loadingElements = [];
            for (const node of batch) {
                const originalText = node.nodeValue.trim();
                const loadingElement = createLoadingElement(originalText);
                node.parentNode.replaceChild(loadingElement, node);
                loadingElements.push({ element: loadingElement, originalText });
            }
            
            // Process batch sequentially to reduce API calls
            for (let j = 0; j < batch.length; j++) {
                const { element, originalText } = loadingElements[j];
                
                try {
                    const simplifiedText = await simplifyText(originalText, level);
                    const simplifiedElement = createSimplifiedElement(originalText, simplifiedText, showOriginal);
                    element.parentNode.replaceChild(simplifiedElement, element);
                    simplifiedCount++;
                    
                    // Shorter delay between requests
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (error) {
                    console.error('Error simplifying fragment:', error);
                    element.textContent = originalText;
                    errorCount++;
                }
            }
            
            // Shorter delay between batches
            if (i + batchSize < textNodes.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        console.log(`Simplified ${simplifiedCount} text fragments, errors: ${errorCount}`);
        sendResponse({ 
            success: true, 
            count: simplifiedCount,
            errors: errorCount,
            total: textNodes.length
        });
        
    } catch (error) {
        console.error('Error during simplification:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Handle original text toggle
function handleToggleOriginal(request, sendResponse) {
    try {
        const originalTexts = document.querySelectorAll('.original-text');
        originalTexts.forEach(text => {
            text.style.display = request.show ? 'block' : 'none';
        });
        sendResponse({ success: true });
    } catch (error) {
        console.error('Error toggling original text:', error);
        sendResponse({ success: false, error: error.message });
    }
}
  