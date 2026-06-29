function showToast(msg, type = 'success') {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className = `show ${type}`;
        setTimeout(() => { t.className = ''; }, 3000);
    }

    async function fetchStatus() {
        const res  = await fetch('/api/users');
        const data = await res.json();

        renderUsers(data.users);
        renderBlockchain(data.blockchain, data.blockchainValid, data.isTampered);
    }

    function renderUsers(users) {
        const tbody = document.getElementById('users-tbody');
        if (!users || users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#888;padding:20px;">Nema registrovanih korisnika.</td></tr>';
            return;
        }
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.email}</td>
                <td>${roleTag(u.role)}</td>
                <td style="font-size:11px;">${new Date(u.createdAt).toLocaleString()}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="openEdit(${u.id},'${u.username}','${u.email}','${u.role}')">Izmeni</button>
                    <button class="action-btn delete-btn" onclick="deleteUser(${u.id},'${u.username}')">Obriši</button>
                </td>
            </tr>
        `).join('');
    }

    function roleTag(role) {
        const map = { ADMIN: 'tag-admin', MODERATOR: 'tag-mod', USER: 'tag-user' };
        const labels = { ADMIN: 'Administrator', MODERATOR: 'Moderator', USER: 'Korisnik' };
        return `<span class="tag ${map[role] || 'tag-user'}">${labels[role] || role}</span>`;
    }

    function renderBlockchain(chain, valid, tampered) {
        const sc = document.getElementById('status-container');
        if (!valid || tampered) {
            sc.className = 'status-box status-error';
            sc.textContent = 'ALARM! Detektovana neovlašćena izmena u blockchain lancu!';
        } else {
            sc.className = 'status-box status-ok';
            sc.textContent = 'Sistem je bezbedan. Integritet podataka je očuvan.';
        }

        const view = document.getElementById('blockchain-view');
        view.innerHTML = '';
        chain.forEach(block => {
            const actionClass = `action-${block.action}`;
            const card = document.createElement('div');
            card.className = 'block-card';
            card.innerHTML = `
                <div class="block-header">
                    <span>Blok #${block.index}</span>
                    <span>${new Date(block.timestamp).toLocaleTimeString()}</span>
                </div>
                <div class="block-body">
                    <div><strong>Akcija:</strong> <span class="action-badge ${actionClass}">${block.action}</span></div>
                    <div><strong>Sadržani Hash podataka:</strong><br><span class="hash-text">${block.data}</span></div>
                    <div><strong>Prethodni Hash:</strong><br><span class="hash-text">${block.previousHash}</span></div>
                    <div><strong>Trenutni Hash bloka:</strong><br><span class="hash-text">${block.hash}</span></div>
                </div>
            `;
            view.appendChild(card);
        });
    }

    async function registerUser() {
        const username = document.getElementById('reg-username').value.trim();
        const email    = document.getElementById('reg-email').value.trim();
        const role     = document.getElementById('reg-role').value;

        if (!username || !email) { showToast('Unesite sva polja.', 'error'); return; }

        const res  = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, role })
        });
        const data = await res.json();

        showToast(data.message, data.success ? 'success' : 'error');
        if (data.success) {
            document.getElementById('reg-username').value = '';
            document.getElementById('reg-email').value    = '';
            fetchStatus();
        }
    }

    function openEdit(id, username, email, role) {
        document.getElementById('edit-id').value       = id;
        document.getElementById('edit-username').value = username;
        document.getElementById('edit-email').value    = email;
        document.getElementById('edit-role').value     = role;
        document.getElementById('edit-modal').classList.add('open');
    }

    function closeModal() {
        document.getElementById('edit-modal').classList.remove('open');
    }

    async function submitEdit() {
        const id       = document.getElementById('edit-id').value;
        const username = document.getElementById('edit-username').value.trim();
        const email    = document.getElementById('edit-email').value.trim();
        const role     = document.getElementById('edit-role').value;

        const res  = await fetch(`/api/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, role })
        });
        const data = await res.json();

        showToast(data.message, data.success ? 'success' : 'error');
        closeModal();
        if (data.success) fetchStatus();
    }

    async function deleteUser(id, username) {
        if (!confirm(`Da li ste sigurni da želite da obrišete korisnika "${username}"?`)) return;

        const res  = await fetch(`/api/users/${id}`, { method: 'DELETE' });
        const data = await res.json();

        showToast(data.message, data.success ? 'success' : 'error');
        if (data.success) fetchStatus();
    }

    async function simulateTamper() {
        const res  = await fetch('/api/tamper', { method: 'POST' });
        const data = await res.json();
        showToast(data.message, data.success ? 'error' : 'error');
        fetchStatus();
    }

    document.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !document.getElementById('edit-modal').classList.contains('open')) {
            registerUser();
        }
    });

    fetchStatus();