class SpeechToImage {
    constructor() {
        this.recognition = null;
        this.isRecording = false;
        this.transcript = '';
        this.currentMode = 'speech';
        
        this.initElements();
        this.initSpeechRecognition();
        this.bindEvents();
    }

    initElements() {
        // Tabs
        this.speechTab = document.getElementById('speechTab');
        this.audioTab = document.getElementById('audioTab');
        this.textTab = document.getElementById('textTab');

        // Sections
        this.speechSection = document.getElementById('speechSection');
        this.audioSection = document.getElementById('audioSection');
        this.textSection = document.getElementById('textSection');

        // Speech controls
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.generateBtn = document.getElementById('generateBtn');
        this.status = document.getElementById('status');
        this.transcriptEl = document.getElementById('transcript');

        // Audio controls
        this.audioUploadArea = document.getElementById('audioUploadArea');
        this.audioFileInput = document.getElementById('audioFileInput');
        this.audioPlayerSection = document.getElementById('audioPlayerSection');
        this.audioPlayer = document.getElementById('audioPlayer');
        this.audioFileName = document.getElementById('audioFileName');
        this.audioTranscript = document.getElementById('audioTranscript');
        this.clearAudioBtn = document.getElementById('clearAudioBtn');
        this.generateAudioBtn = document.getElementById('generateAudioBtn');

        // Text controls
        this.textInput = document.getElementById('textInput');
        this.clearTextBtn = document.getElementById('clearTextBtn');
        this.generateTextBtn = document.getElementById('generateTextBtn');

        // Output
        this.storyboardEl = document.getElementById('storyboard');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.downloadBtn = document.getElementById('downloadBtn');
    }

    initSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showError('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
            this.isRecording = true;
            this.updateUI();
        };

