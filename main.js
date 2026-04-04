document.addEventListener('DOMContentLoaded', () => {

    // ---- Animated Grid Background ----
    const canvas = document.getElementById('gridCanvas');
    const ctx = canvas.getContext('2d');
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const dots = [];
    const spacing = 60;
    for (let x = 0; x < 40; x++) {
        for (let y = 0; y < 25; y++) {
            dots.push({
                x: x * spacing + spacing / 2,
                y: y * spacing + spacing / 2,
                baseAlpha: Math.random() * 0.15 + 0.02,
                pulse: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.008 + 0.003
            });
        }
    }

    function drawGrid(time) {
        ctx.clearRect(0, 0, w, h);
        dots.forEach(d => {
            d.pulse += d.speed;
            const alpha = d.baseAlpha + Math.sin(d.pulse) * 0.04;
            ctx.fillStyle = `rgba(201, 162, 39, ${Math.max(0, alpha)})`;
            ctx.fillRect(d.x - 1, d.y - 1, 2, 2);
        });
        requestAnimationFrame(drawGrid);
    }
    requestAnimationFrame(drawGrid);

    // ---- Scroll Reveal ----
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // ---- Animated Counters ----
    const statNums = document.querySelectorAll('.stat-num[data-target]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 60));
                const interval = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    el.textContent = current.toLocaleString();
                }, 25);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNums.forEach(el => counterObserver.observe(el));

    // ---- Mobile Nav Toggle ----
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (toggle) {
        toggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => navLinks.classList.remove('open'));
    });

    // ---- Nav Background on Scroll ----
    const nav = document.getElementById('mainNav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            nav.style.background = 'rgba(8, 9, 13, 0.95)';
        } else {
            nav.style.background = 'rgba(8, 9, 13, 0.85)';
        }
    });

    // ---- Form Handler ----
    const form = document.getElementById('leadForm');
    const submitBtn = form.querySelector('.submit-btn');
    const successMsg = document.getElementById('formSuccess');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.classList.add('loading');

        // Simulate CRM / automation call
        setTimeout(() => {
            submitBtn.classList.remove('loading');
            form.style.display = 'none';
            successMsg.classList.remove('hidden');
            console.log('[Titan Exchange] Lead captured → CRM pipeline initiated. Operator: Wen Chu.');
        }, 1800);
    });
});
