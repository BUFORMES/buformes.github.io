/**
 * =================================================================
 * 1. GLOBAL COMPONENT LOADER (Header & Footer)
 * =================================================================
 */
async function loadComponent(id, file) {
    const el = document.getElementById(id);
    if (!el) return;

    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.text();
        el.innerHTML = data;
        
        if (id === 'header-placeholder') highlightActiveLink();
    } catch (err) {
        console.error(`Error loading ${file}:`, err);
    }
}

function highlightActiveLink() {
    const currentPage = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('active');
        }
    });
}

/**
 * =================================================================
 * 2. PUBLICATIONS LOADER (JSON)
 * =================================================================
 */
async function loadPublications() {
    const container = document.getElementById('pub-container');
    if (!container) return;

    try {
        const response = await fetch('data/publications.json');
        const data = await response.json();
        container.innerHTML = '';

        data.sort((a, b) => b.year - a.year);

        data.forEach((pub, index) => {
            //const pubNumber = data.length - index;
            let citation = `<span class="apa-authors">${pub.authors}</span> (<span class="apa-year">${pub.year}</span>). <span class="apa-title">${pub.title}</span>. `;
            
            if (pub.journal) {
                citation += `<span class="apa-journal"><em>${pub.journal}</em></span>. `;
            }

            container.innerHTML += `
                <div class="pub-item" data-type="${pub.type || 'misc'}">
                    <div class="pub-details">
                        ${citation}
                        <div class="pub-links">
                            ${pub.doi ? `<a href="${pub.doi}" target="_blank" class="btn-cite">DOI</a>` : ''}
                            ${pub.pdf ? `<a href="${pub.pdf}" target="_blank" class="btn-cite"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error('Error loading publications:', err);
    }
}

/**
 * =================================================================
 * 3. PROJECTS LOADER (TXT)
 * =================================================================
 */
async function loadProjects() {
    const activeContainer = document.getElementById('active-projects');
    const pastContainer = document.getElementById('past-projects');
    if (!activeContainer) return;

    try {
        const response = await fetch('data/projects.txt');
        const text = await response.text();
        const projectBlocks = text.split('---').filter(b => b.trim());

        projectBlocks.forEach(block => {
            const data = {};
            block.trim().split('\n').forEach(line => {
                const [key, ...val] = line.split(': ');
                if (key) data[key.trim()] = val.join(': ').trim();
            });

            const projectHTML = `
                <article class="project-card">
                    <div class="project-image">
                        <img src="${data.IMAGE || 'images/default-project.jpg'}" alt="${data.TITLE}">
                    </div>
                    <div class="project-content">
                        <span class="tag">${data.TAG || 'Research'}</span>
                        <h3>${data.TITLE}</h3>
                        <p>${data.DESC}</p>
                        <div class="project-links">
                            <a href="${data.LINK || '#'}" class="btn-small">Learn More</a>
                            ${data.REPO ? `<a href="${data.REPO}" target="_blank" class="btn-outline">GitHub</a>` : ''}
                        </div>
                    </div>
                </article>`;

            if (data.STATUS === 'Active') {
                activeContainer.innerHTML += projectHTML;
            } else if (pastContainer) {
                pastContainer.innerHTML += projectHTML;
            }
        });
    } catch (err) {
        console.error("Error loading projects:", err);
    }
}

/**
 * =================================================================
 * 4. PEOPLE LOADER (TXT)
 * =================================================================
 */
async function loadPeople() {
    const isPeoplePage = document.querySelector('[id^="group-"]') || document.getElementById('alumni-list');
    if (!isPeoplePage) return;

    try {
        const response = await fetch('data/people.txt');
        const text = await response.text();
        const entries = text.split('---').filter(e => e.trim());

        entries.forEach(entry => {
            const data = {};
            entry.trim().split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex !== -1) {
                    data[line.substring(0, colonIndex).trim()] = line.substring(colonIndex + 1).trim();
                }
            });

            if (data.STATUS === 'Active') {
                const container = document.getElementById(`group-${data.CATEGORY}`);
                if (container) {
                    const initials = data.NAME ? data.NAME.split(' ').map(n => n[0]).join('').toUpperCase() : "LM";
                    const imageSrc = (data.IMAGE && data.IMAGE !== '') 
                        ? data.IMAGE 
                        : `https://ui-avatars.com/api/?name=${initials}&background=f0f4f8&color=003d7a&size=128`;

                    container.innerHTML += `
                        <div class="person-card">
                            <div class="image-container">
                                <img src="${imageSrc}" alt="${data.NAME}">
                            </div>
                            <h3>${data.NAME}</h3>
                            <p class="person-role">${data.ROLE || ''}</p>
                            ${data.BIO ? `<p class="person-bio">${data.BIO}</p>` : ''}
                            ${data.LINK ? `<a href="${data.LINK}" target="_blank" class="btn-small">Profile</a>` : ''}
                        </div>`;
                }
            } else if (data.STATUS === 'Past') {
                const alumniList = document.getElementById('alumni-list');
                if (alumniList) {
                    alumniList.innerHTML += `
                        <div class="alumni-item" data-category="${data.CATEGORY}">
                            <strong>${data.NAME}</strong> — ${data.ROLE || ''} (${data.YEAR || ''})
                            <p>${data.DESC || ''}</p>
                        </div>`;
                }
            }
        });
    } catch (err) {
        console.error("Error loading people:", err);
    }
}

