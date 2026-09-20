function switchTab(tab){
    const isSignin = tab === 'signin';
    document.getElementById('tab-signin').classList.toggle('active', isSignin);
    document.getElementById('tab-signup').classList.toggle('active', !isSignin);
    document.getElementById('tab-highlight').classList.toggle('pos-2', !isSignin);
    document.getElementById('panel-signin').classList.toggle('active', isSignin);
    document.getElementById('panel-signup').classList.toggle('active', !isSignin);
    document.getElementById('auth-title').textContent = isSignin ? 'Welcome back' : 'Create your account';
    document.getElementById('auth-subtitle').textContent = isSignin
      ? 'Sign in to continue to your verification workspace.'
      : 'Start verifying eligibility with AI in minutes.';
    hideBanner();
    history.replaceState(null, '', '?tab=' + tab);
  }

  // Pre-select tab from URL query
  (function initTab(){
    const params = new URLSearchParams(window.location.search);
    if(params.get('tab') === 'signup') switchTab('signup');
  })();

  // ---- Password visibility ----
  function togglePw(id, btn){
    const input = document.getElementById(id);
    const isPw = input.type === 'password';
    input.type = isPw ? 'text' : 'password';
    btn.style.color = isPw ? '#38BDF8' : '';
  }

  // ---- Password strength ----
  function checkStrength(val){
    let score = 0;
    if(val.length >= 8) score++;
    if(/[A-Z]/.test(val)) score++;
    if(/[0-9]/.test(val)) score++;
    if(/[^A-Za-z0-9]/.test(val)) score++;
    const pct = (score/4)*100;
    const fill = document.getElementById('strength-fill');
    fill.style.width = pct + '%';
    const hint = document.getElementById('strength-hint');
    const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
    hint.textContent = val.length === 0 ? 'Use 8+ characters with a mix of letters & numbers' : labels[score];
    hint.className = 'field-hint ' + (score >= 3 ? 'success' : score <= 1 ? 'error' : '');
    checkMatch();
  }

  function checkMatch(){
    const pw = document.getElementById('su-password').value;
    const cf = document.getElementById('su-confirm').value;
    const hint = document.getElementById('confirm-hint');
    if(cf.length === 0){ hint.textContent=''; hint.className='field-hint'; return; }
    if(pw === cf){ hint.textContent = 'Passwords match'; hint.className = 'field-hint success'; }
    else{ hint.textContent = 'Passwords do not match'; hint.className = 'field-hint error'; }
  }

  // ---- Role selection ----
  function selectRole(el) {
    document.querySelectorAll(".role-opt").forEach(item => {
        item.classList.remove("selected");
    });

    el.classList.add("selected");
}

  // ---- Submit handling (demo / placeholder) ----
  async function handleSubmit(e, mode) {
    e.preventDefault();

    const banner = document.querySelector(".status-banner");

    function showMessage(message, type) {
        banner.textContent = message;
        banner.className = `status-banner show ${type}`;
    }

    if (mode === "signup") {
        const fullName = document.getElementById("su-name").value.trim();
        const email = document.getElementById("su-email").value.trim();
        const password = document.getElementById("su-password").value;
        const confirmPassword = document.getElementById("su-confirm").value;

        const selectedRole = document.querySelector(".role-opt.selected");

        if (!fullName || !email || !password || !confirmPassword) {
            showMessage("Please fill in all fields.", "error");
            return;
        }

        if (!selectedRole) {
            showMessage("Please select a role.", "error");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.", "error");
            return;
        }

        const role = selectedRole.dataset.role;

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/signup",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        password,
                        role
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(
                    data.message || "Account creation failed.",
                    "error"
                );
                return;
            }

            showMessage(
                "Account created successfully. You can now sign in.",
                "success"
            );

            document.getElementById("su-name").value = "";
            document.getElementById("su-email").value = "";
            document.getElementById("su-password").value = "";
            document.getElementById("su-confirm").value = "";

            switchTab("signin");

            document.getElementById("si-email").value = email;

        } catch (error) {
            console.error("Signup Error:", error);

            showMessage(
                "Unable to connect to the server.",
                "error"
            );
        }

        return;
    }


    if (mode === "signin") {
        const email = document.getElementById("si-email").value.trim();
        const password = document.getElementById("si-password").value;

        if (!email || !password) {
            showMessage("Please enter email and password.", "error");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                showMessage(
                    data.message || "Login failed.",
                    "error"
                );
                return;
            }

            localStorage.setItem("authToken", data.token);
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            showMessage(
                "Login successful. Redirecting...",
                "success"
            );

            console.log("Logged in user:", data.user);
            console.log("JWT stored successfully.");

            setTimeout(() => {
                if (data.user.role === "applicant") {
                    window.location.href = "applicant-dashboard.html";
                } else if (data.user.role === "organization") {
                    window.location.href = "organization-dashboard.html";
                } else if (data.user.role === "admin") {
                    window.location.href = "admin-dashboard.html";
                }
            }, 800);

        } catch (error) {
            console.error("Login Error:", error);

            showMessage(
                "Unable to connect to the server.",
                "error"
            );
        }
    }
}

  function showBanner(type, msg){
    const banner = document.getElementById('status-banner');
    banner.textContent = msg;
    banner.className = 'status-banner show ' + type;
  }
  function hideBanner(){
    const banner = document.getElementById('status-banner');
    banner.className = 'status-banner';
  }

  // ---- Ambient neural canvas (left panel) ----
  const canvas = document.getElementById('auth-canvas');
  if(canvas){
    const ctx = canvas.getContext('2d');
    let W, H, nodes = [];
    function resize(){
      W = canvas.width = canvas.offsetWidth * devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }
    function initNodes(){
      const count = Math.min(40, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 16000));
      nodes = Array.from({length: count}, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random()-0.5) * 0.22 * devicePixelRatio,
        vy: (Math.random()-0.5) * 0.22 * devicePixelRatio,
        r: (Math.random()*1.6+0.8) * devicePixelRatio
      }));
    }
    function step(){
      ctx.clearRect(0,0,W,H);
      for(const n of nodes){
        n.x += n.vx; n.y += n.vy;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
      }
      const maxDist = 140 * devicePixelRatio;
      for(let i=0;i<nodes.length;i++){
        for(let j=i+1;j<nodes.length;j++){
          const a=nodes[i], b=nodes[j];
          const dx=a.x-b.x, dy=a.y-b.y;
          const dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<maxDist){
            const op=(1-dist/maxDist)*0.3;
            ctx.strokeStyle=`rgba(56,189,248,${op})`;
            ctx.lineWidth=1;
            ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
          }
        }
      }
      for(const n of nodes){
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle='rgba(147,197,253,0.8)'; ctx.fill();
      }
      requestAnimationFrame(step);
    }
    function boot(){ resize(); initNodes(); step(); }
    window.addEventListener('resize', () => { resize(); initNodes(); });
    boot();
  }