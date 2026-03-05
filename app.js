/* ─────────────────────────────────────────────────
   JS — scroll animations, nav, mobile menu
───────────────────────────────────────────────── */

(function () {
  /* ── 1. Scroll reveal ──────────────────────────────────── */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.reveal, .reveal-stagger').forEach((el) => {
    observer.observe(el);
  });

  /* ── 2. Nav scroll behaviour ───────────────────────────── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── 3. Mobile menu ────────────────────────────────────── */
  const menuBtn = document.querySelector('.menu-btn');
  let mobileMenu = document.querySelector('.mobile-menu');

  if (menuBtn && !mobileMenu) {
    // Build mobile menu from nav links
    mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';

    const links = document.querySelectorAll('.nav-links a');
    links.forEach((a) => {
      const clone = document.createElement('a');
      clone.href = a.href;
      clone.textContent = a.textContent;
      mobileMenu.appendChild(clone);
    });

    document.body.appendChild(mobileMenu);
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── 4. Active nav link highlight ─────────────────────── */
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      a.style.color = '#f5f5f7';
    }
  });

  /* ── 5. Smooth hero text entrance ─────────────────────── */
  // Hero elements animate in with slight stagger on first load
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner) {
    const children = Array.from(heroInner.children);
    children.forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(30px)';
      child.style.transition = `opacity 0.9s cubic-bezier(0,0,0.2,1) ${i * 0.12}s, transform 0.9s cubic-bezier(0,0,0.2,1) ${i * 0.12}s`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          child.style.opacity = '';
          child.style.transform = '';
        });
      });
    });
  }
})();
