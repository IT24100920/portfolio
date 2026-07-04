// Wait for DOM to load completely
document.addEventListener('DOMContentLoaded', () => {
    initPageLoader();
    initParticles();
    initTypewriter();
    initScrollEffects();
    initMobileMenu();
    initContactForm();
});

/* ========================================================================= */
/* 0. Intro Page Loader                                                      */
/* ========================================================================= */
function initPageLoader() {
    const loader = document.getElementById('page-loader');
    const firstNameEl = document.getElementById('loader-first-name');
    const lastNameEl = document.getElementById('loader-last-name');
    if (!loader || !firstNameEl || !lastNameEl) {
        document.body.classList.add('page-loaded');
        document.body.classList.remove('is-loading');
        return;
    }

    const startTypingMs = 650;
    const subtitleRevealMs = 2350;
    const hideLoaderMs = 3050;
    const firstName = 'Thulaxshi';
    const lastName = 'Thileeparan';
    const charDelayMs = 70;
    const wordGapMs = 170;
    const startedAt = performance.now();

    function typeWord(element, text, delayMs) {
        return new Promise((resolve) => {
            let index = 0;
            element.textContent = '';

            const tick = () => {
                index += 1;
                element.textContent = text.slice(0, index);

                if (index < text.length) {
                    window.setTimeout(tick, delayMs);
                    return;
                }

                resolve();
            };

            tick();
        });
    }

    const revealPage = () => {
        const elapsed = performance.now() - startedAt;
        const schedule = (atMs, fn) => {
            window.setTimeout(fn, Math.max(0, atMs - elapsed));
        };

        schedule(startTypingMs, async () => {
            loader.classList.add('page-loader--name-visible');

            await typeWord(firstNameEl, firstName, charDelayMs);
            await new Promise((resolve) => window.setTimeout(resolve, wordGapMs));
            await typeWord(lastNameEl, lastName, charDelayMs);
        });

        schedule(subtitleRevealMs, () => {
            loader.classList.add('page-loader--subtitle-visible');
        });

        schedule(hideLoaderMs, () => {
            document.body.classList.add('page-loaded');
            document.body.classList.remove('is-loading');
            loader.classList.add('page-loader--hidden');

            window.setTimeout(() => {
                loader.remove();
            }, 700);
        });
    };

    if (document.readyState === 'complete') {
        revealPage();
        return;
    }

    window.addEventListener('load', revealPage, { once: true });
}

/* ========================================================================= */
/* 1. Interactive Background Particle Canvas                                 */
/* ========================================================================= */
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Particle settings
    const particleCount = Math.min(80, Math.floor((width * height) / 18000));
    const connectionDistance = 110;
    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        particlesArray = [];
        createParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.size = Math.random() * 2.5 + 1;
            this.color = Math.random() > 0.6 ? '#00f2fe' : '#7f00ff';
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            // Screen edge check
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Mouse proximity interaction (push away gently)
            if (mouse.x != null && mouse.y != null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    const force = (mouse.radius - dist) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 1.5;
                    this.y += Math.sin(angle) * force * 1.5;
                }
            }
        }
    }

    function createParticles() {
        for (let i = 0; i < particleCount; i++) {
            particlesArray.push(new Particle());
        }
    }

    function drawLines() {
        for (let i = 0; i < particlesArray.length; i++) {
            for (let j = i + 1; j < particlesArray.length; j++) {
                const p1 = particlesArray[i];
                const p2 = particlesArray[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.15;
                    ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particlesArray.forEach(p => {
            p.update();
            p.draw();
        });
        drawLines();
        requestAnimationFrame(animate);
    }

    createParticles();
    animate();
}

/* ========================================================================= */
/* 2. Hero Section Sub-headline Typewriter Effect                             */
/* ========================================================================= */
function initTypewriter() {
    const textElement = document.getElementById('typed-text');
    if (!textElement) return;

    const words = ["Full Stack Developer", "Software Engineer", "AI/ML Enthusiast"];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            charIndex--;
            textElement.textContent = currentWord.substring(0, charIndex);
        } else {
            charIndex++;
            textElement.textContent = currentWord.substring(0, charIndex);
        }

        let typingSpeed = isDeleting ? 40 : 100;

        if (!isDeleting && charIndex === currentWord.length) {
            // End of word, pause before deleting
            typingSpeed = 2200;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            // Finished deleting, move to next word
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500;
        }

        setTimeout(type, typingSpeed);
    }

    setTimeout(type, 1000);
}

