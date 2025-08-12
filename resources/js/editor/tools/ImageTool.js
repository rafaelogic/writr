/**
 * Image Tool for Writr Editor
 * 
 * A modular tool for inserting and managing images
 * Follows EditorJS Block Tool API
 */

export class ImageTool {
    static get toolbox() {
        return {
            title: 'Image',
            icon: '<svg width="17" height="15" viewBox="0 0 17 15" xmlns="http://www.w3.org/2000/svg"><path d="M15.833 13.688v2.062H1.167V13.688h14.666zM1.167 1.25v7.688L4.5 5.5l4.333 4.333 1.5-1.5 3.833 3.834V1.25H1.167zm5.5 2.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/></svg>',
            class: 'writr-image-tool'
        };
    }

    static get enableLineBreaks() {
        return false;
    }

    static get sanitize() {
        return {
            url: {},
            caption: {
                'br': true
            },
            file: {},
            alt: {},
            withBorder: {},
            withBackground: {},
            stretched: {}
        };
    }

    static get isReadOnlySupported() {
        return true;
    }

    constructor({ data, config, api, readOnly }) {
        this.api = api;
        this.config = {
            endpoints: {
                byFile: '', // Server endpoint for file upload
                byUrl: ''   // Server endpoint for URL fetching
            },
            additionalRequestData: {},
            additionalRequestHeaders: {},
            field: 'image',
            types: 'image/*',
            captionPlaceholder: 'Caption',
            buttonContent: 'Select an Image',
            uploader: undefined,
            actions: {
                delete: true,
                flip: true,
                rotate: true
            },
            ...config
        };
        
        this.readOnly = readOnly;

        this.defaultData = {
            url: '',
            caption: '',
            alt: '',
            withBorder: false,
            withBackground: false,
            stretched: false,
            file: {}
        };

        this.data = {
            url: data.url || this.defaultData.url,
            caption: data.caption || this.defaultData.caption,
            alt: data.alt || this.defaultData.alt,
            withBorder: data.withBorder || this.defaultData.withBorder,
            withBackground: data.withBackground || this.defaultData.withBackground,
            stretched: data.stretched || this.defaultData.stretched,
            file: data.file || this.defaultData.file
        };

        this.CSS = {
            wrapper: 'writr-image-tool',
            imageContainer: 'writr-image-tool__image-container',
            image: 'writr-image-tool__image',
            caption: 'writr-image-tool__caption',
            uploadButton: 'writr-image-tool__upload-button',
            urlInput: 'writr-image-tool__url-input',
            loader: 'writr-image-tool__loader',
            imageWithBorder: 'writr-image-tool__image--with-border',
            imageWithBackground: 'writr-image-tool__image--with-background',
            imageStretched: 'writr-image-tool__image--stretched',
            settingsButton: 'writr-image-tool__settings-button',
            settingsButtonActive: 'writr-image-tool__settings-button--active'
        };

        this.nodes = {
            wrapper: null,
            imageContainer: null,
            image: null,
            caption: null
        };
    }

    /**
     * Render the tool's main UI
     */
    render() {
        this.nodes.wrapper = document.createElement('div');
        this.nodes.wrapper.classList.add(this.CSS.wrapper);

        if (this.data.url) {
            this.renderImage();
        } else {
            this.renderUploadInterface();
        }

        return this.nodes.wrapper;
    }

