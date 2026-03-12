/* ══════════════════════════════════════════════
   Blog Module — Homepage & Post Views
   ══════════════════════════════════════════════ */

const Blog = (() => {

    // ─── Render Home Page ───
    function renderHome() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Hero -->
            <section class="hero">
                <div class="hero__content">
                    <div class="hero__badge">
                        <span class="material-icons-round" style="font-size:1rem;">auto_awesome</span>
                        Welcome to CBBlog
                    </div>
                    <h1 class="hero__title">
                        Ideas that <span class="gradient-text">Inspire</span>,<br>
                        Stories that <span class="gradient-text">Matter</span>
                    </h1>
                    <p class="hero__subtitle">
                        Discover thoughtful articles, share your perspective, and join a community of curious minds.
                    </p>
                    <div class="hero__actions">
                        <a href="#posts-feed" class="btn btn--primary btn--lg" onclick="document.querySelector('.posts-section')?.scrollIntoView({behavior:'smooth'}); return false;">
                            <span class="material-icons-round">article</span> Browse Posts
                        </a>
                    </div>
                </div>
            </section>

            <!-- Posts Feed -->
            <section class="posts-section" id="posts-feed">
                <div class="posts-section__header">
                    <div>
                        <h2 class="posts-section__title">Latest Posts</h2>
                        <p class="posts-section__count" id="post-count"></p>
                    </div>
                    <div class="search-bar" id="search-bar">
                        <span class="material-icons-round">search</span>
                        <input type="text" placeholder="Search posts..." id="search-input">
                    </div>
                </div>
                <div class="posts-grid" id="posts-grid">
                    <!-- Loading skeletons -->
                    <div class="skeleton skeleton--card"></div>
                    <div class="skeleton skeleton--card"></div>
                    <div class="skeleton skeleton--card"></div>
                </div>
            </section>
        `;

        loadPosts();

        // Search
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', debounce((e) => {
                filterPosts(e.target.value.trim().toLowerCase());
            }, 300));
        }
    }

    let allPosts = [];

    // ─── Load Posts from Firestore ───
    function loadPosts() {
        db.collection('posts')
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
              allPosts = [];
              snapshot.forEach(doc => {
                  allPosts.push({ id: doc.id, ...doc.data() });
              });
              renderPostsGrid(allPosts);
          }, err => {
              console.error("Error loading posts:", err);
              const grid = document.getElementById('posts-grid');
              if (grid) {
                  grid.innerHTML = `
                      <div class="posts-empty">
                          <span class="material-icons-round">error_outline</span>
                          <p>Could not load posts. Please check your Firebase configuration.</p>
                      </div>
                  `;
              }
          });
    }

    // ─── Render Posts Grid ───
    function renderPostsGrid(posts) {
        const grid = document.getElementById('posts-grid');
        const countEl = document.getElementById('post-count');
        if (!grid) return;

        if (posts.length === 0) {
            grid.innerHTML = `
                <div class="posts-empty">
                    <span class="material-icons-round">article</span>
                    <p>No posts yet. Check back soon!</p>
                </div>
            `;
            if (countEl) countEl.textContent = '0 posts';
            return;
        }

        if (countEl) countEl.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''}`;

        grid.innerHTML = posts.map((post, i) => `
            <a href="#/post/${post.id}" class="card" style="animation-delay: ${i * 0.08}s; text-decoration:none; color:inherit;">
                <div class="card__body">
                    ${post.category ? `<span class="card__category">${escapeHtml(post.category)}</span>` : ''}
                    <h3 class="card__title">${escapeHtml(post.title)}</h3>
                    <p class="card__excerpt">${escapeHtml(stripToExcerpt(post.content, 160))}</p>
                    <div class="card__meta">
                        <div class="card__meta-left">
                            ${post.authorPhoto ? `<img src="${post.authorPhoto}" alt="" class="card__author-img">` : ''}
                            <span>${escapeHtml(post.authorName || 'Admin')}</span>
                            <span>·</span>
                            <span>${formatDate(post.createdAt)}</span>
                        </div>
                        <span class="card__read-more">
                            Read <span class="material-icons-round">arrow_forward</span>
                        </span>
                    </div>
                </div>
            </a>
        `).join('');
    }

    // ─── Filter posts by search ───
    function filterPosts(query) {
        if (!query) {
            renderPostsGrid(allPosts);
            return;
        }
        const filtered = allPosts.filter(p =>
            p.title.toLowerCase().includes(query) ||
            (p.content && p.content.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query))
        );
        renderPostsGrid(filtered);
    }

    // ─── Render Single Post View ───
    function renderPost(params) {
        const app = document.getElementById('app');
        app.innerHTML = `
            <article class="post-view">
                <div style="text-align:center; padding: 60px 0;">
                    <div class="skeleton skeleton--title" style="margin:0 auto 16px; width:60%;"></div>
                    <div class="skeleton skeleton--text" style="margin:0 auto; width:80%;"></div>
                </div>
            </article>
        `;

        db.collection('posts').doc(params.id).get().then(doc => {
            if (!doc.exists) {
                app.innerHTML = `
                    <div class="access-denied">
                        <span class="material-icons-round">article</span>
                        <h2>Post Not Found</h2>
                        <p>This post may have been deleted or doesn't exist.</p>
                        <a href="#/" class="btn btn--primary">Go Home</a>
                    </div>
                `;
                return;
            }

            const post = { id: doc.id, ...doc.data() };
            app.innerHTML = `
                <article class="post-view">
                    <a href="#/" class="post-view__back">
                        <span class="material-icons-round">arrow_back</span> Back to posts
                    </a>
                    ${post.category ? `<span class="post-view__category">${escapeHtml(post.category)}</span>` : ''}
                    <h1 class="post-view__title">${escapeHtml(post.title)}</h1>
                    <div class="post-view__meta">
                        <div class="post-view__meta-author">
                            ${post.authorPhoto ? `<img src="${post.authorPhoto}" alt="">` : ''}
                            <span>${escapeHtml(post.authorName || 'Admin')}</span>
                        </div>
                        <span>${formatDate(post.createdAt)}</span>
                        ${post.updatedAt && post.updatedAt.seconds !== (post.createdAt && post.createdAt.seconds)
                            ? `<span>(edited ${formatDate(post.updatedAt)})</span>` : ''}
                    </div>
                    <div class="post-view__content" id="post-content">
                        ${renderContent(post.content)}
                    </div>

                    <!-- Feedback Section -->
                    <div class="feedback-section" id="feedback-section">
                        <h3 class="feedback-section__title">
                            <span class="material-icons-round">forum</span>
                            Feedback <span class="count" id="feedback-count">0</span>
                        </h3>
                        <div id="feedback-form-container"></div>
                        <div class="feedback-list" id="feedback-list"></div>
                    </div>
                </article>
            `;

            // Load feedback
            Feedback.init(post.id);
        }).catch(err => {
            console.error("Error loading post:", err);
            app.innerHTML = `
                <div class="access-denied">
                    <span class="material-icons-round">error_outline</span>
                    <h2>Error</h2>
                    <p>Could not load this post. Please try again.</p>
                    <a href="#/" class="btn btn--primary">Go Home</a>
                </div>
            `;
        });
    }

    // ─── Render post content (simple markdown-like) ───
    function renderContent(text) {
        if (!text) return '<p>No content.</p>';
        // Convert line breaks to paragraphs
        let html = text
            .split(/\n\n+/)
            .map(para => {
                para = para.trim();
                if (!para) return '';
                // Headers
                if (para.startsWith('### ')) return `<h3>${escapeHtml(para.slice(4))}</h3>`;
                if (para.startsWith('## '))  return `<h2>${escapeHtml(para.slice(3))}</h2>`;
                // Blockquote
                if (para.startsWith('> '))   return `<blockquote>${escapeHtml(para.slice(2))}</blockquote>`;
                // List items
                if (para.match(/^[-*] /m)) {
                    const items = para.split(/\n/).map(li => `<li>${escapeHtml(li.replace(/^[-*] /, ''))}</li>`).join('');
                    return `<ul>${items}</ul>`;
                }
                return `<p>${escapeHtml(para)}</p>`;
            })
            .join('');
        return html;
    }

    // ─── Helpers ───
    function stripToExcerpt(text, maxLen) {
        if (!text) return '';
        const clean = text.replace(/[#>*\-]/g, '').replace(/\n+/g, ' ').trim();
        return clean.length > maxLen ? clean.slice(0, maxLen) + '…' : clean;
    }

    function formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function debounce(fn, delay) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }

    // Expose formatDate and escapeHtml for other modules
    window._blogHelpers = { formatDate, escapeHtml };

    return { renderHome, renderPost };
})();
