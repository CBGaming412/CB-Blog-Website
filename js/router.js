/* ══════════════════════════════════════════════
   Simple Hash-Based SPA Router
   ══════════════════════════════════════════════ */

const Router = (() => {
    const routes = {};
    let currentRoute = null;

    // ─── Register a route ───
    function on(path, handler) {
        routes[path] = handler;
    }

    // ─── Navigate to a hash route ───
    function navigate(hash) {
        window.location.hash = hash;
    }

    // ─── Resolve the current hash ───
    function resolve() {
        const hash = window.location.hash || '#/';
        const app = document.getElementById('app');

        // Try exact match
        if (routes[hash]) {
            transition(app, () => routes[hash]());
            setActiveNav(hash);
            currentRoute = hash;
            return;
        }

        // Try pattern matching  #/post/:id  or  #/admin/edit/:id
        for (const pattern in routes) {
            const regex = patternToRegex(pattern);
            const match = hash.match(regex);
            if (match) {
                const params = extractParams(pattern, match);
                transition(app, () => routes[pattern](params));
                setActiveNav(pattern);
                currentRoute = hash;
                return;
            }
        }

        // 404
        transition(app, () => {
            app.innerHTML = `
                <div class="access-denied">
                    <span class="material-icons-round">explore_off</span>
                    <h2>Page Not Found</h2>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="#/" class="btn btn--primary">Go Home</a>
                </div>
            `;
        });
    }

    // ─── Convert route pattern to regex ───
    function patternToRegex(pattern) {
        const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const withParams = escaped.replace(/:(\w+)/g, '([^/]+)');
        return new RegExp('^' + withParams + '$');
    }

    // ─── Extract named params from match ───
    function extractParams(pattern, match) {
        const params = {};
        const paramNames = (pattern.match(/:(\w+)/g) || []).map(p => p.slice(1));
        paramNames.forEach((name, i) => {
            params[name] = match[i + 1];
        });
        return params;
    }

    // ─── Page transition animation ───
    function transition(el, renderFn) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(12px)';
        setTimeout(() => {
            renderFn();
            el.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 150);
    }

    // ─── Highlight active nav link ───
    function setActiveNav(hash) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === hash ||
                (hash.startsWith('#/admin') && link.dataset.route === 'admin') ||
                (hash === '#/' && link.dataset.route === 'home')) {
                link.classList.add('active');
            }
        });
    }

    // ─── Initialize ───
    function init() {
        window.addEventListener('hashchange', resolve);
        resolve();
    }

    return { on, navigate, init, resolve };
})();
