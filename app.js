const SERVICES = [
    { id: 'Plumber', name: 'Plumber', icon: 'fa-faucet-drip' },
    { id: 'Electrician', name: 'Electrician', icon: 'fa-bolt' },
    { id: 'Masonry', name: 'Masonry', icon: 'fa-trowel-bricks' },
    { id: 'Earth & Excavation', name: 'Earth & Excavation', icon: 'fa-truck-monster' },
    { id: 'Carpentry', name: 'Carpentry', icon: 'fa-hammer' },
    { id: 'Painting', name: 'Painting', icon: 'fa-paint-roller' },
    { id: 'Fabrication', name: 'Fabrication', icon: 'fa-industry' },
    { id: 'Tiles Worker', name: 'Tiles Worker', icon: 'fa-border-all' },
    { id: 'Plot Worker', name: 'Plot Worker', icon: 'fa-person-digging' },
    { id: 'Bore Well', name: 'Bore Well', icon: 'fa-water' },
    { id: 'CCTV Installation', name: 'CCTV Installation', icon: 'fa-video' },
    { id: 'AC Installation', name: 'AC Installation', icon: 'fa-snowflake' },
    { id: 'Car Mechanic', name: 'Car Mechanic', icon: 'fa-car-burst' },
    { id: 'Cleaning', name: 'Cleaning', icon: 'fa-broom' }
];

