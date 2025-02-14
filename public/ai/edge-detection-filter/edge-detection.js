class EdgeDetector {
  constructor() {
    this.originalCanvas = document.getElementById('originalCanvas');
    this.filteredCanvas = document.getElementById('filteredCanvas');
    this.mediaInput = document.getElementById('mediaInput');
    this.applyFilterBtn = document.getElementById('applyFilter');
    this.downloadBtn = document.getElementById('downloadMedia');
    
    this.kernelTypeSelect = document.getElementById('kernelType');
    this.thresholdInput = document.getElementById('threshold');
    this.thresholdValue = document.getElementById('thresholdValue');
    this.invertCheck = document.getElementById('invert');
    this.edgeColorInput = document.getElementById('edgeColor');
    this.blurInput = document.getElementById('blur');
    this.blurValue = document.getElementById('blurValue');
    this.processVideoBtn = document.getElementById('processVideoBtn');
    this.processVideoBtn.addEventListener('click', this.processVideoForDownload.bind(this));
    this.userInstructions = document.getElementById('userInstructions');
    
    this.video = null;
    this.animationFrameId = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];

    this.setupEventListeners();
    this.setupInitialState();
  }

  setupInitialState() {
    this.applyFilterBtn.disabled = true;
    this.downloadBtn.disabled = true;
    this.processVideoBtn.style.display = 'none';
    this.updateInstructions('Upload an image or video to get started');
  }

  updateInstructions(message) {
    this.userInstructions.textContent = message;
  }

  setupEventListeners() {
    this.mediaInput.addEventListener('change', this.handleFileUpload.bind(this));
    this.applyFilterBtn.addEventListener('click', this.applyEdgeDetection.bind(this));
    this.downloadBtn.addEventListener('click', this.downloadMedia.bind(this));
    
    this.thresholdInput.addEventListener('input', (e) => {
      this.thresholdValue.textContent = e.target.value;
    });
    
    this.blurInput.addEventListener('input', (e) => {
      this.blurValue.textContent = e.target.value;
    });
  }

  handleFileUpload(event) {
    // Stop any existing video processing
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Reset recorded chunks
    this.recordedChunks = [];

    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const mediaType = file.type.split('/')[0];
      
      if (mediaType === 'image') {
        this.loadImage(e.target.result);
      } else if (mediaType === 'video') {
        this.loadVideo(file);
      }
    };

    reader.readAsDataURL(file);

    // Enable apply filter button and update instructions
    this.applyFilterBtn.disabled = false;
    this.updateInstructions('👉 Press "Apply Filter" to see edge detection results');
  }

  loadImage(src) {
    const img = new Image();
    img.onload = () => {
      this.originalCanvas.width = img.width;
      this.originalCanvas.height = img.height;
      this.filteredCanvas.width = img.width;
      this.filteredCanvas.height = img.height;

      const origCtx = this.originalCanvas.getContext('2d');
      origCtx.drawImage(img, 0, 0);
    };
    img.src = src;
    this.downloadBtn.disabled = false;
  }

  loadVideo(file) {
    // Stop any existing video processing
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Reset recorded chunks
    this.recordedChunks = [];

    // Create video element
    this.video = document.createElement('video');
    this.video.src = URL.createObjectURL(file);
    this.video.muted = true;
    this.video.loop = false;

    // Determine supported video mime type
    const supportedTypes = [
      'video/webm', 
      'video/mp4', 
      'video/ogg'
    ];
    let supportedMimeType = supportedTypes.find(MediaRecorder.isTypeSupported);

    if (!supportedMimeType) {
      alert('No supported video recording format found.');
      return;
    }

    // Show process video button
    this.processVideoBtn.style.display = 'block';
    this.processVideoBtn.textContent = 'Process Video';
    this.processVideoBtn.disabled = false;
    this.processVideoBtn.dataset.mimeType = supportedMimeType;

    this.video.addEventListener('loadedmetadata', () => {
      this.originalCanvas.width = this.video.videoWidth;
      this.originalCanvas.height = this.video.videoHeight;
      this.filteredCanvas.width = this.video.videoWidth;
      this.filteredCanvas.height = this.video.videoHeight;
      
      // Reset video to first frame
      this.video.currentTime = 0;
    });

    this.video.addEventListener('canplay', () => {
      // Enable process video button
      this.processVideoBtn.disabled = false;
    });

    // Show process video button and update instructions
    this.updateInstructions('👉 Press "Process Video" to apply edge detection to entire video');
  }

  processVideoForDownload() {
    // Disable button during processing
    this.processVideoBtn.disabled = true;
    this.processVideoBtn.textContent = 'Processing...';

    // Reset video and recorded chunks
    this.video.currentTime = 0;
    this.recordedChunks = [];

    // Set up media recorder
    const stream = this.filteredCanvas.captureStream(30); // 30 fps
    const supportedMimeType = this.processVideoBtn.dataset.mimeType;

    try {
      this.mediaRecorder = new MediaRecorder(stream, { 
        mimeType: supportedMimeType 
      });
    } catch (err) {
      console.error('Error creating MediaRecorder:', err);
      alert('Could not create video recorder. Check browser compatibility.');
      this.processVideoBtn.disabled = false;
      this.processVideoBtn.textContent = 'Process Video';
      return;
    }

    // Collect recorded chunks
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onerror = (event) => {
      console.error('MediaRecorder error:', event);
      this.processVideoBtn.disabled = false;
      this.processVideoBtn.textContent = 'Process Video';
    };

    this.mediaRecorder.onstop = () => {
      // Video processing complete
      this.processVideoBtn.textContent = 'Done Processing!';
      this.processVideoBtn.disabled = false;
    };

    // Play video
    this.video.play();

    // Process video frames
    this.processVideoFrames(true);
    this.updateInstructions('👉 Press "Download Filtered Media" to save processed video');
    this.downloadBtn.disabled = false;
  }

  processVideoFrames(forDownload = false) {
    const origCtx = this.originalCanvas.getContext('2d');
    const filteredCtx = this.filteredCanvas.getContext('2d');

    const processFrame = () => {
      // If video has ended, stop processing
      if (this.video.ended) {
        if (forDownload && this.mediaRecorder.state !== 'inactive') {
          this.mediaRecorder.stop();
        }
        return;
      }

      // Start recording if not already started and in download mode
      if (forDownload && this.mediaRecorder.state === 'inactive') {
        this.mediaRecorder.start();
      }

      // Draw current video frame to original canvas
      origCtx.drawImage(this.video, 0, 0, this.originalCanvas.width, this.originalCanvas.height);
      
      // Get image data from original canvas
      const imageData = origCtx.getImageData(0, 0, this.originalCanvas.width, this.originalCanvas.height);
      
      // Apply edge detection
      const edgeData = this.detectEdges(imageData);
      
      // Draw processed frame to filtered canvas
      filteredCtx.putImageData(edgeData, 0, 0);

      // Continue processing frames
      this.animationFrameId = requestAnimationFrame(processFrame);
    };

    processFrame();
  }

  applyEdgeDetection() {
    if (!this.video) {
      // For images, use the existing method
      const origCtx = this.originalCanvas.getContext('2d');
      const filteredCtx = this.filteredCanvas.getContext('2d');
      
      const imageData = origCtx.getImageData(0, 0, this.originalCanvas.width, this.originalCanvas.height);
      const edgeData = this.detectEdges(imageData);
      
      filteredCtx.putImageData(edgeData, 0, 0);
    }
    // For video, the processing is continuous via processVideoFrames
    this.updateInstructions('👉 Press "Download Filtered Media" to save your result');
    this.downloadBtn.disabled = false;
  }

  detectEdges(imageData) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    const outputData = new ImageData(width, height);
    const kernelType = this.kernelTypeSelect.value;
    const threshold = parseInt(this.thresholdInput.value);
    const isInverted = this.invertCheck.checked;
    const edgeColor = this.hexToRgb(this.edgeColorInput.value);
    const blurAmount = parseFloat(this.blurInput.value);

    // Simple pre-processing blur (basic implementation)
    if (blurAmount > 0) {
      this.gaussianBlur(imageData, blurAmount);
    }

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const index = (y * width + x) * 4;
        let gx = 0, gy = 0;

        // Different kernel implementations
        switch(kernelType) {
          case 'sobel':
            [gx, gy] = this.sobelKernel(imageData, x, y, width);
            break;
          case 'prewitt':
            [gx, gy] = this.prewittKernel(imageData, x, y, width);
            break;
          case 'roberts':
            [gx, gy] = this.robertsKernel(imageData, x, y, width);
            break;
          case 'laplacian':
            [gx, gy] = this.laplacianKernel(imageData, x, y, width);
            break;
        }

        const magnitude = Math.sqrt(gx * gx + gy * gy);
        
        if (magnitude > threshold) {
          if (isInverted) {
            outputData.data[index] = 255 - edgeColor.r;
            outputData.data[index + 1] = 255 - edgeColor.g;
            outputData.data[index + 2] = 255 - edgeColor.b;
          } else {
            outputData.data[index] = edgeColor.r;
            outputData.data[index + 1] = edgeColor.g;
            outputData.data[index + 2] = edgeColor.b;
          }
          outputData.data[index + 3] = 255;
        } else {
          outputData.data[index] = 0;
          outputData.data[index + 1] = 0;
          outputData.data[index + 2] = 0;
          outputData.data[index + 3] = 255;
        }
      }
    }

    return outputData;
  }

  gaussianBlur(imageData, radius) {
    // Basic Gaussian blur implementation
    // Note: This is a simplified version and could be improved
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const weight = 1 / (1 + Math.abs(dx) + Math.abs(dy));
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
          }
        }
        const index = (y * width + x) * 4;
        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
      }
    }
  }

  sobelKernel(imageData, x, y, width) {
    const data = imageData.data;
    const getGray = (x, y) => {
      const idx = (y * width + x) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    };

    const gx = 
      -1 * getGray(x-1, y-1) + 1 * getGray(x+1, y-1) +
      -2 * getGray(x-1, y) + 2 * getGray(x+1, y) +
      -1 * getGray(x-1, y+1) + 1 * getGray(x+1, y+1);

    const gy = 
      -1 * getGray(x-1, y-1) - 2 * getGray(x, y-1) - 1 * getGray(x+1, y-1) +
       1 * getGray(x-1, y+1) + 2 * getGray(x, y+1) + 1 * getGray(x+1, y+1);

    return [gx, gy];
  }

  prewittKernel(imageData, x, y, width) {
    const data = imageData.data;
    const getGray = (x, y) => {
      const idx = (y * width + x) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    };

    const gx = 
      -1 * getGray(x-1, y-1) + 1 * getGray(x+1, y-1) +
      -1 * getGray(x-1, y) + 1 * getGray(x+1, y) +
      -1 * getGray(x-1, y+1) + 1 * getGray(x+1, y+1);

    const gy = 
      -1 * getGray(x-1, y-1) - 1 * getGray(x, y-1) - 1 * getGray(x+1, y-1) +
       1 * getGray(x-1, y+1) + 1 * getGray(x, y+1) + 1 * getGray(x+1, y+1);

    return [gx, gy];
  }

  robertsKernel(imageData, x, y, width) {
    const data = imageData.data;
    const getGray = (x, y) => {
      const idx = (y * width + x) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    };

    const gx = getGray(x, y) - getGray(x+1, y+1);
    const gy = getGray(x+1, y) - getGray(x, y+1);

    return [gx, gy];
  }

  laplacianKernel(imageData, x, y, width) {
    const data = imageData.data;
    const getGray = (x, y) => {
      const idx = (y * width + x) * 4;
      return (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
    };

    const gx = 
      -1 * getGray(x-1, y) +
      -1 * getGray(x, y-1) + 4 * getGray(x, y) + 
      -1 * getGray(x, y+1) +
      -1 * getGray(x+1, y);

    return [gx, 0];
  }

  hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return { r, g, b };
  }

  downloadMedia() {
    if (this.video) {
      // For video, ensure processing happened first
      if (this.recordedChunks.length === 0) {
        this.updateInstructions('❌ Please process the video first');
        return;
      }

      // Create and download video blob
      const blob = new Blob(this.recordedChunks, { 
        type: this.processVideoBtn.dataset.mimeType 
      });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `edge_detected_video.${this.processVideoBtn.dataset.mimeType.split('/')[1]}`;
      link.click();

      // Clean up
      URL.revokeObjectURL(url);
    } else {
      // For image, use previous method
      const dataURL = this.filteredCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'edge_detected_image.png';
      link.href = dataURL;
      link.click();
    }
  }
}

// Initialize the edge detector when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new EdgeDetector();
});
