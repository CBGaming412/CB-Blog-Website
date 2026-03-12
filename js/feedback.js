/* ══════════════════════════════════════════════
   Feedback Module — Comments & Ratings
   ══════════════════════════════════════════════ */

const Feedback = (() => {
    let currentPostId = null;
    let unsubscribe = null;

    // ─── Initialize for a post ───
    function init(postId) {
        currentPostId = postId;

        // Render form
        renderForm();

        // Listen for auth changes to update form
        Auth.onChange(() => {
            if (currentPostId === postId) renderForm();
        });

        // Load feedback in real-time
        loadFeedback();
    }

    // ─── Render Feedback Form ───
    function renderForm() {
        const container = document.getElementById('feedback-form-container');
        if (!container) return;

        const user = Auth.getUser();

        if (!user) {
            container.innerHTML = `
                <div class="feedback-login-prompt">
                    <span class="material-icons-round" style="font-size:2rem; color:var(--accent); margin-bottom:12px; display:block;">account_circle</span>
                    <p style="margin-bottom:16px;">Sign in with Google to leave feedback</p>
                    <button class="btn btn--ghost" onclick="Auth.signIn()">
                        <span class="material-icons-round">login</span> Sign in with Google
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="feedback-form" id="feedback-form">
                <div class="feedback-form__rating">
                    <label>Rating:</label>
                    <div class="star-rating" id="star-rating">
                        <span class="material-icons-round star" data-value="1">star</span>
                        <span class="material-icons-round star" data-value="2">star</span>
                        <span class="material-icons-round star" data-value="3">star</span>
                        <span class="material-icons-round star" data-value="4">star</span>
                        <span class="material-icons-round star" data-value="5">star</span>
                    </div>
                </div>
                <textarea id="feedback-text" placeholder="Share your thoughts on this post..."></textarea>
                <div class="feedback-form__actions">
                    <button class="btn btn--primary" id="btn-submit-feedback">
                        <span class="material-icons-round">send</span> Submit Feedback
                    </button>
                </div>
            </div>
        `;

        // Star rating interaction
        let selectedRating = 0;
        const stars = document.querySelectorAll('#star-rating .star');
        stars.forEach(star => {
            star.addEventListener('mouseenter', () => {
                const val = parseInt(star.dataset.value);
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.value) <= val);
                });
            });
            star.addEventListener('click', () => {
                selectedRating = parseInt(star.dataset.value);
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
                });
            });
        });

        const starContainer = document.getElementById('star-rating');
        if (starContainer) {
            starContainer.addEventListener('mouseleave', () => {
                stars.forEach(s => {
                    s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
                });
            });
        }

        // Submit
        document.getElementById('btn-submit-feedback').addEventListener('click', () => {
            submitFeedback(selectedRating);
        });
    }

    // ─── Submit Feedback ───
    function submitFeedback(rating) {
        const text = document.getElementById('feedback-text').value.trim();
        const btn  = document.getElementById('btn-submit-feedback');
        const user = Auth.getUser();

        if (!text) {
            Toast.show("Please write some feedback.", "error");
            return;
        }
        if (rating === 0) {
            Toast.show("Please select a star rating.", "error");
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<span class="material-icons-round">hourglass_empty</span> Submitting...';

        db.collection('posts').doc(currentPostId).collection('feedback').add({
            userId: user.uid,
            userName: user.displayName || user.email,
            userPhoto: user.photoURL || '',
            text,
            rating,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            Toast.show("Feedback submitted! Thank you.", "success");
            document.getElementById('feedback-text').value = '';
            // Reset stars
            const stars = document.querySelectorAll('#star-rating .star');
            stars.forEach(s => s.classList.remove('active'));
            btn.disabled = false;
            btn.innerHTML = '<span class="material-icons-round">send</span> Submit Feedback';
        }).catch(err => {
            console.error("Error submitting feedback:", err);
            Toast.show("Failed to submit feedback.", "error");
            btn.disabled = false;
            btn.innerHTML = '<span class="material-icons-round">send</span> Submit Feedback';
        });
    }

    // ─── Load Feedback (real-time) ───
    function loadFeedback() {
        // Unsubscribe previous listener
        if (unsubscribe) unsubscribe();

        unsubscribe = db.collection('posts').doc(currentPostId)
            .collection('feedback')
            .orderBy('createdAt', 'desc')
            .onSnapshot(snapshot => {
                const feedbacks = [];
                snapshot.forEach(doc => feedbacks.push({ id: doc.id, ...doc.data() }));
                renderFeedbackList(feedbacks);
            });
    }

    // ─── Render Feedback List ───
    function renderFeedbackList(feedbacks) {
        const list    = document.getElementById('feedback-list');
        const countEl = document.getElementById('feedback-count');
        if (!list) return;

        if (countEl) countEl.textContent = feedbacks.length;

        if (feedbacks.length === 0) {
            list.innerHTML = `
                <div style="text-align:center; padding:28px; color:var(--text-muted);">
                    <p>No feedback yet. Be the first to share your thoughts!</p>
                </div>
            `;
            return;
        }

        const { formatDate, escapeHtml } = window._blogHelpers;

        list.innerHTML = feedbacks.map(fb => `
            <div class="feedback-item">
                <div class="feedback-item__header">
                    <div class="feedback-item__user">
                        ${fb.userPhoto ? `<img src="${fb.userPhoto}" alt="">` : ''}
                        <span class="feedback-item__user-name">${escapeHtml(fb.userName)}</span>
                        <span class="feedback-item__date">${formatDate(fb.createdAt)}</span>
                    </div>
                    <div class="feedback-item__stars">
                        ${renderStars(fb.rating)}
                    </div>
                </div>
                <p class="feedback-item__text">${escapeHtml(fb.text)}</p>
            </div>
        `).join('');
    }

    // ─── Render star icons ───
    function renderStars(rating) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += `<span class="material-icons-round ${i > rating ? 'empty' : ''}">star</span>`;
        }
        return html;
    }

    // ─── Cleanup ───
    function destroy() {
        if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
        }
        currentPostId = null;
    }

    return { init, destroy };
})();