/**
 * =================================================================
 * 5. AUTOMATED HERO BANNER
 * =================================================================
 */
function loadHeroBanner() {
    const heroEl = document.getElementById('hero-placeholder');
    if (!heroEl) return;

    const path = window.location.pathname.split("/").pop() || "index.html";
    
    const pageData = {
        "index.html": { title: "The FORMES Research Group", sub: "Foundations for Statistical Methods in the Environmental Sciences" },
        "people.html": { title: "Our Team", sub: "Meet the researchers behind the FORMES group" },
        "publications.html": { title: "Publications", sub: "Peer-reviewed journals, conferences, and pre-prints." },
        "projects.html": { title: "Our Research Projects", sub: "Developing foundations for statistical methods in environmental and climate sciences" },
        "courses.html": { title: "Teaching & Courses", sub: "Educating the next generation of data scientists and researchers" },
        "contact.html": { title: "Contact", sub: "Get in touch with the FORMES Lab" },
        "news.html": { title: "Lab News", sub: "Recent updates, awards, and milestones" },
        "blog.html": { title: "Lab Blog", sub: "Insights, field notes, and tutorials from our researchers." }
    };

    const current = pageData[path] || { title: "FORMES LAB", sub: "" };

    heroEl.innerHTML = `
        <section class="hero-banner">
            <div class="hero-overlay">
                <div class="container">
                    <h1>${current.title}</h1>
                    <p>${current.sub}</p>
                </div>
            </div>
        </section>
    `;
}

/**
 * =================================================================
 * 6. GLOBAL INITIALIZATION
 * =================================================================
 */
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Components
    const headerTask = loadComponent('header-placeholder', 'header.html');
    const footerTask = loadComponent('footer-placeholder', 'footer.html');

    // 2. Automated Banner
    loadHeroBanner();

    // 3. Page data
    loadPublications();
    loadProjects();
    loadPeople();

    // 4. Reveal
    await headerTask;
    document.body.classList.add('loaded');
});

/**
 * =================================================================
 * 7. UTILITIES (Filters & Scroll)
 * =================================================================
 */
window.filterAlumni = function(category, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    const items = document.querySelectorAll('.alumni-item');
    items.forEach(item => {
        item.style.display = (category === 'all' || item.getAttribute('data-category') === category) ? 'block' : 'none';
    });
};

window.filterPubs = function(type, event) {
    if (event) event.preventDefault();
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (event.target) event.target.classList.add('active');
    const items = document.querySelectorAll('.pub-item');
    items.forEach(item => {
        item.style.display = (type === 'all' || item.getAttribute('data-type') === type) ? 'flex' : 'none';
    });
};

window.onscroll = function() {
    const topBtn = document.getElementById("backToTop");
    if (topBtn) {
        topBtn.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? "block" : "none";
    }
};

document.addEventListener('click', (e) => {
    if (e.target.closest('#backToTop')) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});