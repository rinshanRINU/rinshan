/**
 * RINSHAAN — Cinematic Portfolio & Auteur Reel
 * Production JavaScript Engine
 * Integrates: Lenis Smooth Scroll, GSAP 3, ScrollTrigger, WebGL Shaders,
 * Custom Magnetic Cursor, Dynamic Counters, Video Lightbox, & Interactive Slates.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ---------------------------------------------------------------------------
  // 01. PREFERS REDUCED MOTION DETECTION
  // ---------------------------------------------------------------------------
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  // ---------------------------------------------------------------------------
  // 02. LENIS SMOOTH SCROLLING SETUP
  // ---------------------------------------------------------------------------
  let lenis = null;
  if (!prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });
    window.lenis = lenis;

    // Synchronize Lenis with GSAP ScrollTrigger
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Smooth scroll helper for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && document.querySelector(targetId)) {
        e.preventDefault();
        const targetEl = document.querySelector(targetId);
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -60 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
        // Close mobile drawer if open
        closeMobileNav();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 03. SHORT CINEMATIC PRELOADER
  // ---------------------------------------------------------------------------
  const preloader = document.getElementById('preloader');
  const preloaderCounter = document.getElementById('preloader-counter');
  const preloaderFill = document.getElementById('preloader-bar-fill');

  function runPreloader() {
    let progress = 0;
    const interval = setInterval(() => {
      // Accelerating count up
      progress += Math.floor(Math.random() * 8) + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        if (preloaderCounter) preloaderCounter.textContent = '100%';
        if (preloaderFill) preloaderFill.style.width = '100%';

        setTimeout(() => {
          if (preloader) {
            preloader.classList.add('loaded');
            // Trigger Hero Reveal Animation after preloader exits
            revealHero();
          }
        }, 300);
      } else {
        if (preloaderCounter) preloaderCounter.textContent = `${progress}%`;
        if (preloaderFill) preloaderFill.style.width = `${progress}%`;
      }
    }, 35);
  }

  runPreloader();

  // ---------------------------------------------------------------------------
  // 04. HERO HEADLINE LINE-BY-LINE REVEAL (GSAP)
  // ---------------------------------------------------------------------------
  function revealHero() {
    if (prefersReducedMotion || typeof gsap === 'undefined') {
      document.querySelectorAll('.hero-headline-line').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      return;
    }

    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Lines reveal with overflow mask
    heroTl.from('.hero-headline-line', {
      yPercent: 130,
      opacity: 0,
      duration: 1.2,
      stagger: 0.16,
      rotateX: -10,
    })
    .from('.hero-top-ribbon', {
      y: -20,
      opacity: 0,
      duration: 0.8,
    }, '-=0.8')
    .from('.hero-roles', {
      y: 20,
      opacity: 0,
      duration: 0.8,
    }, '-=0.6')
    .from('.hero-cta-cluster .magnetic-wrap', {
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.12,
    }, '-=0.6')
    .from('.hero-bottom-ribbon', {
      y: 20,
      opacity: 0,
      duration: 0.8,
    }, '-=0.6');
  }

  // ---------------------------------------------------------------------------
  // 05. SCROLL PROGRESS BAR & NAV VISIBILITY
  // ---------------------------------------------------------------------------
  const progressBar = document.getElementById('scroll-progress');
  const siteHeader = document.getElementById('site-header');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (currentScrollY / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    // Nav hide on scroll down / show on scroll up
    if (siteHeader) {
      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 8) {
          // Scrolling down
          siteHeader.classList.add('nav-hidden');
        } else if (lastScrollY - currentScrollY > 8) {
          // Scrolling up
          siteHeader.classList.remove('nav-hidden');
        }
      } else {
        siteHeader.classList.remove('nav-hidden');
      }
    }

    lastScrollY = currentScrollY;
  }, { passive: true });

  // ---------------------------------------------------------------------------
  // 06. MOBILE NAVIGATION DRAWER
  // ---------------------------------------------------------------------------
  const navMobileToggle = document.getElementById('nav-mobile-toggle');
  const mobileNavDrawer = document.getElementById('mobile-nav-drawer');

  function openMobileNav() {
    if (navMobileToggle && mobileNavDrawer) {
      navMobileToggle.classList.add('active');
      navMobileToggle.setAttribute('aria-expanded', 'true');
      mobileNavDrawer.classList.add('open');
      if (lenis) lenis.stop();
    }
  }

  function closeMobileNav() {
    if (navMobileToggle && mobileNavDrawer) {
      navMobileToggle.classList.remove('active');
      navMobileToggle.setAttribute('aria-expanded', 'false');
      mobileNavDrawer.classList.remove('open');
      if (lenis) lenis.start();
    }
  }

  if (navMobileToggle) {
    navMobileToggle.addEventListener('click', () => {
      const isOpen = navMobileToggle.classList.contains('active');
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  document.querySelectorAll('.mobile-nav-item').forEach((item) => {
    item.addEventListener('click', closeMobileNav);
  });

  // ---------------------------------------------------------------------------
  // 07. CUSTOM CINEMATIC CURSOR
  // ---------------------------------------------------------------------------
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (!isTouchDevice && cursorDot && cursorRing) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth lerp animation loop for the outer ring
    function updateCursorRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top = `${ringY}px`;

      requestAnimationFrame(updateCursorRing);
    }
    requestAnimationFrame(updateCursorRing);

    // Links & interactive elements hover state
    const interactiveTargets = document.querySelectorAll('a, button, input, textarea, .filter-btn, .service-row, .contact-card');
    interactiveTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => {
        document.body.classList.add('is-hovering');
      });
      target.addEventListener('mouseleave', () => {
        document.body.classList.remove('is-hovering');
      });
    });

    // Project cards hover state (shows "VIEW")
    const projectCards = document.querySelectorAll('.project-card, .theater-frame');
    projectCards.forEach((card) => {
      card.addEventListener('mouseenter', () => {
        document.body.classList.add('is-card-hover');
      });
      card.addEventListener('mouseleave', () => {
        document.body.classList.remove('is-card-hover');
      });
    });

    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
    });
  }

  // ---------------------------------------------------------------------------
  // 08. MAGNETIC BUTTON EFFECT
  // ---------------------------------------------------------------------------
  if (!isTouchDevice && !prefersReducedMotion) {
    const magneticElements = document.querySelectorAll('.magnetic-wrap');
    magneticElements.forEach((el) => {
      el.addEventListener('mousemove', function (e) {
        const rect = this.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (e.clientX - centerX) * 0.35;
        const deltaY = (e.clientY - centerY) * 0.35;

        if (typeof gsap !== 'undefined') {
          gsap.to(this, {
            x: deltaX,
            y: deltaY,
            duration: 0.3,
            ease: 'power2.out',
          });
        }
      });

      el.addEventListener('mouseleave', function () {
        if (typeof gsap !== 'undefined') {
          gsap.to(this, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: 'elastic.out(1, 0.4)',
          });
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 09. SECTION SCROLL REVEALS & PROJECT PARALLAX (GSAP SCROLLTRIGGER)
  // ---------------------------------------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);
    window.ScrollTrigger = ScrollTrigger;
    window.gsap = gsap;

    // Fade and slide-up for every major section with once: true
    document.querySelectorAll('.reveal-section').forEach((section) => {
      const header = section.querySelector('.section-slate-header');
      const children = section.querySelectorAll('.reveal-child');

      if (header) {
        gsap.fromTo(header,
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 90%',
              once: true,
            },
          }
        );
      }

      children.forEach((child, index) => {
        gsap.fromTo(child,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            delay: (index % 4) * 0.08,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: child,
              start: 'top 92%',
              once: true,
            },
          }
        );
      });
    });

    // Project Cards: Clip-path Image Reveal & Light Scroll Parallax
    document.querySelectorAll('.project-card').forEach((card) => {
      const mediaBox = card.querySelector('.project-media-box');
      const thumb = card.querySelector('.project-thumb');

      // Clip path reveal
      if (mediaBox) {
        gsap.fromTo(mediaBox, 
          { clipPath: 'inset(100% 0% 0% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.1,
            ease: 'power3.inOut',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Parallax on image inside thumbnail container
      if (thumb) {
        gsap.fromTo(thumb, 
          { yPercent: -8 },
          {
            yPercent: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          }
        );
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 10. PROJECT VIDEO PREVIEW ON HOVER
  // ---------------------------------------------------------------------------
  document.querySelectorAll('.project-card').forEach((card) => {
    const video = card.querySelector('.project-video-preview');
    if (video) {
      card.addEventListener('mouseenter', () => {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay prevented silently
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        video.pause();
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 11. PORTFOLIO FILTER TABS
  // ---------------------------------------------------------------------------
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach((card) => {
        const category = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || category.includes(filterValue)) {
          card.style.display = 'flex';
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(card, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' });
          }
        } else {
          card.style.display = 'none';
        }
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 12. STATS COUNTER UP ANIMATION
  // ---------------------------------------------------------------------------
  const statNumbers = document.querySelectorAll('.stat-number');
  if (typeof ScrollTrigger !== 'undefined' && !prefersReducedMotion) {
    statNumbers.forEach((statEl) => {
      const targetVal = parseInt(statEl.getAttribute('data-target'), 10) || 0;
      const suffix = statEl.getAttribute('data-suffix') || '';

      const obj = { val: 0 };
      gsap.to(obj, {
        val: targetVal,
        duration: 2.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: statEl,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          statEl.textContent = `${Math.floor(obj.val)}${suffix}`;
        },
      });
    });
  } else {
    statNumbers.forEach((statEl) => {
      const targetVal = statEl.getAttribute('data-target') || '0';
      const suffix = statEl.getAttribute('data-suffix') || '';
      statEl.textContent = `${targetVal}${suffix}`;
    });
  }

  // ---------------------------------------------------------------------------
  // 13. CINEMATIC VIDEO LIGHTBOX MODAL
  // ---------------------------------------------------------------------------
  const videoModal = document.getElementById('video-modal');
  const videoModalFrame = document.getElementById('video-modal-frame');
  const videoModalClose = document.getElementById('video-modal-close');

  function openVideoModal(videoUrl) {
    if (!videoModal || !videoModalFrame) return;

    // Use responsive embed URL
    videoModalFrame.src = videoUrl;
    videoModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }

  function closeVideoModal() {
    if (!videoModal || !videoModalFrame) return;

    videoModal.classList.remove('open');
    videoModalFrame.src = '';
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }

  if (videoModalClose) {
    videoModalClose.addEventListener('click', closeVideoModal);
  }

  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) {
        closeVideoModal();
      }
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal && videoModal.classList.contains('open')) {
      closeVideoModal();
    }
  });

  // Attach modal trigger to showreel buttons and project card clicks
  document.querySelectorAll('[data-video-modal]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const videoSrc = trigger.getAttribute('data-video-modal') || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';
      openVideoModal(videoSrc);
    });
  });

  // ---------------------------------------------------------------------------
  // 14. REAL-TIME DUAL CLOCKS (KOCHI & DUBAI) & TIMECODES
  // ---------------------------------------------------------------------------
  function updateClocks() {
    const now = new Date();
    const kochiEl = document.getElementById('kochi-clock');
    const dubaiEl = document.getElementById('dubai-clock');

    const kochiOptions = { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
    const dubaiOptions = { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };

    if (kochiEl) kochiEl.textContent = new Intl.DateTimeFormat('en-GB', kochiOptions).format(now);
    if (dubaiEl) dubaiEl.textContent = new Intl.DateTimeFormat('en-GB', dubaiOptions).format(now);

    // Live millisecond hero timecode counter
    const timecodeMs = document.getElementById('hero-tc-ms');
    if (timecodeMs) {
      const ms = Math.floor((now.getMilliseconds() / 1000) * 24);
      timecodeMs.textContent = ms < 10 ? `0${ms}` : `${ms}`;
    }
  }

  updateClocks();
  setInterval(updateClocks, 1000);

  // ---------------------------------------------------------------------------
  // 15. CONTACT FORM & TRANSMISSION FEEDBACK
  // ---------------------------------------------------------------------------
  const inquiryForm = document.getElementById('inquiry-form');
  const formStatus = document.getElementById('form-status');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = inquiryForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin" style="font-size:18px;">progress_activity</span> Transmitting Reel Slate...`;

      setTimeout(() => {
        btn.innerHTML = `<span class="material-symbols-outlined" style="font-size:18px;color:#0a0a0a;">check_circle</span> Transmission Acknowledged`;
        btn.style.backgroundColor = '#4ade80';

        if (formStatus) {
          formStatus.textContent = 'Transmission received. Rinshaan will review your project brief within 24 hours.';
          formStatus.style.display = 'block';
        }

        setTimeout(() => {
          inquiryForm.reset();
          btn.disabled = false;
          btn.innerHTML = originalText;
          btn.style.backgroundColor = '';
        }, 4000);
      }, 1200);
    });
  }

  // Copy email button with toast feedback
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      navigator.clipboard.writeText('hello@rinshaan.com').then(() => {
        const icon = copyEmailBtn.querySelector('.material-symbols-outlined');
        if (icon) {
          icon.textContent = 'done';
          icon.style.color = '#ff4d1f';
          setTimeout(() => {
            icon.textContent = 'content_copy';
            icon.style.color = '';
          }, 2000);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // 16. WEBGL AMBIENT MIST & PARTICLE SHADER
  // ---------------------------------------------------------------------------
  const shaderCanvas = document.getElementById('hero-shader-canvas');
  if (shaderCanvas && !prefersReducedMotion) {
    (function initShader() {
      function syncSize() {
        const w = shaderCanvas.clientWidth || window.innerWidth;
        const h = shaderCanvas.clientHeight || window.innerHeight;
        if (shaderCanvas.width !== w || shaderCanvas.height !== h) {
          shaderCanvas.width = w;
          shaderCanvas.height = h;
        }
      }
      if (typeof ResizeObserver !== 'undefined') {
        new ResizeObserver(syncSize).observe(shaderCanvas);
      }
      syncSize();

      const gl = shaderCanvas.getContext('webgl') || shaderCanvas.getContext('experimental-webgl');
      if (!gl) return;

      const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

      const fs = `precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
varying vec2 v_texCoord;

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec2 st = gl_FragCoord.xy / u_resolution.xy;
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    vec2 mouse = u_mouse / u_resolution.xy;
    if (length(u_mouse) < 1.0) {
        mouse = vec2(0.5, 0.5);
    }
    vec2 mouseUv = (u_mouse - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);

    float distMouse = length(uv - mouseUv);
    float mouseGlow = smoothstep(0.7, 0.0, distMouse);
    float mouseWave = sin(distMouse * 18.0 - u_time * 2.5) * 0.03 * mouseGlow;

    vec2 moveUv = uv + vec2(mouseWave);
    float timeSlow = u_time * 0.15;
    
    float n1 = fbm(moveUv * 2.2 + vec2(timeSlow * 0.4, -timeSlow * 0.2));
    float n2 = fbm(moveUv * 4.0 - vec2(timeSlow * 0.6, timeSlow * 0.3) + vec2(n1 * 1.2));
    
    float particles = 0.0;
    for (int i = 0; i < 3; i++) {
        float fi = float(i);
        vec2 pGrid = uv * (14.0 + fi * 8.0) + vec2(sin(u_time * 0.3 + fi), cos(u_time * 0.25 + fi * 1.5));
        vec2 id = floor(pGrid);
        vec2 gv = fract(pGrid) - 0.5;
        
        float h = hash(id + fi * 31.7);
        if (h > 0.68) {
            float sparkDist = length(gv);
            float spark = smoothstep(0.12, 0.01, sparkDist);
            float pulse = sin(u_time * 2.0 + h * 6.28) * 0.5 + 0.5;
            particles += spark * pulse * (0.4 + 0.6 * mouseGlow);
        }
    }

    float grain = (hash(st * 450.0 + fract(u_time * 12.0)) - 0.5) * 0.06;

    vec3 colBase = vec3(0.039, 0.039, 0.043);
    vec3 colDeepMist = vec3(0.08, 0.04, 0.02);
    vec3 colAccent = vec3(1.0, 0.302, 0.122); // #FF4D1F Electric Orange
    vec3 colAmberLight = vec3(1.0, 0.55, 0.25);

    vec3 color = colBase;
    color = mix(color, colDeepMist, n1 * 0.85);
    
    float orangeEnergy = (pow(mouseGlow, 1.8) * 0.55) + (n2 * mouseGlow * 0.4);
    color += colAccent * orangeEnergy;

    float diagonalSweep = smoothstep(-0.5, 0.8, uv.x + uv.y);
    color += colAccent * (n1 * 0.12 * diagonalSweep);

    color += colAmberLight * particles * 0.85;

    float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv));
    color *= vignette;
    color += grain;

    gl_FragColor = vec4(color, 1.0);
}`;

      function compileShader(type, src) {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return s;
      }

      const prog = gl.createProgram();
      gl.attachShader(prog, compileShader(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, compileShader(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

      const pos = gl.getAttribLocation(prog, 'a_position');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, 'u_time');
      const uRes = gl.getUniformLocation(prog, 'u_resolution');
      const uMouse = gl.getUniformLocation(prog, 'u_mouse');

      let mouse = { x: shaderCanvas.width / 2, y: shaderCanvas.height / 2 };

      window.addEventListener('mousemove', (event) => {
        const rect = shaderCanvas.getBoundingClientRect();
        if (rect.width && rect.height) {
          const nx = (event.clientX - rect.left) / rect.width;
          const ny = 1.0 - (event.clientY - rect.top) / rect.height;
          mouse.x = nx * shaderCanvas.width;
          mouse.y = ny * shaderCanvas.height;
        }
      });

      let isVisible = true;
      document.addEventListener('visibilitychange', () => {
        isVisible = !document.hidden;
      });

      function render(t) {
        if (isVisible) {
          if (typeof ResizeObserver === 'undefined') syncSize();
          gl.viewport(0, 0, shaderCanvas.width, shaderCanvas.height);
          if (uTime) gl.uniform1f(uTime, t * 0.001);
          if (uRes) gl.uniform2f(uRes, shaderCanvas.width, shaderCanvas.height);
          if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        }
        requestAnimationFrame(render);
      }
      render(0);
    })();
  }
});
