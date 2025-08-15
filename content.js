(function() {
  'use strict';

  // Prevent multiple injections
  if (window.promptExtractorInjected) return;
  window.promptExtractorInjected = true;

  // Configuration
  const CONFIG = {
    iconSize: 56,
    defaultPosition: { x: window.innerWidth - 80, y: 100 },
    storageKey: 'promptExtractor_iconPosition',
    animationDuration: 300,
    zIndex: 999999,
    sidebarWidth: 320
  };

  // State management
  let state = {
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
    dialogOpen: false,
    iconPosition: null
  };

  // DOM elements
  let elements = {
    icon: null,
    dialog: null,
    promptsList: null
  };

  // Initialize the extension
  function init() {
    loadIconPosition();
    createFloatingIcon();
    createDialog();
    setupEventListeners();
  }

  // Load saved icon position from storage
  function loadIconPosition() {
    const saved = localStorage.getItem(CONFIG.storageKey);
    state.iconPosition = saved ? JSON.parse(saved) : CONFIG.defaultPosition;
  }

  // Save icon position to storage
  function saveIconPosition() {
    localStorage.setItem(CONFIG.storageKey, JSON.stringify(state.iconPosition));
  }

  // Create the floating icon
  function createFloatingIcon() {
    elements.icon = document.createElement('div');
    elements.icon.id = 'prompt-extractor-icon';
    elements.icon.className = 'prompt-extractor-icon';
    elements.icon.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M9 12h6m-6 4h6m2 5l-9-9 9-9M3 19.5L5.625 21 12 12l-6.375-9L3 4.5v15z" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    // Position the icon
    elements.icon.style.left = state.iconPosition.x + 'px';
    elements.icon.style.top = state.iconPosition.y + 'px';

    document.body.appendChild(elements.icon);
  }

  // Create the sidebar
  function createDialog() {
    elements.dialog = document.createElement('div');
    elements.dialog.id = 'prompt-extractor-sidebar';
    elements.dialog.className = 'prompt-extractor-sidebar';
    elements.dialog.innerHTML = `
      <div class="prompt-extractor-sidebar-header">
        <h3>Your Prompts</h3>
        <button class="prompt-extractor-close-btn" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" 
                  stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="prompt-extractor-sidebar-content">
        <div class="prompt-extractor-prompts-list" id="prompts-list">
          <div class="prompt-extractor-loading">Scanning for your prompts...</div>
        </div>
      </div>
    `;

    elements.promptsList = elements.dialog.querySelector('#prompts-list');
    document.body.appendChild(elements.dialog);
  }

  // Setup event listeners
  function setupEventListeners() {
    // Icon click handler
    elements.icon.addEventListener('click', handleIconClick);

    // Icon drag handlers
    elements.icon.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Sidebar close handler
    const closeBtn = elements.dialog.querySelector('.prompt-extractor-close-btn');
    closeBtn.addEventListener('click', closeDialog);

    // Close sidebar when clicking outside
    document.addEventListener('click', handleDocumentClick);

    // Keyboard handler for ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.dialogOpen) {
        closeDialog();
      }
    });

    // Handle window resize
    window.addEventListener('resize', handleWindowResize);
  }

  // Handle icon click (toggle dialog)
  function handleIconClick(e) {
    if (state.isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    if (state.dialogOpen) {
      closeDialog();
    } else {
      openDialog();
    }
  }

  // Handle mouse down for dragging
  function handleMouseDown(e) {
    e.preventDefault();
    state.isDragging = true;
    
    const rect = elements.icon.getBoundingClientRect();
    state.dragOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    elements.icon.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }

  // Handle mouse move for dragging
  function handleMouseMove(e) {
    if (!state.isDragging) return;

    e.preventDefault();
    
    const newX = e.clientX - state.dragOffset.x;
    const newY = e.clientY - state.dragOffset.y;

    // Constrain to viewport bounds
    const maxX = window.innerWidth - CONFIG.iconSize;
    const maxY = window.innerHeight - CONFIG.iconSize;
    
    state.iconPosition.x = Math.max(0, Math.min(newX, maxX));
    state.iconPosition.y = Math.max(0, Math.min(newY, maxY));

    elements.icon.style.left = state.iconPosition.x + 'px';
    elements.icon.style.top = state.iconPosition.y + 'px';
  }

  // Handle mouse up (end dragging)
  function handleMouseUp() {
    if (state.isDragging) {
      state.isDragging = false;
      elements.icon.style.cursor = 'grab';
      document.body.style.userSelect = '';
      saveIconPosition();
    }
  }

  // Handle document click for closing sidebar
  function handleDocumentClick(e) {
    if (!state.dialogOpen) return;
    
    // Don't close if clicking on the icon
    if (elements.icon && elements.icon.contains(e.target)) return;
    
    // Don't close if clicking inside the sidebar
    if (elements.dialog && elements.dialog.contains(e.target)) return;
    
    // Close sidebar if clicking outside
    closeDialog();
  }

  // Handle window resize
  function handleWindowResize() {
    // Ensure icon stays within bounds
    const maxX = window.innerWidth - CONFIG.iconSize;
    const maxY = window.innerHeight - CONFIG.iconSize;
    
    state.iconPosition.x = Math.min(state.iconPosition.x, maxX);
    state.iconPosition.y = Math.min(state.iconPosition.y, maxY);
    
    elements.icon.style.left = state.iconPosition.x + 'px';
    elements.icon.style.top = state.iconPosition.y + 'px';
    
    saveIconPosition();
  }

  // Open sidebar
  function openDialog() {
    state.dialogOpen = true;
    elements.dialog.classList.add('open');
    extractPrompts();
  }

  // Close sidebar
  function closeDialog() {
    state.dialogOpen = false;
    elements.dialog.classList.remove('open');
  }

  // Extract prompts from the page
  function extractPrompts() {
    elements.promptsList.innerHTML = '<div class="prompt-extractor-loading">Scanning for your prompts...</div>';

    // Use requestAnimationFrame to avoid blocking the UI
    requestAnimationFrame(() => {
      const prompts = scanForPrompts();
      displayPrompts(prompts);
    });
  }

  // Scan for prompts in the DOM
  function scanForPrompts() {
    const prompts = [];
    const seenPrompts = new Set();
    const promptElements = [];
    
    console.log('Prompt Extractor: Starting scan...');
    console.log('Current URL:', window.location.href);
    
    // Detect which chat platform we're on
    const platform = detectChatPlatform();
    console.log('Detected platform:', platform);
    
    if (platform !== 'unknown') {
      console.log(`${platform} detected - using specialized extraction`);
      return scanChatPrompts(platform);
    }
    
    // Fallback to general patterns for other sites
    const promptPatterns = [
      // Action verbs - more flexible
      /(write|create|generate|build|make|design|develop|explain|describe|analyze|summarize|show|find|search|help|assist|code|program|fix|solve|debug)\s+(.{15,})/i,
      // Questions - broader patterns
      /(how|what|why|where|when|who|which)\s+(.{10,})/i,
      // Requests and commands
      /(can you|could you|please|help me|would you|give me|show me|tell me|let me)\s+(.{15,})/i,
      // User intentions
      /(i want|i need|i'm trying|i'm looking|i would like|i'd like)\s+(.{15,})/i,
      // Questions with question marks
      /(.{15,}\?)/i
    ];

    // General selectors for non-ChatGPT sites
    const selectors = [
      // Input fields
      'textarea',
      'input[type="text"]',
      'input[type="search"]',
      '[contenteditable="true"]',
      
      // Common prompt/message classes
      '.user-message, .user-prompt, .user-input, .user-text',
      '.message.user, .chat-input, .prompt-input',
      '[data-role="user"]'
    ];

    let totalElementsScanned = 0;
    let textsFound = 0;
    
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        totalElementsScanned += elements.length;
        
        elements.forEach(element => {
          if (isHidden(element) || isExtensionElement(element)) return;

          let text = '';
          if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
            text = element.value || element.placeholder || '';
          } else {
            text = element.textContent || element.innerText || '';
          }

          text = text.trim();
          if (text.length < 5) return; // More lenient length filter
          
          textsFound++;
          if (text.length > 1000) return; // Skip very long texts (likely articles/responses)

          // More flexible prompt detection
          let isUserPrompt = false;
          let matchedPattern = null;
          
          promptPatterns.forEach((pattern, index) => {
            pattern.lastIndex = 0; // Reset regex
            const match = pattern.exec(text);
            if (match && match[0].trim().length > 10) {
              const fullMatch = match[0].trim();
              const key = fullMatch.toLowerCase();
              
              if (!seenPrompts.has(key) && !isLikelyResponse(text)) {
                seenPrompts.add(key);
                const confidence = calculateUserPromptConfidence(fullMatch, element);
                prompts.push({
                  text: fullMatch,
                  element: element,
                  source: element.tagName.toLowerCase(),
                  confidence: confidence,
                  pattern: index
                });
                promptElements.push(element);
                isUserPrompt = true;
                matchedPattern = index;
                console.log(`Found prompt (pattern ${index}):`, fullMatch.substring(0, 50));
              }
            }
          });

          // For input fields, be more lenient
          if (!isUserPrompt && isInInputField(element) && text.length > 10) {
            const key = text.toLowerCase();
            if (!seenPrompts.has(key) && !isLikelyResponse(text)) {
              seenPrompts.add(key);
              const confidence = calculateUserPromptConfidence(text, element) + 3; // Bonus for input fields
              prompts.push({
                text: text,
                element: element,
                source: element.tagName.toLowerCase(),
                confidence: confidence,
                pattern: 'input-field'
              });
              promptElements.push(element);
              console.log('Found input field prompt:', text.substring(0, 50));
            }
          }
        });
      } catch (e) {
        console.warn('Error scanning elements with selector:', selector, e);
      }
    });
    
    console.log(`Prompt Extractor: Scanned ${totalElementsScanned} elements, found ${textsFound} texts, extracted ${prompts.length} prompts`);
    if (prompts.length > 0) {
      console.log('Sample prompts found:', prompts.slice(0, 3).map(p => p.text.substring(0, 50)));
    }

    // Sort by confidence score
    return prompts.sort((a, b) => b.confidence - a.confidence).slice(0, 20); // Limit to top 20
  }
  
  // Detect which chat platform we're on
  function detectChatPlatform() {
    const url = window.location.href.toLowerCase();
    const hostname = window.location.hostname.toLowerCase();
    
    // Check for specific platforms
    if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) {
      return 'chatgpt';
    }
    if (url.includes('claude.ai') || url.includes('anthropic.com')) {
      return 'claude';
    }
    if (url.includes('gemini.google.com') || url.includes('bard.google.com')) {
      return 'gemini';
    }
    if (url.includes('perplexity.ai')) {
      return 'perplexity';
    }
    if (url.includes('poe.com')) {
      return 'poe';
    }
    if (url.includes('character.ai')) {
      return 'character';
    }
    if (url.includes('you.com')) {
      return 'you';
    }
    if (url.includes('bing.com/chat') || url.includes('copilot.microsoft.com')) {
      return 'copilot';
    }
    
    // Generic detection for any chat interface
    if (document.querySelector('textarea, [contenteditable="true"]') && 
        (document.querySelector('[class*="chat"]') || 
         document.querySelector('[class*="message"]') ||
         document.querySelector('[class*="conversation"]'))) {
      return 'generic';
    }
    
    return 'unknown';
  }

  // Universal function for chat prompt extraction
  function scanChatPrompts(platform) {
    const prompts = [];
    const seenPrompts = new Set();
    
    console.log(`Scanning ${platform} interface...`);
    
    // Platform-specific selectors
    const platformSelectors = getPlatformSelectors(platform);
    
    let foundElements = 0;
    
    platformSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        foundElements += elements.length;
        console.log(`Found ${elements.length} elements with selector: ${selector}`);
        
        elements.forEach(element => {
          if (isHidden(element) || isExtensionElement(element)) return;
          
          // Check if this is a user message by looking at parent structure
          const isUserMessage = checkIfUserMessage(element, platform);
          if (!isUserMessage) return;
          
          let text = element.textContent || element.innerText || '';
          if (element.tagName === 'TEXTAREA') {
            text = element.value || element.placeholder || '';
          }
          
          text = text.trim();
          
          // Filter out very short or very long texts
          if (text.length < 5 || text.length > 1000) return;
          
          // Filter out obvious AI responses
          if (isLikelyAIResponse(text, platform)) return;
          
          const key = text.toLowerCase();
          if (!seenPrompts.has(key)) {
            seenPrompts.add(key);
            prompts.push({
              text: text,
              element: element,
              source: platform,
              confidence: calculateChatPromptConfidence(text, element, platform)
            });
            console.log(`Found ${platform} prompt:`, text.substring(0, 60) + '...');
          }
        });
      } catch (e) {
        console.warn(`Error with ${platform} selector:`, selector, e);
      }
    });
    
    console.log(`Total elements found: ${foundElements}, prompts extracted: ${prompts.length}`);
    
    // Sort by confidence and position in page (newer messages first)
    return prompts.sort((a, b) => {
      // First sort by confidence
      if (b.confidence !== a.confidence) {
        return b.confidence - a.confidence;
      }
      // Then by position (later in DOM = newer)
      return comparePosition(b.element, a.element);
    }).slice(0, 15);
  }
  
  // Get platform-specific selectors
  function getPlatformSelectors(platform) {
    const selectors = {
      chatgpt: [
        '[data-message-author-role="user"]',
        '.group\/conversation-turn[data-testid*="user"]',
        '#prompt-textarea',
        'textarea[placeholder*="message"]',
        '.text-base .whitespace-pre-wrap',
        '[class*="user"]'
      ],
      claude: [
        '[data-is-author="human"]',
        '.font-claude-message[data-is-author="human"]',
        'div[data-testid="user-message"]',
        'textarea[placeholder*="talk"]',
        'textarea[placeholder*="message"]',
        '[class*="human"], [class*="user"]'
      ],
      gemini: [
        '[data-response-type="user"]',
        '.user-message',
        'textarea[aria-label*="message"]',
        'textarea[placeholder*="enter"]',
        '[class*="user"], [class*="human"]'
      ],
      perplexity: [
        '[class*="UserMessage"]',
        '.user-query',
        'textarea[placeholder*="Ask"]',
        '[data-testid="user-message"]',
        '[class*="user"]'
      ],
      poe: [
        '.Message_humanMessageBubble',
        '[class*="Human"]',
        'textarea[placeholder*="Talk"]',
        '[data-testid="message-input"]'
      ],
      copilot: [
        '.user-message',
        '[role="user"]',
        'textarea[placeholder*="Ask"]',
        '[class*="user"]'
      ],
      character: [
        '.user-message',
        '[data-author="user"]',
        'textarea[placeholder*="Type"]',
        '[class*="user"]'
      ],
      you: [
        '.user-message',
        '[data-testid="user-message"]',
        'textarea[placeholder*="Ask"]'
      ],
      generic: [
        // Generic selectors for unknown chat interfaces
        '[class*="user"], [class*="human"], [class*="my"]',
        '[data-role="user"], [data-author="user"], [data-sender="user"]',
        'textarea, [contenteditable="true"]',
        '.message.user, .user-message, .human-message',
        '[class*="message"][class*="user"]'
      ]
    };
    
    return selectors[platform] || selectors.generic;
  }
  
  // Check if element contains a user message
  function checkIfUserMessage(element, platform) {
    // Always treat textarea as user input
    if (element.tagName === 'TEXTAREA' || element.hasAttribute('contenteditable')) {
      return true;
    }
    
    // Platform-specific user indicators
    const userIndicators = {
      chatgpt: ['user', 'data-message-author-role="user"'],
      claude: ['human', 'data-is-author="human"'],
      gemini: ['user', 'data-response-type="user"'],
      perplexity: ['UserMessage', 'user-query'],
      poe: ['humanMessageBubble', 'Human'],
      copilot: ['user-message', 'role="user"'],
      character: ['user-message', 'data-author="user"'],
      you: ['user-message', 'data-testid="user-message"'],
      generic: ['user', 'human', 'my-message']
    };
    
    const indicators = userIndicators[platform] || userIndicators.generic;
    
    // Look for user indicators in the element or its parents
    let current = element;
    for (let i = 0; i < 5 && current; i++) {
      const classNames = current.className || '';
      const outerHTML = current.outerHTML || '';
      
      // Check against platform-specific indicators
      for (const indicator of indicators) {
        if (classNames.includes(indicator) || 
            outerHTML.includes(indicator) ||
            current.getAttribute('data-testid') === indicator ||
            current.getAttribute('data-role') === indicator ||
            current.getAttribute('data-author') === indicator) {
          return true;
        }
      }
      
      current = current.parentElement;
    }
    
    return false;
  }
  
  // Check if text is likely an AI response
  function isLikelyAIResponse(text, platform) {
    const commonResponseIndicators = [
      // Common AI response patterns
      'I\'m Claude', 'I\'m ChatGPT', 'I\'m Gemini', 'As an AI', 'I\'m an AI assistant',
      'I understand', 'I can help', 'Here\'s', 'Here are', 'Here\'s how',
      'Certainly!', 'Of course!', 'I\'d be happy to', 'I\'ll help you',
      'Based on', 'According to', 'In summary', 'To summarize',
      'I apologize', 'I\'m sorry', 'Let me', 'I should clarify',
      // Technical content
      'function', 'const', 'let', 'var', 'import', 'export',
      '```', 'window.__oai', 'requestAnimationFrame',
      // Long explanatory patterns
      'The answer is', 'The solution', 'This means', 'In other words',
      'Additionally', 'Furthermore', 'Moreover', 'However',
      'Therefore', 'Consequently', 'As a result'
    ];
    
    const platformSpecificIndicators = {
      chatgpt: ['As ChatGPT', 'I\'m ChatGPT'],
      claude: ['I\'m Claude', 'As Claude'],
      gemini: ['I\'m Gemini', 'As Gemini', 'I\'m Bard'],
      perplexity: ['Based on my search'],
      generic: []
    };
    
    const indicators = [
      ...commonResponseIndicators,
      ...(platformSpecificIndicators[platform] || [])
    ];
    
    const lowerText = text.toLowerCase();
    return indicators.some(indicator => 
      lowerText.includes(indicator.toLowerCase())
    );
  }
  
  // Calculate confidence for chat prompts
  function calculateChatPromptConfidence(text, element, platform) {
    let score = 0;
    
    // Higher score for textarea (active input)
    if (element.tagName === 'TEXTAREA') score += 10;
    if (element.hasAttribute('contenteditable')) score += 8;
    
    // Platform-specific confidence boost
    const platformBoosts = {
      chatgpt: {
        attributes: ['data-message-author-role="user"'],
        classes: ['user'],
        boost: 15
      },
      claude: {
        attributes: ['data-is-author="human"'],
        classes: ['human'],
        boost: 15
      },
      gemini: {
        attributes: ['data-response-type="user"'],
        classes: ['user-message'],
        boost: 15
      },
      generic: {
        attributes: ['data-role="user"'],
        classes: ['user', 'human'],
        boost: 10
      }
    };
    
    const boost = platformBoosts[platform] || platformBoosts.generic;
    
    // Check element tree for platform-specific indicators
    let current = element;
    for (let i = 0; i < 3 && current; i++) {
      for (const attr of boost.attributes) {
        if (current.outerHTML?.includes(attr)) {
          score += boost.boost;
          break;
        }
      }
      for (const cls of boost.classes) {
        if (current.className?.includes(cls)) {
          score += boost.boost / 2;
        }
      }
      current = current.parentElement;
    }
    
    // Question patterns get higher score
    if (text.includes('?')) score += 5;
    if (text.match(/^(how|what|why|where|when|who|can you|could you|please|help)/i)) score += 5;
    
    // Personal pronouns (user speaking)
    if (text.match(/\b(I|my|me|mine|I'm|I've|I'll)\b/g)) score += 3;
    
    // Command/request patterns
    if (text.match(/^(write|create|generate|explain|show|make|build)/i)) score += 4;
    
    // Length scoring (optimal range for prompts)
    if (text.length > 20 && text.length < 500) score += 3;
    if (text.length > 10 && text.length < 50) score += 2; // Short questions
    
    return score;
  }
  
  // Compare position of two elements in DOM
  function comparePosition(a, b) {
    const position = a.compareDocumentPosition(b);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1; // a comes before b
    } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1; // a comes after b
    }
    return 0; // same position
  }

  // Calculate confidence score for user prompts
  function calculateUserPromptConfidence(text, element) {
    let score = 0;
    
    // Element type scoring (higher for input fields)
    if (element.tagName === 'TEXTAREA') score += 5;
    if (element.tagName === 'INPUT') score += 4;
    if (element.hasAttribute('contenteditable')) score += 3;
    
    // User prompt indicators
    const userPromptKeywords = [
      'write', 'create', 'generate', 'make', 'build', 'design',
      'explain', 'describe', 'analyze', 'summarize',
      'help me', 'can you', 'please', 'how to'
    ];
    
    userPromptKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        score += 2;
      }
    });
    
    // Question patterns
    if (text.includes('?')) score += 3;
    if (text.match(/^(how|what|why|where|when|who)/i)) score += 2;
    
    // Length scoring (optimal range for prompts)
    if (text.length > 30 && text.length < 200) score += 2;
    
    // First person indicators
    if (text.match(/\b(i want|i need|i'm|i am|my)/i)) score += 2;
    
    return score;
  }

  // Check if text is likely an AI response rather than user prompt
  function isLikelyResponse(text) {
    const responseIndicators = [
      'here is', 'here are', 'as an ai', 'i can help', 'i understand',
      'based on', 'in conclusion', 'to summarize', 'the answer is',
      'according to', 'it appears', 'it seems', 'however', 'furthermore',
      'additionally', 'moreover', 'therefore', 'consequently',
      'in summary', 'to conclude', 'overall', 'in general'
    ];
    
    const lowerText = text.toLowerCase();
    
    // Don't filter out short texts or input field contents
    if (text.length < 100) return false;
    
    return responseIndicators.some(indicator => lowerText.includes(indicator)) ||
           text.length > 800; // Only very long texts are likely responses
  }

  // Check if element is an input field
  function isInInputField(element) {
    return element.tagName === 'TEXTAREA' || 
           element.tagName === 'INPUT' || 
           element.hasAttribute('contenteditable');
  }

  // Check if element is hidden
  function isHidden(element) {
    const style = window.getComputedStyle(element);
    return style.display === 'none' || 
           style.visibility === 'hidden' || 
           style.opacity === '0' ||
           element.offsetParent === null;
  }

  // Check if element belongs to this extension
  function isExtensionElement(element) {
    return element.id && element.id.startsWith('prompt-extractor-') ||
           element.className && element.className.includes('prompt-extractor-');
  }

  // Display prompts in the dialog
  function displayPrompts(prompts) {
    if (prompts.length === 0) {
      elements.promptsList.innerHTML = `
        <div class="prompt-extractor-no-prompts">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M9 12h6m-6 4h6m2 5l-9-9 9-9M3 19.5L5.625 21 12 12l-6.375-9L3 4.5v15z" 
                  stroke="currentColor" stroke-width="1.5" opacity="0.5"/>
          </svg>
          <p>No prompts found on this page.</p>
          <small>Check the browser console for debugging info. Try pages with text inputs, questions, or AI chat interfaces.</small>
        </div>
      `;
      return;
    }

    const promptsHTML = prompts.map((prompt, index) => `
      <div class="prompt-extractor-prompt-item" data-index="${index}">
        <div class="prompt-extractor-prompt-text">${escapeHtml(prompt.text)}</div>
        <div class="prompt-extractor-prompt-meta">
          <span class="source">From: ${prompt.source}</span>
          <span class="confidence">Score: ${prompt.confidence}</span>
        </div>
      </div>
    `).join('');

    elements.promptsList.innerHTML = promptsHTML;

    // Add click handlers to navigate to prompts
    elements.promptsList.querySelectorAll('.prompt-extractor-prompt-item').forEach((item, index) => {
      item.addEventListener('click', () => {
        const prompt = prompts[index];
        if (prompt.element) {
          navigateToPrompt(prompt.element, item);
        }
      });
    });
  }

  // Navigate to prompt element on page
  function navigateToPrompt(element, item) {
    // Scroll to the element
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'nearest'
    });
    
    // Highlight the element temporarily
    highlightElement(element);
    
    // Show navigation feedback
    showNavigationFeedback(item);
    
    // Focus the element if it's an input
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' || element.hasAttribute('contenteditable')) {
      setTimeout(() => {
        element.focus();
      }, 500);
    }
    
    // Note: Sidebar stays open for continued navigation
  }

  // Highlight element temporarily
  function highlightElement(element) {
    const originalOutline = element.style.outline;
    const originalBoxShadow = element.style.boxShadow;
    
    // Apply highlight styling
    element.style.outline = '3px solid #4F46E5';
    element.style.boxShadow = '0 0 0 6px rgba(79, 70, 229, 0.2)';
    element.style.transition = 'all 0.3s ease';
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.style.outline = originalOutline;
      element.style.boxShadow = originalBoxShadow;
      element.style.transition = '';
    }, 3000);
  }

  // Show navigation feedback
  function showNavigationFeedback(item) {
    const originalText = item.innerHTML;
    item.innerHTML = '<div class="prompt-extractor-navigated">→ Navigated to prompt</div>';
    item.classList.add('navigated');
    
    setTimeout(() => {
      item.innerHTML = originalText;
      item.classList.remove('navigated');
    }, 2000);
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
