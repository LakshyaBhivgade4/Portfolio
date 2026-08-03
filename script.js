document.addEventListener("DOMContentLoaded", () => {
    // 0. Preferences & Globals
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    
    // 1. Initialization — GSAP ScrollTrigger (native scroll, no smooth-scroll library)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 2. Intro Sequence
    const initIntro = () => {
        const overlay = document.getElementById("intro-overlay");
        if (!overlay) return;

        if (sessionStorage.getItem("introDone") === "true") {
            document.body.style.overflow = "auto";
            document.body.classList.add("intro-done");
            overlay.style.display = "none";
            return;
        }

        document.body.style.overflow = "hidden";
        
        const tl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = "auto";
                document.body.classList.add("intro-done");
                sessionStorage.setItem("introDone", "true");
                overlay.style.display = "none";
            }
        });

        // Fast-forward on click
        overlay.addEventListener("click", () => {
            tl.progress(1);
        });

        tl.to({}, { duration: 0.1 }) // a. Pause
          // b. Boot lines
          .fromTo("#intro-boot .boot-line", 
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, stagger: 0.05, duration: 0.05, ease: "steps(1)" }
          )
          // c. Fade out boot text
          .to("#intro-boot", { opacity: 0, duration: 0.1 }, "+=0.1")
          // d. SVG Monogram draw
          .fromTo("#intro-monogram .monogram-text", 
              { strokeDasharray: "1000", strokeDashoffset: "1000" },
              { strokeDashoffset: "0", duration: 0.4, ease: "power2.inOut" }
          )
          .to("#intro-monogram .monogram-text", { textShadow: "0 0 20px #CDFF00", duration: 0.1, yoyo: true, repeat: 1 })
          // e. Monogram fade out
          .to("#intro-monogram", { opacity: 0, duration: 0.1 })
          // f. Kinetic words
          .fromTo("#intro-words .intro-word:nth-child(1)", { x: "-100vw", scale: 2, rotation: -45, opacity: 0 }, { x: "0", scale: 1, rotation: 0, opacity: 1, duration: 0.2, ease: "expo.out" }, "words")
          .fromTo("#intro-words .intro-word:nth-child(2)", { x: "100vw", scale: 0.5, rotation: 45, opacity: 0 }, { x: "0", scale: 1, rotation: 0, opacity: 1, duration: 0.2, ease: "expo.out" }, "words+=0.05")
          .fromTo("#intro-words .intro-word:nth-child(3)", { y: "100vh", scale: 1.5, rotation: 0, opacity: 0 }, { y: "0", scale: 1, rotation: 0, opacity: 1, duration: 0.2, ease: "expo.out" }, "words+=0.1")
          .to("#intro-words .intro-word", { scale: 0, opacity: 0, stagger: 0.05, duration: 0.2, ease: "power2.in" }, "+=0.1")
          // g. Paint swipe
          .to("#intro-swipe .swipe-path", { attr: { d: "M0,0 L100,0 L100,0 L0,0 Z" }, duration: 0.3, ease: "power4.inOut" }, "reveal")
          .to(overlay, { opacity: 0, duration: 0.2 }, "reveal+=0.1");
    };

    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        initIntro();
    } else {
        document.body.style.overflow = "auto";
        document.body.classList.add("intro-done");
        const overlay = document.getElementById("intro-overlay");
        if(overlay) overlay.style.display = "none";
    }

    // 3. Magnetic Buttons (cursor is now CSS-native green pixel arrow, no JS tracking needed)
    if (!isTouchDevice && typeof gsap !== 'undefined') {
        const magneticElements = document.querySelectorAll("[data-magnetic]");
        magneticElements.forEach(el => {
            el.addEventListener("mousemove", (e) => {
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const distX = e.clientX - centerX;
                const distY = e.clientY - centerY;
                
                if (Math.abs(distX) < 80 && Math.abs(distY) < 80) {
                    gsap.to(el, { x: distX * 0.3, y: distY * 0.3, duration: 0.4, ease: "power2.out" });
                }
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
            });
        });
    }

    // 4. Navigation
    const navTime = document.getElementById("nav-time");
    if (navTime) {
        const updateTime = () => {
            const now = new Date();
            navTime.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        };
        updateTime();
        setInterval(updateTime, 1000);
    }

    const menuToggle = document.getElementById("menu-toggle");
    const menuOverlay = document.getElementById("menu-overlay");
    const menuLinks = document.querySelectorAll(".menu-link");

    const openMenu = () => {
        document.body.classList.add("menu-open");
        document.body.style.overflow = "hidden";
        if(menuOverlay) menuOverlay.setAttribute("aria-hidden", "false");
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(menuLinks, 
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "expo.out", overwrite: true }
            );
        }
    };

    const closeMenu = () => {
        if (typeof gsap !== 'undefined') {
            gsap.to(menuLinks, { 
                y: -60, opacity: 0, stagger: 0.05, duration: 0.4, ease: "expo.in",
                onComplete: () => {
                    document.body.classList.remove("menu-open");
                    document.body.style.overflow = "";
                    if(menuOverlay) menuOverlay.setAttribute("aria-hidden", "true");
                }
            });
        } else {
            document.body.classList.remove("menu-open");
            document.body.style.overflow = "";
            if(menuOverlay) menuOverlay.setAttribute("aria-hidden", "true");
        }
    };

    const toggleMenu = () => {
        if (document.body.classList.contains("menu-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    };

    if (menuToggle) menuToggle.addEventListener("click", toggleMenu);

    menuLinks.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);
            closeMenu();
            setTimeout(() => {
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        });
    });

    // 6. Text Scramble Effect & 14. Nav Status
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\/[]{}—=+*^?#_ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText || this.el.getAttribute("data-text") || "";
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end, char: '' });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = '';
            let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++;
                    output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) {
                        char = this.chars[Math.floor(Math.random() * this.chars.length)];
                        this.queue[i].char = char;
                    }
                    output += `<span class="scramble-char" style="color:var(--color-accent, #CDFF00);">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) {
                this.resolve();
            } else {
                this.frameRequest = requestAnimationFrame(this.update);
                this.frame++;
            }
        }
    }

    const scrambleText = (el, newText) => {
        const scrambler = new TextScramble(el);
        scrambler.setText(newText);
    };

    document.querySelectorAll("[data-scramble]").forEach(el => {
        const originalText = el.innerText;
        el.setAttribute("data-text", originalText);
        el.addEventListener("mouseenter", () => {
            scrambleText(el, originalText);
        });
    });

    const navStatus = document.getElementById("nav-status");
    const statusMessages = ['SYS.ONLINE', 'STATUS.OK', 'ACTIVE.SESSION', 'RUNNING...'];
    if (navStatus) {
        navStatus.setAttribute("data-text", navStatus.innerText);
        setInterval(() => {
            const newText = statusMessages[Math.floor(Math.random() * statusMessages.length)];
            scrambleText(navStatus, newText);
        }, 8000);
    }

    // 5. Text Animations (SplitType + GSAP)
    if (!prefersReducedMotion && typeof SplitType !== 'undefined' && typeof gsap !== 'undefined') {
        const splitElements = document.querySelectorAll("[data-split-text]");
        splitElements.forEach(el => {
            const split = new SplitType(el, { types: 'chars, words' });
            gsap.from(split.chars, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 95%",
                },
                opacity: 0,
                y: 20,
                rotateX: -45,
                stagger: 0.01,
                duration: 0.4,
                ease: "back.out(1.5)"
            });
        });
    }

    // 7. Scroll Animations
    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
        document.querySelectorAll("[data-scroll-reveal]").forEach(el => {
            const type = el.getAttribute("data-scroll-reveal");
            const triggerOpts = { trigger: el, start: "top 95%" };
            
            if (type === "slide-up") {
                gsap.from(el, { scrollTrigger: triggerOpts, y: 40, opacity: 0, duration: 0.5, ease: "power3.out" });
            } else if (type === "mask") {
                gsap.from(el, { scrollTrigger: triggerOpts, clipPath: "inset(100% 0 0 0)", duration: 0.6, ease: "expo.out" });
            } else if (type === "rotate") {
                gsap.from(el, { scrollTrigger: triggerOpts, rotate: 5, opacity: 0, scale: 0.95, duration: 0.5, ease: "back.out(1.2)" });
            } else if (type === "slide-left") {
                gsap.from(el, { scrollTrigger: triggerOpts, x: -50, opacity: 0, duration: 0.5, ease: "power3.out" });
            } else if (type === "scale") {
                gsap.from(el, { scrollTrigger: triggerOpts, scale: 0.9, opacity: 0, duration: 0.5, ease: "back.out(1.5)" });
            } else if (type === "stagger") {
                gsap.from(el.children, { scrollTrigger: triggerOpts, y: 20, opacity: 0, stagger: 0.05, duration: 0.4, ease: "power2.out" });
            } else if (type === "poster") {
                gsap.from(el, { scrollTrigger: triggerOpts, y: 30, opacity: 0, scale: 0.95, stagger: 0.1, duration: 0.5, ease: "power3.out" });
            } else if (type === "char") { 
                 gsap.from(el, { scrollTrigger: triggerOpts, y: 20, opacity: 0, duration: 0.4, ease: "power2.out" });
            }
        });

        // Parallax effects
        gsap.utils.toArray(".home-name").forEach(el => {
            gsap.to(el, {
                y: 50,
                ease: "none",
                scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: 0.3 }
            });
        });

        const homeSpray = document.querySelector(".home-spray");
        if (homeSpray) {
            gsap.to(homeSpray, { y: -80, ease: "none", scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true }});
        }

        gsap.utils.toArray(".home-crosses .cross").forEach((cross, i) => {
            gsap.to(cross, {
                y: -30 * (i + 1), rotation: "+=45", ease: "none",
                scrollTrigger: { trigger: "#home", start: "top top", end: "bottom top", scrub: true }
            });
        });

        gsap.utils.toArray(".about-number").forEach(el => {
            gsap.to(el, {
                y: 30, ease: "none",
                scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true }
            });
        });

        // 11. Footer Animations
        const footerLine = document.querySelector(".footer-line-draw");
        if (footerLine) {
            gsap.fromTo(footerLine, { width: "0%" }, {
                width: "100%", duration: 1.5, ease: "expo.inOut",
                scrollTrigger: { trigger: "#footer", start: "top 80%" }
            });
        }

        const footerCta = document.querySelector(".footer-cta");
        if (footerCta) {
            gsap.from(footerCta, { opacity: 0, y: 20, duration: 1, delay: 0.5, scrollTrigger: { trigger: "#footer", start: "top 75%" }});
        }

        const footerSig = document.querySelector(".footer-signature");
        if (footerSig) {
            gsap.from(footerSig, { scale: 0.5, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: "#footer", start: "top 90%" }});
        }

        // Fix for ScrollTrigger sometimes missing elements on dynamic load
        window.addEventListener("load", () => {
            if (typeof ScrollTrigger !== 'undefined') {
                ScrollTrigger.refresh();
            }
        });
    }

    // 8. Marquee runs via CSS animation only — no JS overhead

    // 9. Skills Wall - Draggable Stickers
    const stickers = document.querySelectorAll(".skill-sticker");
    let zIndexCounter = 10;

    stickers.forEach(sticker => {
        const rotation = sticker.getAttribute("data-rotation") || 0;
        const isMobile = window.innerWidth <= 768;
        
        // Don't rotate on mobile — keep clean grid
        if (!isMobile) {
            if(typeof gsap !== 'undefined') {
                gsap.set(sticker, { rotation: rotation });
            } else {
                sticker.style.transform = `rotate(${rotation}deg)`;
            }
        } else {
            sticker.style.transform = 'none';
        }

        let isDragging = false;
        let startX, startY;
        let currentX = 0, currentY = 0;

        sticker.addEventListener("pointerdown", (e) => {
            if (e.target.closest('.sticker-back')) return;
            isDragging = true;
            startX = e.clientX - currentX;
            startY = e.clientY - currentY;
            sticker.style.cursor = "grabbing";
            sticker.style.zIndex = ++zIndexCounter;
            e.target.setPointerCapture(e.pointerId);
        });

        sticker.addEventListener("pointermove", (e) => {
            if (!isDragging) return;
            currentX = e.clientX - startX;
            currentY = e.clientY - startY;
            
            const moveDeltaX = e.movementX;
            const rotOffset = Math.max(-15, Math.min(15, moveDeltaX * 0.5));

            if(typeof gsap !== 'undefined') {
                gsap.to(sticker, { x: currentX, y: currentY, rotation: Number(rotation) + rotOffset, duration: 0.1 });
            }
        });

        sticker.addEventListener("pointerup", (e) => {
            if (!isDragging) return;
            isDragging = false;
            sticker.style.cursor = "grab";
            
            if(typeof gsap !== 'undefined') {
                gsap.to(sticker, { 
                    x: currentX * 0.9, 
                    y: currentY * 0.9, 
                    rotation: rotation, 
                    duration: 0.6, 
                    ease: "elastic.out(1, 0.5)" 
                });
            }
            currentX *= 0.9;
            currentY *= 0.9;
            e.target.releasePointerCapture(e.pointerId);

            if (Math.abs(e.clientX - startX - currentX) < 5 && Math.abs(e.clientY - startY - currentY) < 5) {
                sticker.classList.toggle("flipped");
            }
        });

        if (!isTouchDevice && window.matchMedia("(hover: hover)").matches) {
            sticker.addEventListener("mouseenter", () => {
                if (!isDragging && !sticker.classList.contains("flipped") && typeof gsap !== 'undefined') {
                    gsap.to(sticker, { rotation: 0, y: currentY - 8, duration: 0.3, ease: "power2.out" });
                }
            });
            
            sticker.addEventListener("mousemove", (e) => {
                if (isDragging || sticker.classList.contains("flipped") || typeof gsap === 'undefined') return;
                const rect = sticker.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                gsap.to(sticker, { 
                    rotateY: x * 0.05, 
                    rotateX: -y * 0.05, 
                    duration: 0.1, 
                    transformPerspective: 500 
                });
            });

            sticker.addEventListener("mouseleave", () => {
                if (!isDragging && typeof gsap !== 'undefined') {
                    gsap.to(sticker, { 
                        rotation: rotation, 
                        y: currentY, 
                        rotateY: 0, 
                        rotateX: 0, 
                        duration: 0.5, 
                        ease: "power2.out"
                    });
                }
            });
        }
    });

    // 10. Creation Posters Interactions
    document.querySelectorAll(".creation-poster").forEach(poster => {
        const title = poster.querySelector(".poster-title");
        const originalTitle = title ? title.innerText : "";
        if(title) title.setAttribute("data-text", originalTitle);
        
        poster.addEventListener("mouseenter", () => {
            if (title) scrambleText(title, originalTitle);
        });

        const number = poster.querySelector(".poster-number");
        if (number && typeof gsap !== 'undefined' && !prefersReducedMotion) {
            gsap.to(number, {
                y: 20, ease: "none",
                scrollTrigger: { trigger: poster, start: "top bottom", end: "bottom top", scrub: true }
            });
        }
    });

    // 12. CRT Screen Effects — lightweight flicker using CSS filter on an overlay
    // Instead of changing opacity on the entire #main-content tree, we briefly flash the scanline overlay
    const scanlineOverlay = document.getElementById('scanline-overlay');
    if (scanlineOverlay && !prefersReducedMotion) {
        const flickerCRT = () => {
            scanlineOverlay.style.opacity = '0.12';
            setTimeout(() => {
                scanlineOverlay.style.opacity = '0.05';
            }, 60);
            setTimeout(flickerCRT, 4000 + Math.random() * 6000);
        };
        setTimeout(flickerCRT, 5000);
    }

    // 13. Bio Typing Animation
    const bioTyping = document.getElementById('bio-typing');
    if (bioTyping) {
        const commands = ['whoami --verbose', 'cat bio.txt', 'echo $PASSION'];
        let cmdIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let isPaused = false;

        const typeLoop = () => {
            const currentCmd = commands[cmdIndex];
            
            if (!isDeleting && !isPaused) {
                bioTyping.textContent = currentCmd.substring(0, charIndex + 1);
                charIndex++;
                if (charIndex === currentCmd.length) {
                    isPaused = true;
                    setTimeout(() => {
                        isPaused = false;
                        isDeleting = true;
                        typeLoop();
                    }, 3000);
                    return;
                }
                setTimeout(typeLoop, 60 + Math.random() * 40);
            } else if (isDeleting) {
                bioTyping.textContent = currentCmd.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    cmdIndex = (cmdIndex + 1) % commands.length;
                    setTimeout(typeLoop, 500);
                    return;
                }
                setTimeout(typeLoop, 30);
            }
        };

        // Start when section scrolls into view
        const bioObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(typeLoop, 600);
                    bioObserver.disconnect();
                }
            });
        }, { threshold: 0.3 });
        
        const bioSection = bioTyping.closest('.about-block');
        if (bioSection) bioObserver.observe(bioSection);
    }

    // 14. Bio Progress Bar Animation
    const progressFill = document.querySelector('.bio-progress-fill');
    if (progressFill) {
        progressFill.style.width = '0%';
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => { progressFill.style.width = '75%'; }, 400);
                    progressObserver.disconnect();
                }
            });
        }, { threshold: 0.5 });
        progressObserver.observe(progressFill.closest('.bio-progress-wrap'));
    }

    // 15. Random Philosophy Quote
    const quotes = [
        { text: "The best way to predict the future is to create it.", author: "— ABRAHAM LINCOLN" },
        { text: "Move fast and break things. Unless you are breaking stuff, you are not moving fast enough.", author: "— MARK ZUCKERBERG" },
        { text: "First, solve the problem. Then, write the code.", author: "— JOHN JOHNSON" },
        { text: "The only way to do great work is to love what you do.", author: "— STEVE JOBS" },
        { text: "Code is like humor. When you have to explain it, it's bad.", author: "— CORY HOUSE" }
    ];
    const quoteEl = document.getElementById('random-quote');
    const authorEl = document.getElementById('quote-author');
    if (quoteEl && authorEl) {
        const pick = quotes[Math.floor(Math.random() * quotes.length)];
        quoteEl.textContent = pick.text;
        authorEl.textContent = pick.author;
    }

    // 16. Floating Resume — show after scrolling past dossier
    const floatingResume = document.getElementById('floating-resume');
    const aboutBio = document.querySelector('.about-bio');
    if (floatingResume && aboutBio) {
        const showResume = () => {
            const bioRect = aboutBio.getBoundingClientRect();
            const footerEl = document.getElementById('footer');
            const inFooter = footerEl && footerEl.getBoundingClientRect().top < window.innerHeight;
            
            if (bioRect.bottom < 0 && !inFooter) {
                floatingResume.classList.add('visible');
            } else {
                floatingResume.classList.remove('visible');
            }
        };
        window.addEventListener('scroll', showResume, { passive: true });
    }

});

// 14. Contact Form — sendMessage (global scope for onsubmit)
async function sendMessage(e) {
    e.preventDefault();
    const name = document.getElementById('msg-name').value.trim();
    const email = document.getElementById('msg-email').value.trim();
    const body = document.getElementById('msg-body').value.trim();
    const resp = document.getElementById('form-response');
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.form-submit');

    if (!name || !email || !body) {
        resp.textContent = '> ERROR: all fields required.';
        return false;
    }

    // 🔴 IMPORTANT: Paste your Google Apps Script Web App URL here 🔴
    const GOOGLE_SCRIPT_URL = ""; 

    if (!GOOGLE_SCRIPT_URL) {
        // Fallback to mailto if Google Script is not set up yet
        const subject = encodeURIComponent(`Portfolio Message from ${name}`);
        const mailBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${body}`);
        const mailtoLink = `mailto:lakshyabhivgade@gmail.com?subject=${subject}&body=${mailBody}`;
        
        resp.textContent = '> TRANSMITTING...';
        setTimeout(() => {
            resp.textContent = '> GOOGLE SHEET URL NOT SET :: falling back to mail client...';
            window.location.href = mailtoLink;
            setTimeout(() => {
                resp.textContent = '> FALLBACK TRANSMISSION COMPLETE ✓';
                form.reset();
            }, 1500);
        }, 800);
        return false;
    }

    // Prepare data for Google Sheet
    const formData = new FormData();
    formData.append('Name', name);
    formData.append('Email', email);
    formData.append('Message', body);
    formData.append('Timestamp', new Date().toLocaleString());

    // Update UI to loading state
    resp.style.color = '#ffbd2e'; // Yellow for processing
    resp.textContent = '> TRANSMITTING TO SECURE SERVER...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors' // Required to avoid CORS issues with Google Apps Script
        });

        // Since no-cors hides the actual response status, we assume success if it didn't throw an error
        resp.style.color = '#28c840'; // Green for success
        resp.textContent = '> TRANSMISSION COMPLETE :: Data safely stored. ✓';
        form.reset();

    } catch (error) {
        console.error('Error!', error.message);
        resp.style.color = '#ff5f57'; // Red for error
        resp.textContent = '> ERROR :: Connection failed. Try again later.';
    } finally {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
        
        // Reset color back to normal after 5 seconds
        setTimeout(() => {
            resp.style.color = '';
            if (resp.textContent.includes('COMPLETE')) {
                resp.textContent = '';
            }
        }, 5000);
    }
    return false;
}