/* ========================================================================= */
/* 3. Scroll Effects & Progress timeline                                     */
/* ========================================================================= */
function initScrollEffects() {
    const header = document.querySelector('.header');
    
    // Add scroll class to navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Automatically inject reveal classes to sections for scroll animations
    const revealTargets = [
        '.section-header', 
        '.services-intro-card', 
        '.service-card', 
        '.timeline-content', 
        '.skill-category-card', 
        '.project-card', 
        '.contact-info-panel', 
        '.contact-form-panel'
    ];

    revealTargets.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            el.classList.add('reveal-on-scroll');
        });
    });

    // Set up scroll reveal Observer
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        revealObserver.observe(el);
    });

    // Timeline line progress height indicator & dots activation
    window.addEventListener('scroll', animateTimeline);
    animateTimeline(); // Trigger once on load

    function animateTimeline() {
        const timeline = document.querySelector('.timeline-container');
        const progress = document.querySelector('.timeline-progress');
        if (!timeline || !progress) return;

        const rect = timeline.getBoundingClientRect();
        const viewHeight = window.innerHeight;
        const timelineHeight = rect.height;
        
        // Start filling progress bar when container top reaches 70% of screen height
        const startOffset = viewHeight * 0.7;
        const scrolled = -rect.top + startOffset;

        let percentage = (scrolled / timelineHeight) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        progress.style.height = `${percentage}%`;

        // Check each dot active status
        const items = document.querySelectorAll('.timeline-item');
        items.forEach(item => {
            const dot = item.querySelector('.timeline-dot');
            if (!dot) return;
            const dotRect = dot.getBoundingClientRect();
            if (dotRect.top < viewHeight * 0.7) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Navbar highlighting matching active viewport sections
    const sections = document.querySelectorAll('section, header');
    const navLinks = document.querySelectorAll('.nav-link');

    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                if (!id) return;
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.35,
        rootMargin: '-80px 0px 0px 0px' // adjust for sticky header height
    });

    sections.forEach(s => navObserver.observe(s));
}

/* ========================================================================= */
/* 4. Mobile Menu Handler                                                    */
/* ========================================================================= */
function initMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const nav = document.getElementById('navbar');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
        nav.classList.toggle('active');
        const icon = btn.querySelector('i');
        if (nav.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars-staggered';
        }
    });

    // Close menu when clicking link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('active');
            btn.querySelector('i').className = 'fa-solid fa-bars-staggered';
        });
    });
}

/* ========================================================================= */
/* 5. Contact Form Email Draft Handler                                       */
/* ========================================================================= */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success-msg');
    if (!form || !successMsg) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const toEmail = 'thulaxshithileeparan@gmail.com';
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        // Change button to sending state
        const btn = form.querySelector('button');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = 'Opening email... <i class="fa-solid fa-spinner fa-spin"></i>';

        const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(subject || 'New message from portfolio contact form')}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\nSubject: ${subject || 'New message from portfolio contact form'}\n\nMessage:\n${message}\n`)}`;

        setTimeout(() => {
            window.location.href = mailtoLink;
            btn.disabled = false;
            btn.innerHTML = originalText;
            successMsg.textContent = 'Your email app should open with the message details prefilled.';
            successMsg.classList.remove('hidden');
        }, 300);
    });
}
