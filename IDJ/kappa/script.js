document.addEventListener("DOMContentLoaded", function() {
    
    const GITHUB_USERNAME = "Atynzx"; 
    const REPO_NAME = "WebToolsProject";
    const FOLDER_PATH = "IDJ/kappa/files";
    
    const fileDescriptions = {
        "SCPIDJK16-00962": "Interview regarding unauthorized use of lethal force on a maitenance crew by one of Kappa-16 Operatives. Subject: i_likebeans551.",
        "SCPIDJK16-00942": "Log of Site-81's incident involving Kappa-16 covering up a homocide scene.",
        "SCPIDJK16-12466": "Log of Site-81's incident involving Kappa-16 Operative Exombit in team killing of a maintenance crew derrickc7.",
        "SCPIDJK16-00951": "Incident regarding unauthorized Class-C amnestic overdose of a Senior Researcher in Sector-4 involving Kappa-16.",
        "SCPIDJK16-00957": "Intelligence Intercept / Coercion and Extortion Log of one of Kappa-16 agents sending threats to the victim."
    };

    const API_URL = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FOLDER_PATH}`;
    const fileContainer = document.getElementById('file-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const resultCount = document.getElementById('result-count');
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

            setupSearchLogic();
        })
        .catch(error => {
            console.error('Error:', error);
            fileContainer.innerHTML = `<div class="notice-box" style="background:#ffe6e6; border-color:red;">Error retrieving manifest.</div>`;
        });

    function createFileCard(file) {
        let rawName = file.name.replace(/\.[^/.]+$/, ""); 
        let description = fileDescriptions[rawName] || "No digital snippet available for this record.";
        let cleanDisplayName = rawName.replace(/_/g, " ").replace(/-/g, " ");
        
        // This link opens the GitHub File Viewer instead of forcing a download
        const viewUrl = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/blob/main/${file.path}`;

        const card = document.createElement('div');
        card.className = 'file-card';
        card.style.display = 'none'; // HIDDEN BY DEFAULT
        card.setAttribute('data-name', cleanDisplayName.toLowerCase()); 
        card.setAttribute('data-desc', description.toLowerCase()); 

        card.innerHTML = `
            <div class="file-info">
                <h4>${cleanDisplayName.toUpperCase()}</h4>
                <p class="file-meta"><strong>Type:</strong> IDJ K-16 File &bull; <strong>Size:</strong> ${(file.size / 1024).toFixed(1)} KB</p>
                <p class="file-description" style="margin-top:8px; font-size:13px; color:#444;">${description}</p>
            </div>
            <a href="${viewUrl}" class="download-btn" target="_blank">OPEN FILE</a>
        `;

        fileContainer.appendChild(card);
    }

    function setupSearchLogic() {
        const allCards = document.querySelectorAll('.file-card');

        // 1. LIVE COUNTING (While typing)
        searchInput.addEventListener('keyup', () => {
            const term = searchInput.value.toLowerCase();
            if (term.length === 0) {
                resultCount.textContent = "";
                return;
            }

            let matches = 0;
            allCards.forEach(card => {
                const name = card.getAttribute('data-name');
                const desc = card.getAttribute('data-desc');
                if (name.includes(term) || desc.includes(term)) matches++;
            });

            resultCount.textContent = `Found ${matches} potential matches for "${term}"...`;
        });

        // 2. ACTUAL SEARCH (On Click)
        searchBtn.addEventListener('click', () => {
            const term = searchInput.value.toLowerCase();
            
            if (term.length === 0) {
                alert("Please enter a keyword to search.");
                return;
            }

            allCards.forEach(card => {
                const name = card.getAttribute('data-name');
                const desc = card.getAttribute('data-desc');
                card.style.display = (name.includes(term) || desc.includes(term)) ? 'flex' : 'none';
            });
            
            resultCount.textContent = `Search complete. Displaying matches for "${term}".`;
        });

        // 3. LOAD ALL RECORDS
        loadAllBtn.addEventListener('click', () => {
            searchInput.value = ''; 
            allCards.forEach(card => card.style.display = 'flex');
            resultCount.textContent = `Archive fully loaded. Total Records: ${allCards.length}`;
        });
    }
});