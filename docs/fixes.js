// Fix 1: Collapsible Sidebar for Desktop and Mobile
function setupCollapsibleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');

    // Create hamburger button
    const hamburger = document.createElement('button');
    hamburger.id = 'sidebar-toggle';
    hamburger.innerHTML = '☰';
    hamburger.style.cssText = `
        position: fixed;
        top: 70px;
        left: 10px;
        z-index: 9999;
        background: white;
        border: 2px solid #2c3e50;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        font-size: 24px;
        cursor: pointer;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: all 0.3s;
        display: block;
    `;

    // Add responsive styles
    const style = document.createElement('style');
    style.textContent = `
        /* Desktop: sidebar collapses to 0 width with transition */
        .sidebar {
            transition: width 0.3s ease, padding 0.3s ease !important;
            overflow: hidden;
        }

        .sidebar.hidden {
            width: 0 !important;
            padding: 0 !important;
            border-right: none !important;
        }

        /* Hamburger button positioning adjustment */
        #sidebar-toggle {
            transition: left 0.3s ease;
        }

        .sidebar.hidden ~ #sidebar-toggle {
            left: 10px;
        }

        /* Mobile: sidebar positioned fixed and off-screen by default */
        @media (max-width: 768px) {
            .sidebar {
                position: fixed !important;
                left: -320px !important;
                top: 65px !important;
                width: 320px !important;
                height: calc(100vh - 65px) !important;
                transition: left 0.3s ease !important;
                z-index: 9998 !important;
            }
            .sidebar.open {
                left: 0 !important;
            }
            .sidebar.hidden {
                left: -320px !important;
            }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(hamburger);

    // Toggle sidebar
    hamburger.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
            // Mobile behavior: use 'open' class
            sidebar.classList.toggle('open');
            hamburger.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
        } else {
            // Desktop behavior: use 'hidden' class
            sidebar.classList.toggle('hidden');
            hamburger.textContent = sidebar.classList.contains('hidden') ? '☰' : '✕';
        }
    });

    // Close sidebar when clicking on map (mobile only)
    document.getElementById('map').addEventListener('click', () => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
            hamburger.textContent = '☰';
        }
    });

    // Handle window resize to clean up classes
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('open');
        } else {
            sidebar.classList.remove('hidden');
        }
    });
}

// Fix 2: Collapsible Filters
function setupCollapsibleFilters() {
    const filterHeaders = document.querySelectorAll('.filter-section h3');
    
    filterHeaders.forEach(header => {
        // Skip Legend section
        if (header.textContent.includes('Legend')) return;
        
        const targetId = header.getAttribute('data-target');
        if (!targetId) return;
        
        const filterGroup = document.getElementById(targetId);
        if (!filterGroup) return;
        
        header.addEventListener('click', () => {
            filterGroup.classList.toggle('collapsed');
            header.classList.toggle('collapsed');
        });
    });
    
    console.log('✓ Collapsible filters initialized');
}

// Initialize all fixes when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setupCollapsibleSidebar();
        // setupCollapsibleFilters will be called after cameras load
    });
} else {
    setupCollapsibleSidebar();
}