        this.recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            this.transcript += finalTranscript;
            this.transcriptEl.textContent = this.transcript + interimTranscript;
        };

        this.recognition.onerror = (event) => {
            this.showError(`Speech recognition error: ${event.error}`);
            this.stopRecording();
        };

        this.recognition.onend = () => {
            this.isRecording = false;
            this.updateUI();
        };
    }

    bindEvents() {
        // Tab events
        this.speechTab.addEventListener('click', () => this.switchMode('speech'));
        this.audioTab.addEventListener('click', () => this.switchMode('audio'));
        this.textTab.addEventListener('click', () => this.switchMode('text'));

        // Speech events
        this.startBtn.addEventListener('click', () => this.startRecording());
        this.stopBtn.addEventListener('click', () => this.stopRecording());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.generateBtn.addEventListener('click', () => this.generateImage('speech'));

        // Audio events
        this.audioUploadArea.addEventListener('click', () => this.audioFileInput.click());
        this.audioFileInput.addEventListener('change', (e) => this.handleAudioUpload(e));
        this.clearAudioBtn.addEventListener('click', () => this.clearAudio());
        this.generateAudioBtn.addEventListener('click', () => this.generateImage('audio'));

        // Text events
        this.textInput.addEventListener('input', () => this.handleTextInput());
        this.clearTextBtn.addEventListener('click', () => this.clearText());
        this.generateTextBtn.addEventListener('click', () => this.generateImage('text'));

        // Drag and drop for audio
        this.audioUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.audioUploadArea.style.borderColor = '#667eea';
        });

        this.audioUploadArea.addEventListener('dragleave', () => {
            this.audioUploadArea.style.borderColor = '#bdc3c7';
        });

        this.audioUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.audioUploadArea.style.borderColor = '#bdc3c7';
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('audio/')) {
                this.handleAudioFile(file);
            }
        });
    }

    switchMode(mode) {
        this.currentMode = mode;
        
        // Update tabs
        [this.speechTab, this.audioTab, this.textTab].forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${mode}Tab`).classList.add('active');

        // Update sections
        [this.speechSection, this.audioSection, this.textSection].forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${mode}Section`).classList.add('active');
    }

    handleAudioUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.handleAudioFile(file);
        }
    }

    handleAudioFile(file) {
        this.audioFileName.textContent = file.name;
        this.audioPlayer.src = URL.createObjectURL(file);
        this.audioPlayerSection.style.display = 'block';
        this.generateAudioBtn.disabled = false;
        // Here you would typically add audio transcription logic
    }

    handleTextInput() {
        this.generateTextBtn.disabled = !this.textInput.value.trim();
    }

    clearAudio() {
        this.audioFileInput.value = '';
        this.audioPlayer.src = '';
        this.audioFileName.textContent = 'No file selected';
        this.audioPlayerSection.style.display = 'none';
        this.audioTranscript.textContent = 'Audio transcription will appear here...';
        this.generateAudioBtn.disabled = true;
    }

    clearText() {
        this.textInput.value = '';
        this.generateTextBtn.disabled = true;
    }

    startRecording() {
        if (this.recognition) {
            this.recognition.start();
        }
    }

    stopRecording() {
        if (this.recognition) {
            this.recognition.stop();
        }
    }

    clearAll() {
        this.transcript = '';
        this.transcriptEl.textContent = 'Your speech will appear here...';
        this.storyboardEl.innerHTML = '<div class="empty-state"><p>Your generated images will appear here after you provide input and click "Generate Image"</p></div>';
        this.generateBtn.disabled = true;
    }

    updateUI() {
        this.startBtn.disabled = this.isRecording;
        this.stopBtn.disabled = !this.isRecording;
        this.generateBtn.disabled = !this.transcript.trim();
        
        if (this.isRecording) {
            this.status.textContent = '🔴 Recording... Speak your story';
            this.status.className = 'status recording';
        } else {
            this.status.textContent = this.transcript.trim() ? 'Recording complete. Click "Generate Image" to create visuals.' : 'Click "Start Recording" to begin';
            this.status.className = 'status';
        }
    }

    async sendTextToBackend(text) {
        try {
            const response = await fetch('http://localhost:5000/process', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    async sendAudioToBackend(file) {
        try {
            const formData = new FormData();
            formData.append('audio', file);
            const response = await fetch('http://localhost:5000/process', {
                method: 'POST',
                body: formData
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    async generateImage(mode) {
        let text = '';
        let backendResult = null;
        let imageUrl = null;
        // Hide download button and show loading
        this.downloadBtn.style.display = 'none';
        this.loadingIndicator.style.display = 'flex';
        switch (mode) {
            case 'speech':
                text = this.transcript;
                if (!text.trim()) {
                    this.loadingIndicator.style.display = 'none';
                    return;
                }
                backendResult = await this.sendPromptToImageBackend(text);
                break;
            case 'audio':
                if (this.audioFileInput.files && this.audioFileInput.files[0]) {
                    text = this.audioTranscript.textContent;
                    if (!text.trim()) {
                        this.loadingIndicator.style.display = 'none';
                        return;
                    }
                    backendResult = await this.sendPromptToImageBackend(text);
                } else {
                    backendResult = { error: 'No audio file selected.' };
                }
                break;
            case 'text':
                text = this.textInput.value;
                if (!text.trim()) {
                    this.loadingIndicator.style.display = 'none';
                    return;
                }
                backendResult = await this.sendPromptToImageBackend(text);
                break;
        }
        if (backendResult && backendResult.image_path) {
            imageUrl = `http://localhost:5000/${backendResult.image_path}`;
        }
        let resultText = backendResult && backendResult.result ? backendResult.result : (backendResult && backendResult.error ? backendResult.error : 'No response from backend.');
        this.storyboardEl.innerHTML = imageUrl ? `
            <div class="panel">
                <div class="visual-area">
                    <img id="generatedImage" src="${imageUrl}" alt="Generated image" style="max-width:100%; max-height:100%; border-radius:10px;" />
                </div>
                <div class="scene-description">
                    <h4>Input Text</h4>
                    <div class="scene-text">${text || ''}</div>
                </div>
            </div>
        ` : `
            <div class="panel">
                <div class="visual-area">
                    <div class="visual-placeholder">
                        🎨<br>
                        Generated image will appear here<br>
                        <small>${resultText}</small>
                    </div>
                </div>
                <div class="scene-description">
                    <h4>Input Text</h4>
                    <div class="scene-text">${text || ''}</div>
                </div>
            </div>
        `;
        // Hide loading indicator
        this.loadingIndicator.style.display = 'none';
        // Show download button if image generated
        if (imageUrl) {
            this.downloadBtn.href = imageUrl;
            this.downloadBtn.style.display = 'inline-block';
        } else {
            this.downloadBtn.style.display = 'none';
        }
    }

    async sendPromptToImageBackend(prompt) {
        try {
            const response = await fetch('http://localhost:5000/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });
            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.transcriptEl.parentNode.insertBefore(errorDiv, this.transcriptEl);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize the app
new SpeechToImage();
