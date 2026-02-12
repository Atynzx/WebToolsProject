document.addEventListener("DOMContentLoaded", function() {
    
    // --- CONFIGURATION ---
    const GITHUB_USERNAME = "Atynzx"; 
    const REPO_NAME = "WebToolsProject";
    const FOLDER_PATH = "IDJ/kappa/files";
    
    // --- MANUAL DESCRIPTIONS ---
    // Add your file descriptions here. 
    // Format: "FileName": "Your description text"
    const fileDescriptions = {
        "SCPIDJK16-00962": "Incident report regarding unauthorized use of lethal force by repairman. Subject: i_likebeans551.",
        "SCPIDJK16-00945": "Log of site-81 internal investigation into Agent Exombit. Mentions accidental teamkill.",
        "SCPIDJK16-00951": "Medical record regarding Class-C amnestic overdose in Sector-4."
    };

    const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FOLDER_PATH}`;
    const fileContainer = document.getElementById('file-container');
    const searchInput = document.getElementById('search-input');
    const dateSpan = document.getElementById('current-date');
    const loadAllBtn = document.getElementById('load-all-btn');

    const today = new Date();
    dateSpan.textContent = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            fileContainer.innerHTML = ''; 
            const files = data.filter(item => item.type === 'file');

            if (files.length === 0) {
                fileContainer.innerHTML = '<p>No documents currently released.</p>';
                return;
            }

            files.forEach(file => {
                createFileCard(file);
            });

            setupSearch();
        })
        .catch(error => {
            console.error('Error:', error);
            fileContainer.innerHTML = `<div class="notice-box" style="background:#ffe6e6; border-color:red;">Error retrieving manifest.</div>`;
        });

    function createFileCard(file) {
        // Get the filename without extension for the lookup
        let rawName = file.name.replace(/\.[^/.]+$/, ""); 
        
        // Look up the description, or use a default if none exists
        let description = fileDescriptions[rawName] || "No digital snippet available for this record.";

        let cleanDisplayName = rawName.replace(/_/g, " ").replace(/-/g, " ");
        
        const card = document.createElement('div');
        card.className = 'file-card';
        // We store the name AND description in data attributes for the search to find
        card.setAttribute('data-name', cleanDisplayName.toLowerCase()); 
        card.setAttribute('data-desc', description.toLowerCase()); 

        card.innerHTML = `
            <div class="file-info">
                <h4>${cleanDisplayName.toUpperCase()}</h4>
                <p class="file-meta"><strong>Type:</strong> IDJ Evidence File &bull; <strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
                <p class="file-description">${description}</p>
            </div>
            <a href="${file.download_url}" class="download-btn" target="_blank">OPEN FILE</a>
        `;

        fileContainer.appendChild(card);
    }

    function setupSearch() {
        const allCards = document.querySelectorAll('.file-card');

        // Search logic
        searchInput.addEventListener('keyup', () => {
            const term = searchInput.value.toLowerCase();

            allCards.forEach(card => {
                const name = card.getAttribute('data-name');
                const desc = card.getAttribute('data-desc');
                
                // If the term is in the name OR the description, show it
                if (name.includes(term) || desc.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Load All / Reset logic
        loadAllBtn.addEventListener('click', () => {
            searchInput.value = ''; // Clear search bar
            allCards.forEach(card => card.style.display = 'flex'); // Show all
        });
    }
});