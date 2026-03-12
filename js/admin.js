/* ══════════════════════════════════════════════
   Admin Module — Create, Edit, Delete Posts
   ══════════════════════════════════════════════ */

const Admin = (() => {

    // ─── Render Admin Dashboard ───
    function renderDashboard() {
        const app = document.getElementById('app');

        if (!Auth.getIsAdmin()) {
            app.innerHTML = `
                <div class="access-denied">
                    <span class="material-icons-round">lock</span>
                    <h2>Access Denied</h2>
                    <p>You must be signed in as an admin to access this page.</p>
                    <a href="#/" class="btn btn--primary">Go Home</a>
                </div>
            `;
            return;
        }

        app.innerHTML = `
            <div class="admin-page">
                <div class="admin-page__header">
                    <h1 class="admin-page__title">
                        <span class="material-icons-round" style="vertical-align: middle; margin-right: 8px;">dashboard</span>
                        Dashboard
                    </h1>
                    <button class="btn btn--primary" id="btn-new-post">
                        <span class="material-icons-round">add</span> New Post
                    </button>
                </div>
                <div id="admin-content">
                    <div class="skeleton skeleton--card" style="height:300px;"></div>
                </div>
            </div>
        `;

        document.getElementById('btn-new-post').addEventListener('click', () => {
            Router.navigate('#/admin/new');
        });

        loadAdminPosts();
    }

    // ─── Load Posts Table ───
    function loadAdminPosts() {
        db.collection('posts')
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
              const posts = [];
              snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
              renderPostsTable(posts);
          });
    }

    // ─── Render Posts Table ───
    function renderPostsTable(posts) {
        const container = document.getElementById('admin-content');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="posts-empty" style="padding: 60px;">
                    <span class="material-icons-round">article</span>
                    <p>No posts yet. Create your first post!</p>
                </div>
            `;
            return;
        }

        const { formatDate, escapeHtml } = window._blogHelpers;

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${posts.map(post => `
                        <tr>
                            <td>
                                <span class="admin-table__title">${escapeHtml(post.title)}</span>
                            </td>
                            <td>
                                <span class="card__category" style="margin:0;">${escapeHtml(post.category || 'Uncategorized')}</span>
                            </td>
                            <td>${formatDate(post.createdAt)}</td>
                            <td>
                                <div class="admin-table__actions">
                                    <button class="btn btn--sm btn--outline" onclick="Admin.editPost('${post.id}')" title="Edit">
                                        <span class="material-icons-round">edit</span> Edit
                                    </button>
                                    <button class="btn btn--sm btn--danger" onclick="Admin.deletePost('${post.id}', '${escapeHtml(post.title).replace(/'/g, "\\'")}')" title="Delete">
                                        <span class="material-icons-round">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    // ─── Render New Post Form ───
    function renderNewPost() {
        if (!Auth.getIsAdmin()) {
            Router.navigate('#/');
            return;
        }
        renderPostForm(null);
    }

    // ─── Render Edit Post Form ───
    function renderEditPost(params) {
        if (!Auth.getIsAdmin()) {
            Router.navigate('#/');
            return;
        }

        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="admin-page">
                <div style="text-align:center; padding:60px;">
                    <div class="skeleton skeleton--card" style="height:400px;"></div>
                </div>
            </div>
        `;

        db.collection('posts').doc(params.id).get().then(doc => {
            if (!doc.exists) {
                Toast.show("Post not found.", "error");
                Router.navigate('#/admin');
                return;
            }
            renderPostForm({ id: doc.id, ...doc.data() });
        });
    }

    // ─── Render Post Form (Create / Edit) ───
    function renderPostForm(post) {
        const isEdit = !!post;
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="admin-page">
                <a href="#/admin" class="post-view__back" style="margin-bottom:24px; display:inline-flex;">
                    <span class="material-icons-round">arrow_back</span> Back to Dashboard
                </a>
                <div class="admin-form">
                    <h2 class="admin-form__title">
                        ${isEdit ? '<span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">edit</span>Edit Post' 
                                 : '<span class="material-icons-round" style="vertical-align:middle;margin-right:8px;">add_circle</span>New Post'}
                    </h2>
                    <form id="post-form">
                        <div class="form-group">
                            <label for="post-title">Title</label>
                            <input type="text" id="post-title" placeholder="Enter post title..." required
                                   value="${isEdit ? escapeAttr(post.title) : ''}">
                        </div>
                        <div class="form-group">
                            <label for="post-category">Category</label>
                            <select id="post-category">
                                <option value="">Select a category</option>
                                <option value="Technology" ${isEdit && post.category === 'Technology' ? 'selected' : ''}>Technology</option>
                                <option value="Design" ${isEdit && post.category === 'Design' ? 'selected' : ''}>Design</option>
                                <option value="Business" ${isEdit && post.category === 'Business' ? 'selected' : ''}>Business</option>
                                <option value="Lifestyle" ${isEdit && post.category === 'Lifestyle' ? 'selected' : ''}>Lifestyle</option>
                                <option value="Tutorial" ${isEdit && post.category === 'Tutorial' ? 'selected' : ''}>Tutorial</option>
                                <option value="Opinion" ${isEdit && post.category === 'Opinion' ? 'selected' : ''}>Opinion</option>
                                <option value="News" ${isEdit && post.category === 'News' ? 'selected' : ''}>News</option>
                                <option value="Other" ${isEdit && post.category === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="post-content">Content</label>
                            <textarea id="post-content" placeholder="Write your post content here...&#10;&#10;Use ## for headings, > for quotes, and - for list items." required>${isEdit ? post.content : ''}</textarea>
                        </div>
                        <div class="form-actions">
                            <a href="#/admin" class="btn btn--outline">Cancel</a>
                            <button type="submit" class="btn btn--primary" id="btn-submit-post">
                                <span class="material-icons-round">${isEdit ? 'save' : 'publish'}</span>
                                ${isEdit ? 'Save Changes' : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('post-form').addEventListener('submit', (e) => {
            e.preventDefault();
            savePost(isEdit ? post.id : null);
        });
    }

    // ─── Save Post to Firestore ───
    function savePost(postId) {
        const title    = document.getElementById('post-title').value.trim();
        const category = document.getElementById('post-category').value;
        const content  = document.getElementById('post-content').value.trim();
        const btn      = document.getElementById('btn-submit-post');

        if (!title || !content) {
            Toast.show("Please fill in the title and content.", "error");
            return;
        }

        const user = Auth.getUser();
        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round">hourglass_empty</span> Saving...';

        const postData = {
            title,
            category,
            content,
            authorName: user.displayName || user.email,
            authorUid: user.uid,
            authorPhoto: user.photoURL || '',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        let promise;
        if (postId) {
            promise = db.collection('posts').doc(postId).update(postData);
        } else {
            postData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            promise = db.collection('posts').add(postData);
        }

        promise.then(() => {
            Toast.show(postId ? "Post updated!" : "Post published!", "success");
            Router.navigate('#/admin');
        }).catch(err => {
            console.error("Error saving post:", err);
            Toast.show("Failed to save post. Please try again.", "error");
            btn.disabled = false;
            btn.innerHTML = `<span class="material-icons-round">${postId ? 'save' : 'publish'}</span> ${postId ? 'Save Changes' : 'Publish Post'}`;
        });
    }

    // ─── Edit post shortcut ───
    function editPost(id) {
        Router.navigate('#/admin/edit/' + id);
    }

    // ─── Delete Post ───
    function deletePost(id, title) {
        if (!confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) return;

        db.collection('posts').doc(id).delete().then(() => {
            // Also delete feedback sub-collection
            db.collection('posts').doc(id).collection('feedback').get().then(snapshot => {
                snapshot.forEach(doc => doc.ref.delete());
            });
            Toast.show("Post deleted.", "info");
        }).catch(err => {
            console.error("Error deleting post:", err);
            Toast.show("Failed to delete post.", "error");
        });
    }

    // ─── Helper ───
    function escapeAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    return { renderDashboard, renderNewPost, renderEditPost, editPost, deletePost };
})();
