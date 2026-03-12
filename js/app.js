/* ══════════════════════════════════════════════
   App Entry Point — Wires Everything Together
   ══════════════════════════════════════════════ */

// ─── Toast Notification Utility ───
const Toast = (() => {
    function show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icons = {
            success: 'check_circle',
            error: 'error',
            info: 'info'
        };

        toast.innerHTML = `
            <span class="material-icons-round">${icons[type] || 'info'}</span>
            <span>${message}</span>
        `;

        container.appendChild(toast);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    return { show };
})();


// ─── Register Routes ───
Router.on('#/', () => Blog.renderHome());
Router.on('#/post/:id', (params) => Blog.renderPost(params));
Router.on('#/admin', () => Admin.renderDashboard());
Router.on('#/admin/new', () => Admin.renderNewPost());
Router.on('#/admin/edit/:id', (params) => Admin.renderEditPost(params));


// ─── Initialize App ───
document.addEventListener('DOMContentLoaded', () => {
    // Init Auth
    Auth.init();

    // Init Router
    Router.init();

    // Navbar login/logout buttons
    document.getElementById('btn-login').addEventListener('click', () => Auth.signIn());
    document.getElementById('btn-logout').addEventListener('click', () => Auth.signOut());

    // Hamburger menu toggle
    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('nav-links');
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        // Animate hamburger
        hamburger.classList.toggle('active');
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        });
    });

    // Re-render current page on auth state change
    Auth.onChange(() => {
        Router.resolve();
    });

    console.log("✨ CBBlog initialized");
});
