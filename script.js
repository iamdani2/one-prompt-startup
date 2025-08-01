class OnePromptStartup {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.setupTheme();
        this.loadHistory();
        this.loadCategories();
    }

    initializeElements() {
        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.btnText = document.getElementById('btnText');
        this.btnLoader = document.getElementById('btnLoader');
        this.outputSection = document.getElementById('outputSection');
        this.copyBtn = document.getElementById('copyBtn');
        this.themeToggle = document.getElementById('themeToggle');
        this.sunIcon = document.getElementById('sunIcon');
        this.moonIcon = document.getElementById('moonIcon');
        
        // Output elements
        this.toolsList = document.getElementById('toolsList');
        this.stepsList = document.getElementById('stepsList');
        this.notesList = document.getElementById('notesList');
        this.linksList = document.getElementById('linksList');
        this.notesSection = document.getElementById('notesSection');
        this.linksSection = document.getElementById('linksSection');
        
        // History elements
        this.historySection = document.getElementById('historySection');
        this.historyList = document.getElementById('historyList');
        
        // RAG elements
        this.categoriesContainer = document.getElementById('categoriesContainer');
        this.responseSource = document.getElementById('responseSource');
    }

    setupEventListeners() {
        this.generateBtn.addEventListener('click', () => this.generateIdea());
        this.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateIdea();
            }
        });
        
        this.copyBtn.addEventListener('copy', () => this.copyToClipboard());
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Example prompts
        document.querySelectorAll('.example-prompt').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.promptInput.value = e.target.textContent;
                this.generateIdea();
            });
        });
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
            document.documentElement.classList.add('dark');
            this.updateThemeIcons(true);
        } else {
            this.updateThemeIcons(false);
        }
    }

    toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            this.updateThemeIcons(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            this.updateThemeIcons(true);
        }
    }

    updateThemeIcons(isDark) {
        if (isDark) {
            this.sunIcon.classList.add('hidden');
            this.moonIcon.classList.remove('hidden');
        } else {
            this.sunIcon.classList.remove('hidden');
            this.moonIcon.classList.add('hidden');
        }
    }

    async generateIdea() {
        const prompt = this.promptInput.value.trim();
        if (!prompt) {
            this.showError('Please enter an idea first!');
            return;
        }

        this.setLoading(true);
        
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayResult(data, prompt);
            this.saveToHistory(prompt, data);
            
        } catch (error) {
            console.error('Error:', error);
            this.showError('Oops! Something went wrong. Please try again.');
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading) {
        if (isLoading) {
            this.generateBtn.disabled = true;
            this.btnText.classList.add('hidden');
            this.btnLoader.classList.remove('hidden');
        } else {
            this.generateBtn.disabled = false;
            this.btnText.classList.remove('hidden');
            this.btnLoader.classList.add('hidden');
        }
    }

    displayResult(data, originalPrompt) {
        // Show the output section
        this.outputSection.classList.remove('hidden');
        
        // Display tools
        this.toolsList.innerHTML = '';
        if (data.tools && data.tools.length > 0) {
            data.tools.forEach(tool => {
                const toolTag = document.createElement('span');
                toolTag.className = 'px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium';
                toolTag.textContent = tool;
                this.toolsList.appendChild(toolTag);
            });
        }
        
        // Display steps
        this.stepsList.innerHTML = '';
        if (data.steps && data.steps.length > 0) {
            data.steps.forEach((step, index) => {
                const stepItem = document.createElement('li');
                stepItem.className = 'flex items-start gap-3';
                stepItem.innerHTML = `
                    <span class="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full text-sm font-bold flex items-center justify-center">
                        ${index + 1}
                    </span>
                    <span>${step}</span>
                `;
                this.stepsList.appendChild(stepItem);
            });
        }
        
        // Display notes (if any)
        if (data.notes && data.notes.length > 0) {
            this.notesSection.classList.remove('hidden');
            this.notesList.innerHTML = '';
            data.notes.forEach(note => {
                const noteItem = document.createElement('p');
                noteItem.className = 'text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-3 rounded-lg';
                noteItem.textContent = note;
                this.notesList.appendChild(noteItem);
            });
        } else {
            this.notesSection.classList.add('hidden');
        }
        
        // Display links (if any)
        if (data.links && data.links.length > 0) {
            this.linksSection.classList.remove('hidden');
            this.linksList.innerHTML = '';
            data.links.forEach(link => {
                const linkItem = document.createElement('a');
                linkItem.href = link;
                linkItem.target = '_blank';
                linkItem.className = 'inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm';
                linkItem.innerHTML = `
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    ${link}
                `;
                this.linksList.appendChild(linkItem);
            });
        } else {
            this.linksSection.classList.add('hidden');
        }
        
        // Show response source information
        this.displayResponseSource(data);
        
        // Store current result for copying
        this.currentResult = { prompt: originalPrompt, ...data };
        
        // Scroll to result
        this.outputSection.scrollIntoView({ behavior: 'smooth' });
    }

    async copyToClipboard() {
        if (!this.currentResult) return;
        
        let copyText = `💡 Idea: ${this.currentResult.prompt}\n\n`;
        
        if (this.currentResult.tools && this.currentResult.tools.length > 0) {
            copyText += `🛠️ Stack: ${this.currentResult.tools.join(', ')}\n\n`;
        }
        
        if (this.currentResult.steps && this.currentResult.steps.length > 0) {
            copyText += `📋 Steps:\n`;
            this.currentResult.steps.forEach((step, index) => {
                copyText += `${index + 1}. ${step}\n`;
            });
            copyText += '\n';
        }
        
        if (this.currentResult.notes && this.currentResult.notes.length > 0) {
            copyText += `💡 Notes:\n`;
            this.currentResult.notes.forEach(note => {
                copyText += `• ${note}\n`;
            });
            copyText += '\n';
        }
        
        if (this.currentResult.links && this.currentResult.links.length > 0) {
            copyText += `🔗 Resources:\n`;
            this.currentResult.links.forEach(link => {
                copyText += `• ${link}\n`;
            });
        }
        
        try {
            await navigator.clipboard.writeText(copyText);
            this.showSuccess('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showError('Failed to copy to clipboard');
        }
    }

    saveToHistory(prompt, data) {
        let history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        
        const entry = {
            id: Date.now(),
            prompt,
            data,
            timestamp: new Date().toISOString()
        };
        
        history.unshift(entry);
        
        // Keep only the last 5 entries
        history = history.slice(0, 5);
        
        localStorage.setItem('promptHistory', JSON.stringify(history));
        this.displayHistory();
    }

    loadHistory() {
        this.displayHistory();
    }

    displayHistory() {
        const history = JSON.parse(localStorage.getItem('promptHistory') || '[]');
        
        if (history.length === 0) {
            this.historySection.classList.add('hidden');
            return;
        }
        
        this.historySection.classList.remove('hidden');
        this.historyList.innerHTML = '';
        
        history.forEach(entry => {
            const historyItem = document.createElement('button');
            historyItem.className = 'w-full text-left p-3 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors';
            historyItem.innerHTML = `
                <div class="text-sm font-medium text-gray-900 dark:text-white truncate">
                    ${entry.prompt}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    ${new Date(entry.timestamp).toLocaleDateString()}
                </div>
            `;
            
            historyItem.addEventListener('click', () => {
                this.promptInput.value = entry.prompt;
                this.displayResult(entry.data, entry.prompt);
            });
            
            this.historyList.appendChild(historyItem);
        });
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 transform transition-all duration-300 translate-x-full ${
            type === 'error' ? 'bg-red-500' : 
            type === 'success' ? 'bg-green-500' : 
            'bg-blue-500'
        }`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Load and display categories
    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            if (response.ok) {
                const categories = await response.json();
                this.displayCategories(categories);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    }

    displayCategories(categories) {
        this.categoriesContainer.innerHTML = '';
        
        categories.forEach(category => {
            const categoryBtn = document.createElement('button');
            categoryBtn.className = 'px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors';
            categoryBtn.textContent = category.name;
            categoryBtn.title = `${category.example_count} examples available`;
            
            categoryBtn.addEventListener('click', () => {
                // Fill input with a representative keyword
                const keyword = category.keywords[0];
                this.promptInput.value = `${keyword} for small businesses`;
                this.generateIdea();
            });
            
            this.categoriesContainer.appendChild(categoryBtn);
        });
    }

    displayResponseSource(data) {
        if (!this.responseSource) return;
        
        if (data.source === 'rag') {
            const confidence = Math.round(data.rag_match.confidence * 100);
            this.responseSource.innerHTML = `
                <span class="inline-flex items-center gap-1">
                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                    Instant response (${confidence}% match) • Curated template
                </span>
            `;
        } else if (data.source === 'openai') {
            this.responseSource.innerHTML = `
                <span class="inline-flex items-center gap-1">
                    <span class="w-2 h-2 bg-blue-500 rounded-full"></span>
                    AI generated • Custom response
                </span>
            `;
        } else {
            this.responseSource.innerHTML = '';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OnePromptStartup();
});