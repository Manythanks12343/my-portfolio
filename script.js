/**
 * =========================================================================
 * SCRIPT.JS - MODERN PERSONAL PORTFOLIO INTERACTIVITY
 * 
 * Features:
 * 1. Light/Dark Theme Switcher with localStorage persistence & system preference detection
 * 2. Smooth Scrolling navigation with header offset compensation
 * 3. Active Navigation Spy (highlights nav links as sections scroll into view)
 * 4. Mobile Hamburger Menu toggle & auto-close behavior
 * 5. Scroll-Triggered Reveal Animations using IntersectionObserver
 * 6. Interactive Skill Chips selection & filter feedback
 * 7. Client-Side Contact Form Validation & Friendly Confirmation Message
 * 8. Back to Top Button & Dynamic Copyright Year
 * =========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initNavigation();
  initScrollAnimations();
  initSkillChips();
  initContactForm();
  initBackToTop();
  updateCopyrightYear();
});

/* =========================================================================
   1. THEME SWITCHER (LIGHT / DARK MODE)
   Persists chosen mode in localStorage, defaults to system or dark theme
   ========================================================================= */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (!themeToggleBtn) return;

  const THEME_STORAGE_KEY = 'portfolio-theme';
  const root = document.documentElement;

  // Determine preferred theme: check stored preference, then system preference, default to dark
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  setTheme(currentTheme);

  // Toggle button event listener
  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = root.getAttribute('data-theme') || 'dark';
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  });

  // Listen for operating system theme changes if user hasn't explicitly saved a preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    themeToggleBtn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
}

/* =========================================================================
   2. NAVIGATION & SMOOTH SCROLLING
   Handles mobile menu drawer, smooth scroll offsets, and active scroll spy
   ========================================================================= */
function initNavigation() {
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link, .brand-logo, .hero-cta-group a');
  const header = document.getElementById('header');

  // Toggle mobile drawer
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
      toggleMobileMenu(!isExpanded);
    });

    // Close mobile drawer when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('is-open') && 
          !navMenu.contains(e.target) && 
          !mobileToggle.contains(e.target)) {
        toggleMobileMenu(false);
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
        toggleMobileMenu(false);
      }
    });
  }

  function toggleMobileMenu(open) {
    if (!mobileToggle || !navMenu) return;
    mobileToggle.setAttribute('aria-expanded', String(open));
    mobileToggle.classList.toggle('is-active', open);
    navMenu.classList.toggle('is-open', open);
  }

  // Smooth scroll with offset for sticky header
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();

          // Close mobile menu if open
          toggleMobileMenu(false);

          const headerOffset = header ? header.offsetHeight + 12 : 80;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // Update URL hash without jumping
          history.pushState(null, '', targetId);
        }
      }
    });
  });

  // Active section scroll spy
  const sections = document.querySelectorAll('section[id]');
  const mainNavLinks = document.querySelectorAll('.nav-link');

  function updateActiveNavLink() {
    const scrollY = window.pageYOffset;
    const headerHeight = header ? header.offsetHeight + 60 : 120;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - headerHeight;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        mainNavLinks.forEach((link) => {
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  updateActiveNavLink();
}

/* =========================================================================
   3. SCROLL-TRIGGERED REVEAL ANIMATIONS
   Fades in and slides up cards and headers using IntersectionObserver
   ========================================================================= */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add('active'));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once revealed, unobserve to optimize performance
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));
}

/* =========================================================================
   4. INTERACTIVE SKILL CHIPS
   Allows clicking chips for interactive visual highlight feedback
   ========================================================================= */
function initSkillChips() {
  const chips = document.querySelectorAll('.skill-chip');
  if (!chips.length) return;

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('is-active');
    });
  });
}

/* =========================================================================
   5. CONTACT FORM VALIDATION & CONFIRMATION
   Client-side validation with real-time feedback & submission message
   ========================================================================= */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const feedbackSender = document.getElementById('feedback-sender-name');
  const submitBtn = document.getElementById('submit-btn');

  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const messageInput = document.getElementById('contact-message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const messageError = document.getElementById('message-error');

  // Email regex validator
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Helper to toggle input error status
  function setFieldError(input, errorElement, isError) {
    if (isError) {
      input.classList.add('has-error');
      if (errorElement) errorElement.classList.add('is-visible');
    } else {
      input.classList.remove('has-error');
      if (errorElement) errorElement.classList.remove('is-visible');
    }
  }

  // Clear errors as user types
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length > 0) {
        setFieldError(nameInput, nameError, false);
      }
    });
  }

  if (emailInput) {
    emailInput.addEventListener('input', () => {
      if (isValidEmail(emailInput.value)) {
        setFieldError(emailInput, emailError, false);
      }
    });
  }

  if (messageInput) {
    messageInput.addEventListener('input', () => {
      if (messageInput.value.trim().length > 0) {
        setFieldError(messageInput, messageError, false);
      }
    });
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      setFieldError(nameInput, nameError, true);
      isValid = false;
    } else {
      setFieldError(nameInput, nameError, false);
    }

    // Validate Email
    if (!isValidEmail(emailInput.value)) {
      setFieldError(emailInput, emailError, true);
      isValid = false;
    } else {
      setFieldError(emailInput, emailError, false);
    }

    // Validate Message
    if (!messageInput.value.trim()) {
      setFieldError(messageInput, messageError, true);
      isValid = false;
    } else {
      setFieldError(messageInput, messageError, false);
    }

    if (!isValid) {
      return;
    }

    // Simulate sending / processing state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span>Sending...</span>
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="0.8"></path>
      </svg>
    `;

    // Simulated network delay (600ms)
    setTimeout(() => {
      const senderName = nameInput.value.trim();
      if (feedbackSender) {
        feedbackSender.textContent = senderName;
      }

      // Show confirmation box
      if (feedback) {
        feedback.classList.remove('hidden');
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      // Reset form fields
      form.reset();

      // Reset submit button
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      // Automatically hide confirmation toast after 7 seconds
      setTimeout(() => {
        if (feedback) {
          feedback.classList.add('hidden');
        }
      }, 7000);
    }, 600);
  });
}

/* =========================================================================
   6. BACK TO TOP BUTTON
   Smoothly scrolls back to top when clicked
   ========================================================================= */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* =========================================================================
   7. FOOTER DYNAMIC YEAR
   Automatically sets current year in copyright notice
   ========================================================================= */
function updateCopyrightYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

