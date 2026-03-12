/* ══════════════════════════════════════════════
   Authentication Module
   ══════════════════════════════════════════════ */

const Auth = (() => {
    let currentUser = null;
    let isAdmin = false;
    const listeners = [];

    // ─── Google Sign-In ───
    function signIn() {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        return auth.signInWithPopup(provider).catch(err => {
            console.error("Sign-in error:", err.code, err.message);
            let msg = "Sign-in failed. ";
            if (err.code === 'auth/unauthorized-domain') {
                msg += "This domain is not authorized in Firebase. Add it under Authentication → Settings → Authorized domains.";
            } else if (err.code === 'auth/popup-blocked') {
                msg += "Popup was blocked. Please allow popups for this site.";
            } else if (err.code === 'auth/popup-closed-by-user') {
                msg += "Popup was closed before completing sign-in.";
            } else if (err.code === 'auth/operation-not-allowed') {
                msg += "Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.";
            } else {
                msg += err.message || "Please try again.";
            }
            Toast.show(msg, "error");
        });
    }

    // ─── Sign Out ───
    function signOut() {
        return auth.signOut().then(() => {
            Toast.show("Signed out successfully.", "info");
        }).catch(err => {
            console.error("Sign-out error:", err);
        });
    }

    // ─── Auth State Listener ───
    function init() {
        auth.onAuthStateChanged(user => {
            currentUser = user;
            isAdmin = user ? (user.email === ADMIN_EMAIL) : false;
            updateUI(user);
            listeners.forEach(fn => fn(user, isAdmin));
        });
    }

    // ─── Update Navbar UI ───
    function updateUI(user) {
        const btnLogin  = document.getElementById('btn-login');
        const btnLogout = document.getElementById('btn-logout');
        const badge     = document.getElementById('user-badge');
        const avatar    = document.getElementById('user-avatar');
        const userName  = document.getElementById('user-name');
        const navAdmin  = document.getElementById('nav-admin');

        if (user) {
            btnLogin.style.display  = 'none';
            badge.style.display     = 'flex';
            avatar.src              = user.photoURL || '';
            userName.textContent    = user.displayName || user.email;
            navAdmin.style.display  = isAdmin ? 'flex' : 'none';
        } else {
            btnLogin.style.display  = 'inline-flex';
            badge.style.display     = 'none';
            navAdmin.style.display  = 'none';
        }
    }

    // ─── Register auth change listener ───
    function onChange(fn) {
        listeners.push(fn);
    }

    // ─── Getters ───
    function getUser()    { return currentUser; }
    function getIsAdmin() { return isAdmin; }

    return { init, signIn, signOut, onChange, getUser, getIsAdmin };
})();
