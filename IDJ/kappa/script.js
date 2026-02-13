document.addEventListener("DOMContentLoaded", function() {
    
    const GITHUB_USERNAME = "Atynzx"; 
    const REPO_NAME = "WebToolsProject";
    const FOLDER_PATH = "IDJ/kappa/files";
    
    const fileDescriptions = {
        "SCPIDJK16-00962": { 
            desc: "Interview regarding unauthorized use of lethal force on a maintenance crew by one of Kappa-16 Operatives. Subject: i_likebeans551.",
            gdoc: "https://docs.google.com/document/d/1nwf2gJEPSn-d5B4dyHt2KvHvG5yHVdKLLiBCff0BM5w/edit?usp=sharing"
        },
        "SCPIDJK16-09958": { 
            desc: "Interview regarding Kappa-18 and their abuse of powers. Subject: joopie_joopiter.",
            gdoc: "https://docs.google.com/document/d/1TKxakzhgmOWsyfRj0IljNe_g73edSpPbY8jZdRuuPUg/edit?usp=sharing"
        },
        "SCPIDJK16-09942": { 
            desc: "Log of Site-81's incident involving Kappa-16 covering up a homicide scene.",
            gdoc: "https://docs.google.com/document/d/1-Ba-MzPnCuA_brOiQebd6wDLheV42qkQ62eVQodIjtA/edit?usp=sharing"
        },
        "SCPIDJK16-12466": { 
            desc: "Log of Site-81's incident involving Kappa-16 Operative Exombit in heavily injuring a maintenance crew member derrickc7.",
            gdoc: "https://docs.google.com/document/d/129c1A0fuPQ_7_37xCXYdSrhsjMqbq1MumpeskGEBaik/edit?usp=sharing"
        },
        "SCPIDJK16-00951": { 
            desc: "Incident regarding unauthorized Class-C amnestic overdose of a Senior Researcher in Sector-4 involving Kappa-16.",
            gdoc: "https://docs.google.com/document/d/1vMEt7aoQGGdLWIOE-sAQ0ZIuDXTskQvWuHYVou3ttE4/edit?usp=sharing"
        },
        "SCPIDJK16-01024": { 
            desc: "Bribery operations involving a high-level financial stakeholder/investor and a Kappa-16 operative.",
            gdoc: "https://docs.google.com/document/d/1AagEU9DsNICC3HWSD8UFtiknfDNvO5mdbexgsQekmnY/edit?usp=sharing"
        },
        "MDD-9003": { 
            desc: "derrickc4's official medical report regarding the IDJK16-12466 incident.",
            gdoc: "https://docs.google.com/document/d/1eSMPk9e2nPqw0Q_t8LxRsm46UReQLIJFm8cK-YENnPg/edit?usp=sharing"
        },
        "SCPIDJK16-00957": { 
            desc: "Intelligence Intercept / Coercion and Extortion Log of one of Kappa-16 agents sending threats to the victim.",
            gdoc: "https://docs.google.com/document/d/10sS0rLHaKO1UjSAB2rDGx_saNI_9SxfT8K_W_dBiJoY/edit?usp=sharing" 
        }
    };

    const fileContainer = document.getElementById('file-container');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const clearBtn = document.getElementById('clear-btn');
    const loadAllBtn = document.getElementById('load-all-btn');
    const resultCount = document.getElementById('result-count');
    const modal = document.getElementById('file-modal-overlay');

    // 1. FETCH AND RENDER
    fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${FOLDER_PATH}`)
        .then(res => res.json())
        .then(data => {
            fileContainer.innerHTML = '';
            const files = data.filter(item => item.type === 'file');
            files.forEach(file => createFileCard(file));
            setupSearchLogic();
        });

    function createFileCard(file) {
        let rawName = file.name.replace(/\.[^/.]+$/, ""); 
        let fileData = fileDescriptions[rawName] || { desc: "No digital snippet available." };
        let cleanDisplayName = rawName.replace(/_/g, " ").replace(/-/g, " ");

        const card = document.createElement('div');
        card.className = 'file-card';
        card.style.display = 'none';
        card.setAttribute('data-name', cleanDisplayName.toLowerCase());
        card.setAttribute('data-desc', fileData.desc.toLowerCase());

        card.innerHTML = `
            <div class="file-info">
                <h4>${cleanDisplayName.toUpperCase()}</h4>
                <p class="file-meta">IDJ K-16 File &bull; ${(file.size / 1024).toFixed(1)} KB</p>
                <p class="file-description">${fileData.desc}</p>
            </div>
            <button class="download-btn" onclick="openModal('${rawName}', '${file.download_url}', '${file.path}')">OPEN FILE</button>
        `;
        fileContainer.appendChild(card);
    }

    // 2. MODAL LOGIC
    window.openModal = function(fileName, downloadUrl, path) {
        const fileData = fileDescriptions[fileName] || { desc: "No additional metadata." };
        
        document.getElementById('modal-title').textContent = fileName.replace(/-/g, " ");
        document.getElementById('modal-desc').textContent = fileData.desc;
        
        // GitHub Web Viewer
        document.getElementById('link-view').href = `https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/blob/main/${path}`;
        
        // Direct Download
        document.getElementById('link-download').href = downloadUrl;
        
        // Google Doc (Only show if exists)
        const gdocBtn = document.getElementById('link-gdoc');
        if (fileData.gdoc) {
            gdocBtn.href = fileData.gdoc;
            gdocBtn.style.display = 'block';
        } else {
            gdocBtn.style.display = 'none';
        }

        modal.style.display = 'flex';
    };

    window.closeModal = function() {
        modal.style.display = 'none';
    };

    // 3. SEARCH & BUTTON LOGIC
    function setupSearchLogic() {
        const allCards = document.querySelectorAll('.file-card');

        searchBtn.addEventListener('click', () => {
            const term = searchInput.value.toLowerCase();
            if (!term) return;
            allCards.forEach(card => {
                const name = card.getAttribute('data-name');
                const desc = card.getAttribute('data-desc');
                card.style.display = (name.includes(term) || desc.includes(term)) ? 'flex' : 'none';
            });
        });

        loadAllBtn.addEventListener('click', () => {
            allCards.forEach(card => card.style.display = 'flex');
            resultCount.textContent = "All records decrypted and displayed.";
        });

        clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            allCards.forEach(card => card.style.display = 'none');
            resultCount.textContent = "";
        });
        
        // Keep your live count logic here too...
    }
});