// Configure marked options for markdown parsing
marked.setOptions({
  breaks: true,
  gfm: true,
  pedantic: false,
  headerIds: true,
  mangle: false,
  highlight: function(code, lang) {
    if (Prism.languages[lang]) {
      return Prism.highlight(code, Prism.languages[lang], lang);
    }
    return code;
  }
});

// Initialize custom renderer for markdown
const renderer = new marked.Renderer();

// Custom renderer for headings - adds collapse functionality
renderer.heading = function(text, level) {
  const escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');
  return `
    </div></div></div>
    <div class="heading-section" data-level="${level}">
      <h${level} id="${escapedText}" class="collapse-trigger">
        <i class="fas fa-chevron-down collapse-arrow"></i>
        <span>${text}</span>
      </h${level}>
      <div class="collapse-content">
        <div class="section-content">
  `;
};

// Custom renderer for lists
renderer.list = function(body, ordered) {
  const type = ordered ? 'ol' : 'ul';
  return `<${type}>${body}</${type}>`;
};

// Custom renderer for list items
renderer.listitem = function(text) {
  return `<li>${text}</li>`;
};

// Set the custom renderer
marked.setOptions({ renderer });

// Function to process markdown with independent sections
function processMarkdown(markdown) {
  // Add a wrapper to handle the first section
  let html = `
    <div class="heading-section" data-level="0">
      <div class="collapse-content">
        <div class="section-content">
  `;
  
  // Parse markdown
  html += marked.parse(markdown);
  
  // Close the wrapper
  html += '</div></div></div>';
  
  // Clean up any adjacent closing/opening tags
  html = html.replace(/(<\/div><\/div><\/div>)\s*(<div class="heading-section")/g, '$1\n$2');
  
  // Create temporary element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Clean up empty sections
  tempDiv.querySelectorAll('.heading-section').forEach(section => {
    const content = section.querySelector('.section-content');
    if (content && !content.textContent.trim()) {
      section.remove();
    }
  });
  
  return tempDiv.innerHTML;
}

// Initialize collapse functionality
function initializeCollapse() {
  document.querySelectorAll('.collapse-trigger').forEach(trigger => {
    if (!trigger.hasListener) {
      trigger.hasListener = true;
      trigger.addEventListener('click', function(e) {
        e.stopPropagation();
        
        const headingSection = this.closest('.heading-section');
        const content = headingSection.querySelector('.collapse-content');
        
        if (content) {
          const isCollapsed = content.classList.contains('collapsed');
          
          if (isCollapsed) {
            expandSection(content);
            this.classList.remove('collapsed');
          } else {
            collapseSection(content);
            this.classList.add('collapsed');
          }
        }
      });
    }
  });
}

// Helper function to collapse a section
function collapseSection(content) {
  content.style.height = content.scrollHeight + 'px';
  content.offsetHeight; // Force reflow
  content.classList.add('collapsed');
  content.style.height = '0';
}

// Helper function to expand a section
function expandSection(content) {
  content.classList.remove('collapsed');
  const sectionHeight = content.scrollHeight;
  content.style.height = sectionHeight + 'px';
  
  setTimeout(() => {
    if (!content.classList.contains('collapsed')) {
      content.style.height = 'auto';
    }
  }, 300);
}

// Update preview
function updatePreview(markdown) {
  try {
    const htmlContent = processMarkdown(markdown);
    const preview = document.getElementById('preview');
    preview.innerHTML = htmlContent;
    
    initializeCollapse();
    
    // Highlight code blocks
    document.querySelectorAll('#preview pre code').forEach((block) => {
      Prism.highlightElement(block);
    });
  } catch (error) {
    console.error('Error updating preview:', error);
  }
}

// State management
let isPreviewMode = true;
const editorSection = document.getElementById('editorSection');
const previewSection = document.getElementById('previewSection');
const toggleButton = document.getElementById('togglePreview');
const previewState = document.getElementById('previewState');

function setPreviewMode(showPreview) {
  isPreviewMode = showPreview;
  if (isPreviewMode) {
    editorSection.classList.add('hidden');
    previewSection.classList.remove('hidden');
    updatePreview(document.getElementById('textArea').value);
    toggleButton.textContent = 'Show Editor';
  } else {
    editorSection.classList.remove('hidden');
    previewSection.classList.add('hidden');
    toggleButton.textContent = 'Show Preview';
  }
  previewState.value = isPreviewMode;
  localStorage.setItem('previewMode', isPreviewMode);
}

// Event handlers
toggleButton.addEventListener('click', () => setPreviewMode(!isPreviewMode));

document.getElementById('textArea').addEventListener('input', function() {
  if (isPreviewMode) {
    updatePreview(this.value);
  }
});

// Load saved text from server
async function loadText() {
  try {
    const response = await fetch('/load-text');
    const text = await response.text();
    document.getElementById('textArea').value = text;
    updatePreview(text);
    
    const savedPreviewMode = localStorage.getItem('previewMode');
    if (savedPreviewMode !== null) {
      setPreviewMode(savedPreviewMode === 'true');
    } else {
      setPreviewMode(true);
    }
  } catch (error) {
    console.error('Error loading text:', error);
  }
}

document.getElementById('uploadButton').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const formData = new FormData();
    formData.append('file', file);

    fetch('/upload-file', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Upload successful!');
      } else {
        alert('Upload failed!');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Upload failed!');
    });
  }
});

document.getElementById('downloadButton').addEventListener('click', () => {
  fetch('/download-file')
    .then(response => {
      // Get the filename from the Content-Disposition header
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'downloaded_file'; // fallback filename
      
      if (disposition && disposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
          // decode the URI encoded filename
          filename = decodeURIComponent(filename);
        }
      }
      
      return response.blob().then(blob => ({ blob, filename }));
    })
    .then(({ blob, filename }) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename; // Use the filename from the server
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Download failed!');
    });
});

// Initialize on page load
window.addEventListener('load', loadText);