    /**
     * Render image display
     */
    renderImage() {
        this.nodes.wrapper.innerHTML = '';

        // Image container
        this.nodes.imageContainer = document.createElement('div');
        this.nodes.imageContainer.classList.add(this.CSS.imageContainer);

        // Image element
        this.nodes.image = document.createElement('img');
        this.nodes.image.classList.add(this.CSS.image);
        this.nodes.image.src = this.data.url;
        this.nodes.image.alt = this.data.alt || this.data.caption;

        // Apply styling classes
        this.applyImageStyles();

        // Error handling
        this.nodes.image.addEventListener('error', () => {
            this.renderUploadInterface();
        });

        this.nodes.imageContainer.appendChild(this.nodes.image);

        // Caption
        this.nodes.caption = document.createElement('div');
        this.nodes.caption.classList.add(this.CSS.caption);
        this.nodes.caption.contentEditable = !this.readOnly;
        this.nodes.caption.innerHTML = this.data.caption;
        this.nodes.caption.dataset.placeholder = this.config.captionPlaceholder;

        this.nodes.caption.addEventListener('input', () => {
            this.data.caption = this.nodes.caption.innerHTML;
        });

        this.nodes.caption.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.api.blocks.insert();
            }
        });

        this.nodes.wrapper.appendChild(this.nodes.imageContainer);
        this.nodes.wrapper.appendChild(this.nodes.caption);
    }

    /**
     * Render upload interface
     */
    renderUploadInterface() {
        this.nodes.wrapper.innerHTML = '';

        // File upload button
        const uploadButton = document.createElement('div');
        uploadButton.classList.add(this.CSS.uploadButton);
        uploadButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 20 20">
                <path d="M10 3l5 5h-3v6h-4V8H5l5-5z"/>
                <path d="M3 17h14v2H3v-2z"/>
            </svg>
            <span>${this.config.buttonContent}</span>
            <input type="file" accept="${this.config.types}" style="display: none;">
        `;

        const fileInput = uploadButton.querySelector('input[type="file"]');
        
        uploadButton.addEventListener('click', () => {
            if (!this.readOnly) {
                fileInput.click();
            }
        });

        fileInput.addEventListener('change', (e) => {
            this.uploadFile(e.target.files[0]);
        });

        // URL input
        const urlInput = document.createElement('input');
        urlInput.classList.add(this.CSS.urlInput);
        urlInput.type = 'url';
        urlInput.placeholder = 'Paste image URL and press Enter';
        urlInput.disabled = this.readOnly;

        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.loadImageFromUrl(urlInput.value);
            }
        });

        this.nodes.wrapper.appendChild(uploadButton);
        
        if (!this.readOnly) {
            this.nodes.wrapper.appendChild(urlInput);
        }
    }

    /**
     * Upload file to server
     */
    async uploadFile(file) {
        if (!file) return;

        this.showLoader();

        try {
            if (this.config.uploader && typeof this.config.uploader.uploadByFile === 'function') {
                // Use custom uploader
                const result = await this.config.uploader.uploadByFile(file);
                this.onUploadSuccess(result);
            } else if (this.config.endpoints.byFile) {
                // Use endpoint
                const formData = new FormData();
                formData.append(this.config.field, file);
                
                // Add additional data
                Object.entries(this.config.additionalRequestData).forEach(([key, value]) => {
                    formData.append(key, value);
                });

                const response = await fetch(this.config.endpoints.byFile, {
                    method: 'POST',
                    body: formData,
                    headers: this.config.additionalRequestHeaders
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                this.onUploadSuccess(result);
            } else {
                // Fallback: create local URL
                const url = URL.createObjectURL(file);
                this.onUploadSuccess({
                    success: 1,
                    file: {
                        url: url,
                        name: file.name,
                        size: file.size
                    }
                });
            }
        } catch (error) {
            this.onUploadError(error);
        }
    }

    /**
     * Load image from URL
     */
    async loadImageFromUrl(url) {
        if (!url) return;

        this.showLoader();

        try {
            if (this.config.uploader && typeof this.config.uploader.uploadByUrl === 'function') {
                // Use custom uploader
                const result = await this.config.uploader.uploadByUrl(url);
                this.onUploadSuccess(result);
            } else if (this.config.endpoints.byUrl) {
                // Use endpoint
                const response = await fetch(this.config.endpoints.byUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...this.config.additionalRequestHeaders
                    },
                    body: JSON.stringify({
                        url: url,
                        ...this.config.additionalRequestData
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                this.onUploadSuccess(result);
            } else {
                // Direct URL usage
                this.onUploadSuccess({
                    success: 1,
                    file: {
                        url: url
                    }
                });
            }
        } catch (error) {
            this.onUploadError(error);
        }
    }

    /**
     * Handle successful upload
     */
    onUploadSuccess(response) {
        if (response.success && response.file && response.file.url) {
            this.data.url = response.file.url;
            this.data.file = response.file;
            this.renderImage();
        } else {
            this.onUploadError(new Error('Invalid server response'));
        }
    }

    /**
     * Handle upload error
     */
    onUploadError(error) {
        console.error('Upload error:', error);
        this.api.notifier.show({
            message: 'Image upload failed',
            style: 'error'
        });
        this.renderUploadInterface();
    }

    /**
     * Show loading indicator
     */
    showLoader() {
        this.nodes.wrapper.innerHTML = `
            <div class="${this.CSS.loader}">
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
                        <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                        <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                </svg>
                <span>Uploading...</span>
            </div>
        `;
    }

    /**
     * Apply image styling classes
     */
    applyImageStyles() {
        if (!this.nodes.image) return;

        // Remove all style classes
        this.nodes.image.classList.remove(
            this.CSS.imageWithBorder,
            this.CSS.imageWithBackground,
            this.CSS.imageStretched
        );

        // Apply current styles
        if (this.data.withBorder) {
            this.nodes.image.classList.add(this.CSS.imageWithBorder);
        }
        if (this.data.withBackground) {
            this.nodes.image.classList.add(this.CSS.imageWithBackground);
        }
        if (this.data.stretched) {
            this.nodes.image.classList.add(this.CSS.imageStretched);
        }
    }

    /**
     * Render settings menu
     */
    renderSettings() {
        const wrapper = document.createElement('div');

        // Border toggle
        const borderButton = this.createToggleButton('Add Border', 'withBorder');
        wrapper.appendChild(borderButton);

        // Background toggle
        const backgroundButton = this.createToggleButton('Add Background', 'withBackground');
        wrapper.appendChild(backgroundButton);

        // Stretch toggle
        const stretchButton = this.createToggleButton('Stretch to Width', 'stretched');
        wrapper.appendChild(stretchButton);

        return wrapper;
    }

    /**
     * Create toggle button for settings
     */
    createToggleButton(title, property) {
        const button = document.createElement('div');
        button.classList.add(this.CSS.settingsButton);
        
        if (this.data[property]) {
            button.classList.add(this.CSS.settingsButtonActive);
        }

        button.innerHTML = `
            <div class="writr-settings-item">
                <div class="writr-settings-label">${title}</div>
                <div class="writr-settings-toggle">
                    <input type="checkbox" ${this.data[property] ? 'checked' : ''} ${this.readOnly ? 'disabled' : ''}>
                </div>
            </div>
        `;

        const checkbox = button.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', () => {
            this.data[property] = checkbox.checked;
            this.applyImageStyles();
            
            if (checkbox.checked) {
                button.classList.add(this.CSS.settingsButtonActive);
            } else {
                button.classList.remove(this.CSS.settingsButtonActive);
            }
        });

        return button;
    }

    /**
     * Save tool data
     */
    save() {
        return {
            url: this.data.url,
            caption: this.data.caption,
            alt: this.data.alt,
            withBorder: this.data.withBorder,
            withBackground: this.data.withBackground,
            stretched: this.data.stretched,
            file: this.data.file
        };
    }

    /**
     * Validate tool data
     */
    validate(savedData) {
        return savedData.url !== undefined && savedData.url.trim() !== '';
    }

    /**
     * Handle paste events
     */
    onPaste(event) {
        const url = (event.clipboardData || window.clipboardData).getData('text');
        
        // Check if pasted content is an image URL
        const imageUrlPattern = /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i;
        if (imageUrlPattern.test(url)) {
            this.loadImageFromUrl(url);
            return true;
        }

        return false;
    }

    /**
     * Handle dropped files
     */
    onDrop(event) {
        const files = Array.from(event.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        
        if (imageFile) {
            this.uploadFile(imageFile);
            return true;
        }

        return false;
    }
}