const app = {
    state: {
        currentUser: null,
        authRole: 'receiver',     // 'receiver' | 'worker' | 'admin'
        authMode: 'signin',       // 'signin' | 'signup' | 'forgot'
        generatedOTP: null,
        selectedCategory: 'ALL',
        activeChatPeerId: null,
        cameraStream: null,
        users: [],
        blockedServices: [],
        bookings: [],
        messages: []
    },

    init() {
        this.loadStorage();
        this.populateServiceDropdowns();
        this.renderCategoryRibbon();
    },

    loadStorage() {
        const saved = localStorage.getItem('v_service_db_v1');
        if (saved) {
            const parsed = JSON.parse(saved);
            this.state.users = parsed.users || [];
            this.state.blockedServices = parsed.blockedServices || [];
            this.state.bookings = parsed.bookings || [];
            this.state.messages = parsed.messages || [];
        } else {
            // Seed initial demo data so the marketplace and admin graph look rich immediately
            this.state.users = [
                {
                    id: 'admin_1', role: 'admin', phone: '9999999999', password: 'admin', name: 'Master Admin', location: 'Headquarters'
                },
                {
                    id: 'wrk_1', role: 'worker', phone: '9876543210', servicePhone: '9876543210', password: '123',
                    name: 'Rajan Nair', service: 'Plumber', exp: 8, certPdf: 'National_Trade_Plumbing_Cert.pdf',
                    address: '14/B Mavoor Road, Kozhikode', location: 'Kozhikode',
                    avatar: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=200&q=80',
                    bio: 'Specialist in concealed pipeline fitting, high-pressure motor installation, and bathroom leak repair.',
                    approved: true, suspended: false,
                    portfolio: [
                        {
                            photo: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&q=80',
                            desc: 'Completed full CPVC concealed piping and overhead pressure pump setup for a 3BHK residential villa inside 4 days.'
                        }
                    ],
                    reviews: [
                        {
                            reviewer: 'Anand K', rating: 5,
                            comment: 'Very punctual and clean fitting work. Fixed our main valve leakage within an hour.',
                            photo: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&q=80',
                            date: '2026-10-18'
                        }
                    ]
                },
                {
                    id: 'wrk_2', role: 'worker', phone: '9876543211', servicePhone: '9876543211', password: '123',
                    name: 'Suresh Babu', service: 'Electrician', exp: 6, certPdf: 'KSEB_Wireman_License.pdf',
                    address: '22 MG Road, Kochi', location: 'Kozhikode',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
                    bio: '3-phase wiring, inverter setup, DB box dressing, and industrial earthing specialist.',
                    approved: true, suspended: false,
                    portfolio: [
                        {
                            photo: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
                            desc: 'Installed 8-way modular distribution board with surge protection and full inverter backup wiring for office.'
                        }
                    ],
                    reviews: []
                },
                {
                    id: 'wrk_3', role: 'worker', phone: '9876543212', servicePhone: '9876543212', password: '123',
                    name: 'basheer M', service: 'AC Installation', exp: 4, certPdf: 'HVAC_Diploma.pdf',
                    address: 'Palayam Cross, Kozhikode', location: 'Kozhikode',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
                    bio: 'Split & Cassette AC installation, copper piping, vacuum testing, and gas refilling.',
                    approved: false, suspended: false, // Pending Admin evaluation
                    portfolio: [],
                    reviews: []
                },
                {
                    id: 'rec_1', role: 'receiver', phone: '9123456789', password: '123',
                    name: 'Arjun Krishna', location: 'Kozhikode', suspended: false
                }
            ];
            this.state.bookings = [
                {
                    id: 'bk_101', receiverId: 'rec_1', receiverName: 'Arjun Krishna',
                    workerId: 'wrk_1', workerName: 'Rajan Nair', service: 'Plumber',
                    date: '2026-10-25', time: '10:30', status: 'Accepted', reviewed: false
                }
            ];
            this.state.messages = [
                {
                    id: 'msg_1', fromId: 'rec_1', fromName: 'Arjun Krishna', toId: 'wrk_1', toName: 'Rajan Nair',
                    text: 'Hello Rajan, are you available tomorrow morning for kitchen sink pipe fitting?', photo: null, time: '10:15 AM'
                }
            ];
            this.saveStorage();
        }
    },

    saveStorage() {
        localStorage.setItem('v_service_db_v1', JSON.stringify({
            users: this.state.users,
            blockedServices: this.state.blockedServices,
            bookings: this.state.bookings,
            messages: this.state.messages
        }));
    },

    showToast(msg) {
        const box = document.getElementById('toast-box');
        box.innerHTML = `<i class="fa-solid fa-bell"></i> ${msg}`;
        box.style.display = 'block';
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => { box.style.display = 'none'; }, 5500);
    },

    switchView(viewId) {
        document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');
    },

    goHome() {
        if (!this.state.currentUser) {
            this.switchView('view-landing');
        } else if (this.state.currentUser.role === 'receiver') {
            this.switchView('view-receiver');
            this.renderMarketplace();
        } else if (this.state.currentUser.role === 'worker') {
            this.switchView('view-worker');
            this.renderWorkerDashboard();
        } else if (this.state.currentUser.role === 'admin') {
            this.switchView('view-admin');
            this.renderAdminPortal();
        }
    },

    populateServiceDropdowns() {
        const wrkSelect = document.getElementById('wrk-service-cat');
        const adminSelect = document.getElementById('admin-worker-cat-filter');
        wrkSelect.innerHTML = SERVICES.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
        adminSelect.innerHTML = `<option value="ALL">All 14 Service Categories</option>` +
            SERVICES.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    },

    /* ==========================================
       AUTHENTICATION, 10-DIGIT PHONE & OTP FLOW
       ========================================== */
    openAuth(role) {
        this.state.authRole = role;
        this.state.generatedOTP = null;
        document.getElementById('auth-form').reset();
        document.getElementById('phone-error').style.display = 'none';
        document.getElementById('wrong-pass-error').style.display = 'none';
        document.getElementById('forgot-pass-box').style.display = 'none';

        const tabsBar = document.getElementById('auth-tabs-bar');
        if (role === 'admin') {
            // Admin Login: Strictly Sign In only, no Sign Up option
            tabsBar.style.display = 'none';
            this.switchAuthTab('signin');
            document.getElementById('auth-left-title').textContent = 'Admin Sign In';
            document.getElementById('auth-left-desc').textContent = 'Restricted portal. Sign in with Master Admin credentials (Demo: 9999999999 / admin).';
        } else {
            tabsBar.style.display = 'flex';
            this.switchAuthTab('signin');
            document.getElementById('auth-left-title').textContent = role === 'worker' ? 'Worker Portal' : 'Receiver Login';
            document.getElementById('auth-left-desc').textContent = role === 'worker'
                ? 'Sign in or register your service profile with 10-digit OTP verification.'
                : 'Sign in or create a Receiver account to hire verified professionals near you.';
        }
        this.switchView('view-auth');
    },

    switchAuthTab(mode) {
        this.state.authMode = mode;
        document.getElementById('tab-signin').classList.toggle('active', mode === 'signin');
        document.getElementById('tab-signup').classList.toggle('active', mode === 'signup');
        document.getElementById('wrong-pass-error').style.display = 'none';
        document.getElementById('forgot-pass-box').style.display = 'none';
        document.getElementById('password-label').textContent = mode === 'forgot' ? 'Create New Password' : 'Password';

        const isSignup = mode === 'signup';
        document.getElementById('otp-section').style.display = (isSignup || mode === 'forgot') ? 'block' : 'none';
        document.getElementById('signup-receiver-fields').style.display = (isSignup && this.state.authRole === 'receiver') ? 'block' : 'none';
        document.getElementById('signup-worker-fields').style.display = (isSignup && this.state.authRole === 'worker') ? 'block' : 'none';
        document.getElementById('auth-submit-btn').textContent = isSignup ? 'Verify OTP & Complete Sign Up' : (mode === 'forgot' ? 'Verify OTP & Reset Password' : 'Sign In');
    },

    validateTenDigitPhone(phone) {
        return /^\d{10}$/.test(phone.trim());
    },

    sendOTP() {
        const phone = document.getElementById('auth-phone').value.trim();
        const errEl = document.getElementById('phone-error');
        if (!this.validateTenDigitPhone(phone)) {
            errEl.style.display = 'block';
            this.showToast('Invalid Phone Number! Please enter exactly 10 digits.');
            return;
        }
        errEl.style.display = 'none';
        this.state.generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();
        document.getElementById('otp-hint').textContent = `OTP dispatched to +91-${phone} (Demo OTP: ${this.state.generatedOTP})`;
        this.showToast(`V-Service OTP for +91-${phone} is: ${this.state.generatedOTP}`);
    },

    triggerForgotPasswordOTP() {
        this.switchAuthTab('forgot');
        this.sendOTP();
    },

    checkWordLimit(textarea, counterId) {
        const words = textarea.value.trim().split(/\s+/).filter(Boolean);
        if (words.length > 50) {
            textarea.value = words.slice(0, 50).join(' ');
        }
        const count = textarea.value.trim().split(/\s+/).filter(Boolean).length;
        document.getElementById(counterId).textContent = `${count} / 50 words`;
    },

    readFileAsDataURL(fileInput) {
        return new Promise((resolve) => {
            if (!fileInput || !fileInput.files || !fileInput.files[0]) {
                resolve(null);
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(fileInput.files[0]);
        });
    },

    async handleAuthSubmit(e) {
        e.preventDefault();
        const phone = document.getElementById('auth-phone').value.trim();
        const password = document.getElementById('auth-password').value.trim();
        const phoneErr = document.getElementById('phone-error');

        // 1. Strict 10-Digit Phone Validation
        if (!this.validateTenDigitPhone(phone)) {
            phoneErr.style.display = 'block';
            return;
        }
        phoneErr.style.display = 'none';

        // 2. SIGN IN FLOW
        if (this.state.authMode === 'signin') {
            const user = this.state.users.find(u => u.phone === phone && u.role === this.state.authRole);
            if (!user) {
                this.showToast('Account not found with this 10-digit number. Please Sign Up first.');
                return;
            }
            if (user.suspended) {
                this.showToast('Your ID has been suspended by the Administrator.');
                return;
            }
            if (user.password !== password) {
                document.getElementById('wrong-pass-error').style.display = 'block';
                if (this.state.authRole !== 'admin') {
                    document.getElementById('forgot-pass-box').style.display = 'block';
                }
                return;
            }
            this.completeLogin(user);
            return;
        }

        // 3. FORGOT PASSWORD RESET VIA OTP
        if (this.state.authMode === 'forgot') {
            const enteredOtp = document.getElementById('auth-otp').value.trim();
            if (!this.state.generatedOTP || enteredOtp !== this.state.generatedOTP) {
                this.showToast('Invalid OTP! Please verify the 4-digit OTP.');
                return;
            }
            const user = this.state.users.find(u => u.phone === phone && u.role === this.state.authRole);
            if (user) {
                user.password = password;
                this.saveStorage();
                this.showToast('Password updated! Logging you in...');
                this.completeLogin(user);
            }
            return;
        }

        // 4. NEW USER SIGN UP WITH OTP VERIFICATION
        const enteredOtp = document.getElementById('auth-otp').value.trim();
        if (!this.state.generatedOTP || enteredOtp !== this.state.generatedOTP) {
            this.showToast('Please click "Send OTP" and enter the valid 4-digit OTP first.');
            return;
        }

        if (this.state.users.some(u => u.phone === phone && u.role === this.state.authRole)) {
            this.showToast('Phone number already registered! Please switch to Sign In.');
            return;
        }

        if (this.state.authRole === 'receiver') {
            const name = document.getElementById('rec-name').value.trim() || 'Receiver User';
            const location = document.getElementById('rec-location').value.trim() || 'Kozhikode';
            const newRec = {
                id: 'rec_' + Date.now(),
                role: 'receiver',
                phone,
                password,
                name,
                location,
                suspended: false
            };
            this.state.users.push(newRec);
            this.saveStorage();
            this.completeLogin(newRec);
        } else if (this.state.authRole === 'worker') {
            const servicePhone = document.getElementById('wrk-service-phone').value.trim() || phone;
            if (!this.validateTenDigitPhone(servicePhone)) {
                this.showToast('Service Phone Number must be 10 digits.');
                return;
            }
            const avatarData = await this.readFileAsDataURL(document.getElementById('wrk-avatar'));
            const workPhotoData = await this.readFileAsDataURL(document.getElementById('wrk-work-photo'));
            const workDesc = document.getElementById('wrk-work-desc').value.trim();
            const certInput = document.getElementById('wrk-cert-pdf');
            const certName = (certInput.files && certInput.files[0]) ? certInput.files[0].name : 'None Uploaded';

            const portfolio = [];
            if (workPhotoData || workDesc) {
                portfolio.push({
                    photo: workPhotoData || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
                    desc: workDesc || 'Completed service work project.'
                });
            }

            const newWorker = {
                id: 'wrk_' + Date.now(),
                role: 'worker',
                phone,
                servicePhone,
                password,
                name: document.getElementById('wrk-name').value.trim() || 'Service Pro',
                service: document.getElementById('wrk-service-cat').value,
                exp: parseInt(document.getElementById('wrk-exp').value, 10) || 1,
                certPdf: certName,
                address: document.getElementById('wrk-address').value.trim() || 'Local Address',
                location: document.getElementById('wrk-location').value.trim() || 'Kozhikode',
                avatar: avatarData || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
                bio: document.getElementById('wrk-bio').value.trim() || 'Professional service specialist.',
                approved: false, // Requires Admin Approval before Receivers can see profile
                suspended: false,
                portfolio,
                reviews: []
            };
            this.state.users.push(newWorker);
            this.saveStorage();
            this.completeLogin(newWorker);
        }
    },

    completeLogin(user) {
        this.state.currentUser = user;
        document.getElementById('role-badge').style.display = 'inline-block';
        document.getElementById('role-badge').innerHTML = `<i class="fa-solid fa-circle-user"></i> ${user.name} (${user.role.toUpperCase()})`;
        document.getElementById('btn-logout').style.display = 'inline-block';
        document.getElementById('btn-admin-portal').style.display = 'none';
        document.getElementById('btn-edit-my-profile').style.display = user.role === 'admin' ? 'none' : 'inline-block';
        document.getElementById('header-search-area').style.display = user.role === 'receiver' ? 'flex' : 'none';

        if (user.role === 'receiver') {
            document.getElementById('location-filter').value = user.location || '';
        }
        this.goHome();
    },

    logout() {
        this.state.currentUser = null;
        document.getElementById('role-badge').style.display = 'none';
        document.getElementById('btn-logout').style.display = 'none';
        document.getElementById('btn-edit-my-profile').style.display = 'none';
        document.getElementById('btn-admin-portal').style.display = 'inline-block';
        document.getElementById('header-search-area').style.display = 'none';
        this.switchView('view-landing');
    },

    /* ==========================================
       RECEIVER MARKETPLACE (FLIPKART INTERFACE)
       ========================================== */
    detectGPSLocation() {
        if (!navigator.geolocation) {
            this.showToast('Geolocation not supported by browser. Enter city manually.');
            return;
        }
        this.showToast('Accessing GPS Location...');
        navigator.geolocation.getCurrentPosition(
            () => {
                document.getElementById('location-filter').value = 'Kozhikode';
                this.showToast('Location set to Kozhikode via GPS');
                this.renderMarketplace();
            },
            () => {
                document.getElementById('location-filter').value = 'Kozhikode';
                this.showToast('Using default city: Kozhikode');
                this.renderMarketplace();
            }
        );
    },

    renderCategoryRibbon() {
        const ribbon = document.getElementById('category-ribbon');
        const allItem = `
            <div class="cat-item ${this.state.selectedCategory === 'ALL' ? 'active' : ''}" onclick="app.selectCategory('ALL')">
                <i class="fa-solid fa-layer-group"></i>
                <span>All Services</span>
            </div>`;
        const items = SERVICES.map(s => {
            const isBlocked = this.state.blockedServices.includes(s.id);
            return `
                <div class="cat-item ${this.state.selectedCategory === s.id ? 'active' : ''} ${isBlocked ? 'blocked' : ''}"
                     onclick="${isBlocked ? `app.showToast('${s.name} is temporarily blocked by Admin')` : `app.selectCategory('${s.id}')`}">
                    <i class="fa-solid ${s.icon}"></i>
                    <span>${s.name}</span>
                </div>`;
        }).join('');
        ribbon.innerHTML = allItem + items;
    },

    selectCategory(catId) {
        this.state.selectedCategory = catId;
        this.renderCategoryRibbon();
        this.renderMarketplace();
    },

    renderMarketplace() {
        this.renderCategoryRibbon();
        const locQuery = (document.getElementById('location-filter').value || '').toLowerCase().trim();
        const textQuery = (document.getElementById('global-search').value || '').toLowerCase().trim();

        // Only show Workers who are APPROVED by Admin, NOT suspended, and whose service is NOT blocked
        const visibleWorkers = this.state.users.filter(u => {
            if (u.role !== 'worker' || !u.approved || u.suspended) return false;
            if (this.state.blockedServices.includes(u.service)) return false;
            if (this.state.selectedCategory !== 'ALL' && u.service !== this.state.selectedCategory) return false;
            if (locQuery && !u.location.toLowerCase().includes(locQuery)) return false;
            if (textQuery && !(u.name.toLowerCase().includes(textQuery) || u.service.toLowerCase().includes(textQuery) || u.bio.toLowerCase().includes(textQuery))) return false;
            return true;
        });

        document.getElementById('marketplace-heading').textContent =
            this.state.selectedCategory === 'ALL' ? 'Verified Service Professionals' : `${this.state.selectedCategory} Specialists`;
        document.getElementById('worker-count-label').textContent = `${visibleWorkers.length} Pros Available`;

        const grid = document.getElementById('workers-grid');
        if (visibleWorkers.length === 0) {
            grid.innerHTML = `<p style="color:#878787; padding:20px;">No verified workers match your location/filter criteria. Clear the location filter to view all locations.</p>`;
        } else {
            grid.innerHTML = visibleWorkers.map(w => {
                const avgRating = w.reviews.length
                    ? (w.reviews.reduce((a, b) => a + b.rating, 0) / w.reviews.length).toFixed(1)
                    : '4.5';
                return `
                    <div class="worker-card">
                        <div>
                            <div class="worker-card-header">
                                <img src="${w.avatar}" class="worker-avatar" alt="${w.name}">
                                <div>
                                    <h4>${w.name}</h4>
                                    <span class="verified-tag"><i class="fa-solid fa-circle-check"></i> V-Service Assured</span>
                                    <div style="margin-top:4px;">
                                        <span class="fk-rating-badge">${avgRating} <i class="fa-solid fa-star"></i></span>
                                        <small style="color:#878787;">(${w.reviews.length} Reviews)</small>
                                    </div>
                                </div>
                            </div>
                            <p style="font-size:13px; margin-bottom:6px;"><strong>Service:</strong> ${w.service} (${w.exp} Yrs Exp)</p>
                            <p style="font-size:13px; margin-bottom:6px;"><i class="fa-solid fa-location-dot"></i> ${w.location} | <i class="fa-solid fa-phone"></i> +91-${w.servicePhone}</p>
                            <p style="font-size:12px; color:#555; margin-bottom:12px;">${w.bio}</p>
                        </div>
                        <div style="display:flex; gap:8px;">
                            <button class="fk-btn-blue" style="flex:1;" onclick="app.openWorkerDetail('${w.id}')">
                                <i class="fa-solid fa-eye"></i> View & Book
                            </button>
                            <button class="fk-btn-orange" onclick="app.openChatModal('${w.id}')" title="Message & Share Camera Photo">
                                <i class="fa-solid fa-comment-dots"></i>
                            </button>
                        </div>
                    </div>`;
            }).join('');
        }

        this.renderReceiverBookings();
    },

    renderReceiverBookings() {
        const list = document.getElementById('receiver-bookings-list');
        const myBookings = this.state.bookings.filter(b => b.receiverId === this.state.currentUser.id);
        if (myBookings.length === 0) {
            list.innerHTML = `<p style="font-size:12px; color:#878787; margin-top:8px;">No bookings scheduled yet.</p>`;
            return;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        list.innerHTML = myBookings.map(b => {
            const isDateEnded = b.date <= todayStr || b.status === 'Completed';
            return `
                <div style="border-bottom:1px solid #eee; padding:10px 0; font-size:13px;">
                    <strong>${b.service} - ${b.workerName}</strong><br>
                    <span><i class="fa-regular fa-calendar"></i> ${b.date} at ${b.time}</span><br>
                    <span>Status: <strong style="color:#2874f0;">${b.status}</strong></span>
                    ${isDateEnded && !b.reviewed ? `
                        <div style="margin-top:6px;">
                            <button class="fk-btn-green" style="font-size:11px; padding:5px 8px;" onclick="app.openWorkerDetail('${b.workerId}')">
                                <i class="fa-solid fa-star"></i> Write Public Review
                            </button>
                        </div>
                    ` : ''}
                </div>`;
        }).join('');
    },

    openWorkerDetail(workerId) {
        const w = this.state.users.find(u => u.id === workerId);
        if (!w) return;
        document.getElementById('detail-worker-title').textContent = `${w.name} — ${w.service} Specialist`;

        const todayStr = new Date().toISOString().split('T')[0];
        const canReview = this.state.bookings.some(
            b => b.receiverId === this.state.currentUser.id && b.workerId === w.id && (b.date <= todayStr || b.status === 'Completed')
        );

        const portfolioHtml = w.portfolio.length ? w.portfolio.map(p => `
            <div class="portfolio-card">
                <img src="${p.photo}" alt="Work Photo">
                <p style="font-size:12px; color:#333;">${p.desc}</p>
            </div>`).join('') : `<p style="font-size:13px; color:#878787;">No portfolio photos uploaded yet.</p>`;

        const reviewsHtml = w.reviews.length ? w.reviews.map(r => `
            <div style="border-bottom:1px solid #e0e0e0; padding:10px 0;">
                <span class="fk-rating-badge">${r.rating} <i class="fa-solid fa-star"></i></span>
                <strong style="margin-left:8px; font-size:14px;">${r.reviewer}</strong>
                <small style="color:#878787; margin-left:8px;">${r.date}</small>
                <p style="font-size:13px; margin:6px 0;">${r.comment}</p>
                ${r.photo ? `<img src="${r.photo}" style="width:90px; height:90px; object-fit:cover; border-radius:3px; border:1px solid #ccc;">` : ''}
            </div>`).join('') : `<p style="font-size:13px; color:#878787;">No public reviews yet.</p>`;

        document.getElementById('detail-worker-content').innerHTML = `
            <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap; margin-bottom:16px;">
                <img src="${w.avatar}" style="width:85px; height:85px; border-radius:50%; object-fit:cover; border:2px solid #2874f0;">
                <div style="flex:1;">
                    <h3>${w.name} <span class="verified-tag"><i class="fa-solid fa-circle-check"></i> Verified by Admin</span></h3>
                    <p style="font-size:13px; margin:4px 0;"><strong>Service:</strong> ${w.service} | <strong>Experience:</strong> ${w.exp} Years</p>
                    <p style="font-size:13px; margin:4px 0;"><strong>Service Phone:</strong> +91-${w.servicePhone} | <strong>Location:</strong> ${w.location}</p>
                    <p style="font-size:13px; margin:4px 0;"><strong>Address:</strong> ${w.address} | <strong>Certificate PDF:</strong> ${w.certPdf}</p>
                </div>
                <button class="fk-btn-orange" onclick="app.closeModal('modal-worker-detail'); app.openChatModal('${w.id}')">
                    <i class="fa-solid fa-camera"></i> Message / Send Photo
                </button>
            </div>

            <!-- Booking Box -->
            <div style="background:#f4f8ff; border:1px solid #2874f0; padding:14px; border-radius:2px; margin-bottom:18px;">
                <h4><i class="fa-solid fa-calendar-plus"></i> Book This Worker</h4>
                <div style="display:flex; gap:10px; margin-top:8px; flex-wrap:wrap;">
                    <input type="date" id="book-date" value="${todayStr}" style="padding:8px; border:1px solid #ccc;">
                    <input type="time" id="book-time" value="10:00" style="padding:8px; border:1px solid #ccc;">
                    <button class="fk-btn-blue" onclick="app.bookWorker('${w.id}')"><i class="fa-solid fa-check"></i> Confirm Booking Request</button>
                </div>
                <small style="color:#666; display:block; margin-top:6px;">Tip: Selecting today's or a past date allows you to test the post-schedule Public Review right away.</small>
            </div>

            <h4><i class="fa-solid fa-briefcase"></i> Worker's Portfolio (With 50-Word Descriptions)</h4>
            <div class="portfolio-grid" style="margin-bottom:18px;">${portfolioHtml}</div>

            <h4><i class="fa-solid fa-star"></i> Customer Public Reviews (Flipkart Style)</h4>
            <div style="margin-top:8px; margin-bottom:16px;">${reviewsHtml}</div>

            ${canReview ? `
                <div style="background:#fff8e1; border:1px solid #ffe082; padding:14px; border-radius:2px;">
                    <h4><i class="fa-solid fa-pen-to-square"></i> Scheduled Date Ended — Post Public Review with Photo</h4>
                    <div class="form-grid-2" style="margin-top:8px;">
                        <div class="form-group">
                            <label>Star Rating</label>
                            <select id="rev-rating">
                                <option value="5">5 Stars - Excellent</option>
                                <option value="4">4 Stars - Good</option>
                                <option value="3">3 Stars - Average</option>
                                <option value="2">2 Stars - Poor</option>
                                <option value="1">1 Star - Bad</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Upload Work Completion Photo</label>
                            <input type="file" id="rev-photo" accept="image/*">
                        </div>
                    </div>
                    <div class="form-group">
                        <textarea id="rev-comment" rows="2" placeholder="Share your experience with this worker..."></textarea>
                    </div>
                    <button class="fk-btn-green" onclick="app.submitPublicReview('${w.id}')"><i class="fa-solid fa-upload"></i> Publish Review</button>
                </div>
            ` : `<small style="color:#878787;">Public review form unlocks automatically once your booked schedule date has ended.</small>`}
        `;

        document.getElementById('modal-worker-detail').style.display = 'flex';
    },

    bookWorker(workerId) {
        const w = this.state.users.find(u => u.id === workerId);
        const date = document.getElementById('book-date').value;
        const time = document.getElementById('book-time').value;
        if (!date || !time) {
            this.showToast('Please select both date and time.');
            return;
        }
        this.state.bookings.push({
            id: 'bk_' + Date.now(),
            receiverId: this.state.currentUser.id,
            receiverName: this.state.currentUser.name,
            workerId: w.id,
            workerName: w.name,
            service: w.service,
            date,
            time,
            status: 'Pending Worker Acceptance',
            reviewed: false
        });
        this.saveStorage();
        this.showToast(`Booking requested with ${w.name} for ${date} at ${time}!`);
        this.openWorkerDetail(workerId);
        this.renderReceiverBookings();
    },

    async submitPublicReview(workerId) {
        const w = this.state.users.find(u => u.id === workerId);
        const rating = parseInt(document.getElementById('rev-rating').value, 10);
        const comment = document.getElementById('rev-comment').value.trim();
        if (!comment) {
            this.showToast('Please write a review comment.');
            return;
        }
        const photoData = await this.readFileAsDataURL(document.getElementById('rev-photo'));
        w.reviews.unshift({
            reviewer: this.state.currentUser.name,
            rating,
            comment,
            photo: photoData,
            date: new Date().toISOString().split('T')[0]
        });
        this.state.bookings.forEach(b => {
            if (b.receiverId === this.state.currentUser.id && b.workerId === workerId) b.reviewed = true;
        });
        this.saveStorage();
        this.showToast('Public Review with Photo published!');
        this.openWorkerDetail(workerId);
        this.renderMarketplace();
    },

    /* ==========================================
       WORKER DASHBOARD FLOW
       ========================================== */
    renderWorkerDashboard() {
        const w = this.state.currentUser;
        const banner = document.getElementById('worker-approval-banner');
        if (w.approved) {
            banner.style.background = '#e8f5e9';
            banner.style.color = '#2e7d32';
            banner.innerHTML = `<i class="fa-solid fa-circle-check"></i> Your Worker Profile is Verified and Live to Receivers in ${w.location}!`;
        } else {
            banner.style.background = '#fff3e0';
            banner.style.color = '#e65100';
            banner.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Your Profile is Pending Admin Evaluation. Receivers will see your profile once the Admin approves it.`;
        }

        document.getElementById('worker-self-summary').innerHTML = `
            <div style="display:flex; gap:12px; align-items:center; margin:12px 0;">
                <img src="${w.avatar}" class="worker-avatar">
                <div>
                    <h4>${w.name} (${w.service})</h4>
                    <p style="font-size:13px;">Exp: ${w.exp} Yrs | Service Ph: +91-${w.servicePhone}</p>
                    <p style="font-size:12px; color:#666;">Location: ${w.location} | Cert: ${w.certPdf}</p>
                </div>
            </div>
            <p style="font-size:13px; margin-bottom:10px;">${w.bio}</p>
            <div class="portfolio-grid">
                ${w.portfolio.map(p => `
                    <div class="portfolio-card">
                        <img src="${p.photo}">
                        <p style="font-size:12px;">${p.desc}</p>
                    </div>`).join('')}
            </div>
        `;

        const myBookings = this.state.bookings.filter(b => b.workerId === w.id);
        const bList = document.getElementById('worker-bookings-list');
        bList.innerHTML = myBookings.length ? myBookings.map(b => `
            <div style="border:1px solid #e0e0e0; padding:10px; margin-top:8px; border-radius:2px; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong>Customer: ${b.receiverName}</strong><br>
                    <small>Scheduled: ${b.date} at ${b.time} | Status: <strong>${b.status}</strong></small>
                </div>
                <div style="display:flex; gap:6px;">
                    ${b.status === 'Pending Worker Acceptance' ? `
                        <button class="fk-btn-green" onclick="app.workerRespondBooking('${b.id}', 'Accepted')">Accept</button>
                    ` : ''}
                    ${b.status === 'Accepted' ? `
                        <button class="fk-btn-blue" onclick="app.workerRespondBooking('${b.id}', 'Completed')">Mark Completed</button>
                    ` : ''}
                    <button class="fk-btn-orange" onclick="app.openChatModal('${b.receiverId}')"><i class="fa-solid fa-comments"></i> Chat</button>
                </div>
            </div>
        `).join('') : `<p style="font-size:13px; color:#878787; margin-top:8px;">No booking requests yet.</p>`;

        // Render unique receivers who messaged this worker
        const peerIds = [...new Set(this.state.messages.filter(m => m.toId === w.id || m.fromId === w.id).map(m => m.fromId === w.id ? m.toId : m.fromId))];
        const chatList = document.getElementById('worker-chats-list');
        chatList.innerHTML = peerIds.length ? peerIds.map(pid => {
            const peer = this.state.users.find(u => u.id === pid);
            return peer ? `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
                    <span><i class="fa-solid fa-user"></i> ${peer.name} (+91-${peer.phone})</span>
                    <button class="fk-btn-blue" onclick="app.openChatModal('${peer.id}')"><i class="fa-solid fa-reply"></i> Open Chat & Camera</button>
                </div>` : '';
        }).join('') : `<p style="font-size:13px; color:#878787; margin-top:8px;">No messages yet.</p>`;
    },

    workerRespondBooking(bookingId, newStatus) {
        const b = this.state.bookings.find(x => x.id === bookingId);
        if (b) {
            b.status = newStatus;
            this.saveStorage();
            this.showToast(`Booking status updated to ${newStatus}`);
            this.renderWorkerDashboard();
        }
    },

    async addPortfolioItem() {
        const photoInput = document.getElementById('add-port-photo');
        const desc = document.getElementById('add-port-desc').value.trim();
        if (!desc) {
            this.showToast('Please enter a description (up to 50 words).');
            return;
        }
        const photoData = await this.readFileAsDataURL(photoInput);
        this.state.currentUser.portfolio.push({
            photo: photoData || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
            desc
        });
        this.saveStorage();
        document.getElementById('add-port-desc').value = '';
        this.showToast('Work photo added to your public portfolio!');
        this.renderWorkerDashboard();
    },

    /* ==========================================
       CHAT WITH GALLERY & LIVE INSTANT CAMERA
       ========================================== */
    openChatModal(peerId) {
        this.state.activeChatPeerId = peerId;
        const peer = this.state.users.find(u => u.id === peerId);
        document.getElementById('chat-header-title').innerHTML = `<i class="fa-solid fa-comments"></i> Chat with ${peer ? peer.name : 'User'}`;
        document.getElementById('modal-chat').style.display = 'flex';
        this.renderChatMessages();
    },

    closeChatModal() {
        this.stopCameraStream();
        document.getElementById('modal-chat').style.display = 'none';
    },

    renderChatMessages() {
        const box = document.getElementById('chat-messages-box');
        const myId = this.state.currentUser.id;
        const peerId = this.state.activeChatPeerId;
        const thread = this.state.messages.filter(
            m => (m.fromId === myId && m.toId === peerId) || (m.fromId === peerId && m.toId === myId)
        );
        box.innerHTML = thread.length ? thread.map(m => `
            <div class="msg-bubble ${m.fromId === myId ? 'msg-sent' : 'msg-received'}">
                <div><strong>${m.fromName}:</strong> ${m.text || ''}</div>
                ${m.photo ? `<img src="${m.photo}" alt="Shared Photo">` : ''}
                <small style="font-size:10px; opacity:0.75; display:block; margin-top:4px;">${m.time}</small>
            </div>
        `).join('') : `<p style="text-align:center; color:#878787; font-size:13px;">Start messaging or share photos from Gallery or Instant Camera.</p>`;
        box.scrollTop = box.scrollHeight;
    },

    pushMessage(text, photoData) {
        const peer = this.state.users.find(u => u.id === this.state.activeChatPeerId);
        if (!peer) return;
        this.state.messages.push({
            id: 'msg_' + Date.now(),
            fromId: this.state.currentUser.id,
            fromName: this.state.currentUser.name,
            toId: peer.id,
            toName: peer.name,
            text,
            photo: photoData,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        this.saveStorage();
        this.renderChatMessages();
    },

    sendTextMessage() {
        const input = document.getElementById('chat-text-input');
        const text = input.value.trim();
        if (!text) return;
        this.pushMessage(text, null);
        input.value = '';
    },

    async sendGalleryPhoto(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            this.pushMessage('Shared a photo from Gallery', e.target.result);
        };
        reader.readAsDataURL(file);
    },

    async startCameraStream() {
        const viewfinder = document.getElementById('camera-viewfinder');
        const video = document.getElementById('camera-video');
        viewfinder.style.display = 'block';
        try {
            this.state.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = this.state.cameraStream;
        } catch (err) {
            this.showToast('Webcam unavailable or permission denied. Sending simulated instant camera snapshot.');
            this.pushMessage('Shared an Instant Camera Snapshot', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=400&q=80');
            viewfinder.style.display = 'none';
        }
    },

    captureCameraPhoto() {
        const video = document.getElementById('camera-video');
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        this.pushMessage('Captured via Instant Camera', dataUrl);
        this.stopCameraStream();
    },

    stopCameraStream() {
        if (this.state.cameraStream) {
            this.state.cameraStream.getTracks().forEach(t => t.stop());
            this.state.cameraStream = null;
        }
        document.getElementById('camera-viewfinder').style.display = 'none';
    },

    /* ==========================================
       ADMIN PORTAL: ANALYTICS, VERIFY, SUSPEND, BLOCK
       ========================================== */
    switchAdminTab(tabName, btn) {
        document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.admin-tab-body').forEach(b => b.classList.remove('active'));
        document.getElementById('admin-tab-' + tabName).classList.add('active');
        this.renderAdminPortal();
    },

    renderAdminPortal() {
        const totalOrders = 142 + this.state.bookings.length;
        const ordersPerHour = (totalOrders / 24).toFixed(2);
        const ordersPerMin = (totalOrders / 1440).toFixed(3);
        const pendingCount = this.state.users.filter(u => u.role === 'worker' && !u.approved).length;

        document.getElementById('kpi-month-orders').textContent = totalOrders;
        document.getElementById('kpi-hour-orders').textContent = ordersPerHour;
        document.getElementById('kpi-min-orders').textContent = ordersPerMin;
        document.getElementById('kpi-pending-workers').textContent = pendingCount;

        this.drawPerformanceGraph();
        this.renderAdminWorkers();
        this.renderAdminReceivers();
        this.renderAdminServices();
        this.renderAdminMessages();
    },

    drawPerformanceGraph() {
        const canvas = document.getElementById('admin-performance-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const dataPoints = [12, 19, 15, 25, 22, 30, 28, 35, 42, 38, 48, 55 + this.state.bookings.length];
        const labels = ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 28', 'Yesterday', 'Today'];
        const barWidth = 48;
        const gap = 26;
        const startX = 45;
        const baseY = 260;

        ctx.fillStyle = '#878787';
        ctx.font = '12px Roboto';
        dataPoints.forEach((val, idx) => {
            const x = startX + idx * (barWidth + gap);
            const barHeight = val * 3.5;
            const y = baseY - barHeight;

            ctx.fillStyle = idx === dataPoints.length - 1 ? '#fb641b' : '#2874f0';
            ctx.fillRect(x, y, barWidth, barHeight);

            ctx.fillStyle = '#212121';
            ctx.fillText(val, x + 14, y - 6);
            ctx.fillStyle = '#666';
            ctx.fillText(labels[idx], x + 4, baseY + 18);
        });
    },

    renderAdminWorkers() {
        const catFilter = document.getElementById('admin-worker-cat-filter').value;
        const workers = this.state.users.filter(
            u => u.role === 'worker' && (catFilter === 'ALL' || u.service === catFilter)
        );
        const container = document.getElementById('admin-workers-container');
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Name & Phone</th>
                        <th>Classified Service</th>
                        <th>Exp & Cert PDF</th>
                        <th>Location</th>
                        <th>Verification Status</th>
                        <th>Admin Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${workers.map(w => `
                        <tr>
                            <td><strong>${w.name}</strong><br>+91-${w.phone}</td>
                            <td>${w.service}</td>
                            <td>${w.exp} Yrs<br><small>${w.certPdf}</small></td>
                            <td>${w.location}</td>
                            <td>
                                ${w.approved ? '<span style="color:#388e3c; font-weight:700;">Verified & Live</span>' : '<span style="color:#e65100; font-weight:700;">Pending Evaluation</span>'}
                                ${w.suspended ? '<br><span style="color:#d32f2f; font-weight:700;">[SUSPENDED]</span>' : ''}
                            </td>
                            <td style="display:flex; gap:6px; flex-wrap:wrap;">
                                <button class="fk-btn-green" onclick="app.adminToggleApprove('${w.id}')">
                                    ${w.approved ? 'Revoke' : 'Approve & Verify'}
                                </button>
                                <button class="fk-btn-orange" onclick="app.adminToggleSuspend('${w.id}')">
                                    ${w.suspended ? 'Unsuspend ID' : 'Suspend ID'}
                                </button>
                                <button class="fk-btn-blue" onclick="app.openEditProfileById('${w.id}')">Edit</button>
                                <button class="fk-btn-danger" onclick="app.adminDeleteUser('${w.id}')">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    renderAdminReceivers() {
        const receivers = this.state.users.filter(u => u.role === 'receiver');
        document.getElementById('admin-receivers-container').innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Receiver Name</th>
                        <th>Phone Number</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Admin Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${receivers.map(r => `
                        <tr>
                            <td><strong>${r.name}</strong></td>
                            <td>+91-${r.phone}</td>
                            <td>${r.location}</td>
                            <td>${r.suspended ? '<span style="color:#d32f2f; font-weight:700;">Suspended</span>' : '<span style="color:#388e3c;">Active</span>'}</td>
                            <td style="display:flex; gap:6px;">
                                <button class="fk-btn-orange" onclick="app.adminToggleSuspend('${r.id}')">${r.suspended ? 'Unsuspend' : 'Suspend ID'}</button>
                                <button class="fk-btn-blue" onclick="app.openEditProfileById('${r.id}')">Edit Profile</button>
                                <button class="fk-btn-danger" onclick="app.adminDeleteUser('${r.id}')">Delete ID</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>`;
    },

    renderAdminServices() {
        const grid = document.getElementById('admin-services-grid');
        grid.innerHTML = SERVICES.map(s => {
            const isBlocked = this.state.blockedServices.includes(s.id);
            return `
                <div class="service-toggle-card">
                    <div>
                        <i class="fa-solid ${s.icon}" style="color:#2874f0; margin-right:6px;"></i>
                        <strong>${s.name}</strong>
                        <div style="font-size:11px; color:${isBlocked ? '#d32f2f' : '#388e3c'};">
                            ${isBlocked ? 'Temporarily Blocked' : 'Active on App'}
                        </div>
                    </div>
                    <button class="${isBlocked ? 'fk-btn-green' : 'fk-btn-danger'}" onclick="app.adminToggleServiceBlock('${s.id}')">
                        ${isBlocked ? 'Unblock' : 'Block'}
                    </button>
                </div>`;
        }).join('');
    },

    renderAdminMessages() {
        const log = document.getElementById('admin-messages-log');
        log.innerHTML = this.state.messages.length ? this.state.messages.map(m => `
            <div style="border-bottom:1px solid #eee; padding:10px 0; font-size:13px;">
                <strong>From:</strong> ${m.fromName} <i class="fa-solid fa-arrow-right"></i> <strong>To:</strong> ${m.toName}
                <span style="color:#878787; margin-left:8px;">(${m.time})</span>
                <p style="margin-top:4px;">${m.text}</p>
                ${m.photo ? `<img src="${m.photo}" style="height:60px; border-radius:2px; margin-top:4px;">` : ''}
            </div>
        `).join('') : `<p>No worker messages recorded.</p>`;
    },

    adminToggleApprove(uid) {
        const u = this.state.users.find(x => x.id === uid);
        if (u) {
            u.approved = !u.approved;
            this.saveStorage();
            this.showToast(`${u.name} verification status updated!`);
            this.renderAdminPortal();
        }
    },

    adminToggleSuspend(uid) {
        const u = this.state.users.find(x => x.id === uid);
        if (u) {
            u.suspended = !u.suspended;
            this.saveStorage();
            this.showToast(`${u.name} account ${u.suspended ? 'Suspended' : 'Restored'}.`);
            this.renderAdminPortal();
        }
    },

    adminDeleteUser(uid) {
        this.state.users = this.state.users.filter(x => x.id !== uid);
        this.saveStorage();
        this.showToast('User ID permanently deleted.');
        this.renderAdminPortal();
    },

    adminToggleServiceBlock(serviceId) {
        const idx = this.state.blockedServices.indexOf(serviceId);
        if (idx > -1) {
            this.state.blockedServices.splice(idx, 1);
            this.showToast(`${serviceId} unblocked and visible to Receivers.`);
        } else {
            this.state.blockedServices.push(serviceId);
            this.showToast(`${serviceId} temporarily blocked from the application.`);
        }
        this.saveStorage();
        this.renderAdminPortal();
    },

    /* ==========================================
       UNIVERSAL PROFILE EDITING (ALL USERS)
       ========================================== */
    openEditSelfModal() {
        if (!this.state.currentUser) return;
        this.openEditProfileById(this.state.currentUser.id);
    },

    openEditProfileById(uid) {
        const u = this.state.users.find(x => x.id === uid);
        if (!u) return;
        document.getElementById('edit-user-id').value = u.id;
        document.getElementById('edit-name').value = u.name || '';
        document.getElementById('edit-location').value = u.location || '';

        const wrkExtra = document.getElementById('edit-worker-extra');
        if (u.role === 'worker') {
            wrkExtra.style.display = 'block';
            document.getElementById('edit-service-phone').value = u.servicePhone || u.phone;
            document.getElementById('edit-exp').value = u.exp || 0;
            document.getElementById('edit-address').value = u.address || '';
            document.getElementById('edit-bio').value = u.bio || '';
        } else {
            wrkExtra.style.display = 'none';
        }
        document.getElementById('modal-edit-profile').style.display = 'flex';
    },

    saveEditedProfile(e) {
        e.preventDefault();
        const uid = document.getElementById('edit-user-id').value;
        const u = this.state.users.find(x => x.id === uid);
        if (!u) return;

        u.name = document.getElementById('edit-name').value.trim();
        u.location = document.getElementById('edit-location').value.trim();
        if (u.role === 'worker') {
            u.servicePhone = document.getElementById('edit-service-phone').value.trim();
            u.exp = parseInt(document.getElementById('edit-exp').value, 10) || 0;
            u.address = document.getElementById('edit-address').value.trim();
            u.bio = document.getElementById('edit-bio').value.trim();
        }
        this.saveStorage();
        this.closeModal('modal-edit-profile');
        this.showToast('Profile updated!');
        this.goHome();
    },

    closeModal(id) {
        document.getElementById(id).style.display = 'none';
    }
};

window.addEventListener('DOMContentLoaded', () => app.init());