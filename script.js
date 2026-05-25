/* ==========================================================================
   AETHERIA INTERACTION ENGINE - VANILLA JAVASCRIPT
   Core Mechanics: Custom Cursor Lerp // Particle Physics // 3D Card Tilt // Lightbox
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  /* ==========================================
     1. SYSTEM CLOCK & TELEMETRY INITIALIZER
     ========================================== */
  const sysClock = document.getElementById('sys-clock');
  
  function updateSysClock() {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, '0');
    const hours = pad(now.getUTCHours());
    const minutes = pad(now.getUTCMinutes());
    const seconds = pad(now.getUTCSeconds());
    
    if (sysClock) {
      sysClock.textContent = `SYSTEM ACTIVE // SECURE_UPLINK // UTC ${hours}:${minutes}:${seconds}`;
    }
  }
  
  updateSysClock();
  setInterval(updateSysClock, 1000);


  /* ==========================================
     2. LERPED FUTURISTIC CUSTOM CURSOR
     ========================================== */
  const cursorDot = document.getElementById('custom-cursor');
  const cursorRing = document.getElementById('custom-cursor-ring');
  
  let mouse = { x: -100, y: -100 }; // mouse coordinates
  let cursor = { x: -100, y: -100 }; // lagging ring coordinates
  const ringLerpFactor = 0.15; // speed of lag interpolation
  
  // Track cursor movement
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    
    // Immediately position the inner dot
    if (cursorDot) {
      cursorDot.style.left = `${mouse.x}px`;
      cursorDot.style.top = `${mouse.y}px`;
    }
  });

  // Smooth out cursor ring trailing with linear interpolation (lerp)
  function animateCursor() {
    const dx = mouse.x - cursor.x;
    const dy = mouse.y - cursor.y;
    
    cursor.x += dx * ringLerpFactor;
    cursor.y += dy * ringLerpFactor;
    
    if (cursorRing) {
      cursorRing.style.left = `${cursor.x}px`;
      cursorRing.style.top = `${cursor.y}px`;
    }
    
    requestAnimationFrame(animateCursor);
  }
  
  animateCursor();

  // Add Hover Scaling and Neon Color Morphs for Interactive Items
  const addCursorHoverEvents = () => {
    const interactives = document.querySelectorAll('button, [data-magnetic], .gallery-card, a');
    interactives.forEach(item => {
      // Remove to prevent duplicate bindings on category swaps
      item.removeEventListener('mouseenter', handleMouseEnter);
      item.removeEventListener('mouseleave', handleMouseLeave);
      
      item.addEventListener('mouseenter', handleMouseEnter);
      item.addEventListener('mouseleave', handleMouseLeave);
    });
  };

  function handleMouseEnter() {
    document.body.classList.add('cursor-hover');
  }

  function handleMouseLeave() {
    document.body.classList.remove('cursor-hover');
  }

  // Hide default cursor when outside viewport, show custom cursor
  document.addEventListener('mouseleave', () => {
    if (cursorDot) cursorDot.style.opacity = '0';
    if (cursorRing) cursorRing.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    if (cursorDot) cursorDot.style.opacity = '1';
    if (cursorRing) cursorRing.style.opacity = '1';
  });


  /* ==========================================
     3. HIGH-PERFORMANCE HTML5 CANVAS PARTICLES
     ========================================== */
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const maxParticles = 60;
    
    // Scale canvas properly for High DPI (Retina) Screens
    function resizeCanvas() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    class VectorParticle {
      constructor() {
        this.reset();
      }
      
      reset() {
        this.x = Math.random() * window.innerWidth;
        // Start bottom or distributed on first draw
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 1.5 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.3; // Speed X
        this.vy = -(Math.random() * 0.4 + 0.1); // Slow drift upward
        this.opacity = Math.random() * 0.4 + 0.1;
        this.color = Math.random() > 0.5 ? '#00f0ff' : '#d900ff';
        this.baseOpacity = this.opacity;
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Push slightly away from mouse cursor if close
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = 120;
        
        if (dist < repelRadius) {
          const force = (repelRadius - dist) / repelRadius;
          // Calculate push direction
          const dirX = dx / dist;
          const dirY = dy / dist;
          
          this.x -= dirX * force * 1.5;
          this.y -= dirY * force * 1.5;
          
          this.opacity = Math.min(1, this.baseOpacity + force * 0.6);
        } else {
          // Return to base opacity slowly
          if (this.opacity > this.baseOpacity) {
            this.opacity -= 0.01;
          }
        }
        
        // Boundary checks
        if (this.y < -10 || this.x < -10 || this.x > window.innerWidth + 10) {
          this.reset();
          this.y = window.innerHeight + 10;
        }
      }
      
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        // Slight cyan or magenta glow
        ctx.shadowColor = this.color;
        ctx.shadowBlur = this.size * 5;
        ctx.fill();
        ctx.restore();
      }
    }
    
    // Spawn particles
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new VectorParticle());
    }
    
    function animateParticles() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      requestAnimationFrame(animateParticles);
    }
    
    animateParticles();
  }


  /* ==========================================
     4. MAGNETIC HOVER PHYSICS
     ========================================== */
  const initMagneticButtons = () => {
    const magneticElements = document.querySelectorAll('[data-magnetic]');
    
    magneticElements.forEach(elem => {
      elem.addEventListener('mousemove', (e) => {
        const bound = elem.getBoundingClientRect();
        // Calculate center coordinates
        const cx = bound.left + bound.width / 2;
        const cy = bound.top + bound.height / 2;
        
        // Compute distance from mouse to center
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        
        // Strong pull ratio
        const pullStrength = 0.35;
        
        // Apply magnetic pull translation
        elem.style.transform = `translate3d(${dx * pullStrength}px, ${dy * pullStrength}px, 0)`;
        // Force inner texts/contents to shift slightly less for premium depth
        const innerText = elem.querySelector('.btn-text, svg, span');
        if (innerText) {
          innerText.style.transform = `translate3d(${dx * 0.1}px, ${dy * 0.1}px, 0)`;
        }
      });
      
      elem.addEventListener('mouseleave', () => {
        // Return smoothly to center
        elem.style.transform = 'translate3d(0, 0, 0)';
        const innerText = elem.querySelector('.btn-text, svg, span');
        if (innerText) {
          innerText.style.transform = 'translate3d(0, 0, 0)';
        }
      });
    });
  };
  
  initMagneticButtons();


  /* ==========================================
     5. 3D PERSPECTIVE TILT & GLOW MATRICES
     ========================================== */
  const initCardTilts = () => {
    const cards = document.querySelectorAll('.gallery-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        
        // Horizontal and Vertical position of mouse relative to card (0 to width/height)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Convert to percentage values (-0.5 to 0.5)
        const px = (x / rect.width) - 0.5;
        const py = (y / rect.height) - 0.5;
        
        // Maximum rotation ranges
        const maxRotationX = -12; // tilt down on top hover
        const maxRotationY = 12;  // tilt right on right hover
        
        const rotX = py * maxRotationX;
        const rotY = px * maxRotationY;
        
        // Feed percentage back into CSS variables for radial mouse-follow glow
        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        
        // Apply rotation transforms directly
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
        
        // Handle inner depth translation for holographic floating text & items (preserve-3d)
        const img = card.querySelector('.card-img');
        const content = card.querySelector('.card-content');
        
        if (img) {
          // Opposite visual shifts for parallax float
          img.style.transform = `scale(1.08) translate3d(${-px * 10}px, ${-py * 10}px, 0)`;
        }
        if (content) {
          content.style.transform = `translate3d(0, 0, 45px)`;
        }
      });
      
      card.addEventListener('mouseleave', () => {
        // Return smoothly to base flat layout
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        
        const img = card.querySelector('.card-img');
        const content = card.querySelector('.card-content');
        
        if (img) {
          img.style.transform = 'scale(1) translate3d(0, 0, 0)';
        }
        if (content) {
          content.style.transform = 'translate3d(0, 25px, 40px)';
        }
      });
    });
  };
  
  initCardTilts();


  /* ==========================================
     6. SKELETON PRELOADER OBSERVER
     ========================================== */
  const initLoadingSkeletons = () => {
    const images = document.querySelectorAll('.card-img');
    images.forEach(img => {
      const card = img.closest('.gallery-card');
      const skeleton = card.querySelector('.card-skeleton');
      
      // Helper function to hide loader and show visualizer
      const removeSkeleton = () => {
        if (skeleton) {
          skeleton.classList.add('loaded');
          // Fully remove from grid after transition to avoid stack layers
          setTimeout(() => skeleton.remove(), 500);
        }
      };
      
      if (img.complete) {
        removeSkeleton();
      } else {
        img.addEventListener('load', removeSkeleton);
        // Fallback for load errors
        img.addEventListener('error', removeSkeleton);
      }
    });
  };
  
  initLoadingSkeletons();


  /* ==========================================
     7. CATEGORY FILTER SYSTEM
     ========================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.gallery-card');
  const grid = document.getElementById('gallery-grid');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle button states
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filterValue = btn.getAttribute('data-filter');
      
      // Temporarily shrink gallery structure for visual speed
      if (grid) {
        grid.style.opacity = '0.7';
        grid.style.transform = 'scale(0.99)';
        grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      }
      
      setTimeout(() => {
        cards.forEach(card => {
          const cardCategory = card.getAttribute('data-category');
          
          if (filterValue === 'all' || cardCategory === filterValue) {
            card.classList.remove('filtered-out');
            // Re-reveal animation triggers
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
              card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            }, 50);
            
          } else {
            card.classList.add('filtered-out');
          }
        });
        
        // Re-align and animate grid back to structure
        if (grid) {
          grid.style.opacity = '1';
          grid.style.transform = 'scale(1)';
        }
        
        // Re-bind cursor triggers for visible items
        addCursorHoverEvents();
        // Force scroll-reveal trigger on viewport check
        triggerRevealOnScroll();
        
      }, 250);
    });
  });


  /* ==========================================
     8. INTERSECTION OBSERVER SCROLL REVEALS
     ========================================== */
  const revealItems = document.querySelectorAll('.reveal-item');
  
  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Stop observing once animation has executed to keep performance high
        observer.unobserve(entry.target);
      }
    });
  };
  
  const revealObserver = new IntersectionObserver(revealCallback, {
    root: null, // use viewport
    rootMargin: '0px',
    threshold: 0.12 // Trigger when 12% is visible
  });
  
  revealItems.forEach(item => {
    revealObserver.observe(item);
  });
  
  // Custom manual trigger check during filtering actions
  function triggerRevealOnScroll() {
    revealItems.forEach(item => {
      const rect = item.getBoundingClientRect();
      const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
      if (!(rect.bottom < 0 || rect.top - viewHeight >= 0)) {
        item.classList.add('revealed');
      }
    });
  }


  /* ==========================================
     9. FULLSCREEN LIGHTBOX CONTROLLER
     ========================================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTag = document.getElementById('lightbox-tag');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxDesc = document.getElementById('lightbox-desc');
  
  const closeBtn = document.querySelector('.lightbox-close');
  const prevBtn = document.querySelector('.lightbox-nav.prev');
  const nextBtn = document.querySelector('.lightbox-nav.next');
  
  let activeCardIndex = 0;
  let activeCardsList = []; // Keeps track of currently active (non-filtered) card elements

  // Collect card click triggers
  cards.forEach(card => {
    card.addEventListener('click', () => {
      // Find list of active, non-filtered items
      activeCardsList = Array.from(cards).filter(c => !c.classList.contains('filtered-out'));
      activeCardIndex = activeCardsList.indexOf(card);
      
      openLightbox(card);
    });
  });

  function openLightbox(card) {
    if (!lightbox) return;
    
    // Retrieve image data
    const img = card.querySelector('.card-img');
    const tag = card.querySelector('.card-tag');
    const title = card.querySelector('.card-title');
    const desc = card.querySelector('.card-description');
    
    if (lightboxImg && img) lightboxImg.src = img.src;
    if (lightboxTag && tag) {
      lightboxTag.textContent = tag.textContent;
      // Change color based on theme category
      const category = card.getAttribute('data-category');
      if (category === 'beings') {
        lightboxTag.style.color = 'var(--neon-magenta)';
        lightboxTag.style.textShadow = '0 0 5px rgba(217, 0, 255, 0.3)';
      } else if (category === 'vehicles') {
        lightboxTag.style.color = 'var(--neon-blue)';
        lightboxTag.style.textShadow = '0 0 5px rgba(0, 68, 255, 0.3)';
      } else {
        lightboxTag.style.color = 'var(--neon-cyan)';
        lightboxTag.style.textShadow = '0 0 5px rgba(0, 240, 255, 0.3)';
      }
    }
    if (lightboxTitle && title) lightboxTitle.textContent = title.textContent;
    if (lightboxDesc && desc) lightboxDesc.textContent = desc.textContent;
    
    // Open lightbox container
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
    
    // Reset zoom state
    resetZoomState();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = ''; // Unlock background scrolling
    resetZoomState();
  }

  // Navigation Logic
  function navigateLightbox(direction) {
    if (activeCardsList.length <= 1) return;
    
    if (direction === 'next') {
      activeCardIndex = (activeCardIndex + 1) % activeCardsList.length;
    } else {
      activeCardIndex = (activeCardIndex - 1 + activeCardsList.length) % activeCardsList.length;
    }
    
    const targetCard = activeCardsList[activeCardIndex];
    
    // Dynamic transition fade
    if (lightboxImg) {
      lightboxImg.style.opacity = '0';
      lightboxImg.style.transform = 'scale(0.97)';
      lightboxImg.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      
      setTimeout(() => {
        openLightbox(targetCard);
        lightboxImg.style.opacity = '1';
        lightboxImg.style.transform = 'scale(1)';
      }, 250);
    }
  }

  // Lightbox Triggers Binds
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox('prev'));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox('next'));
  
  // Close when clicking empty overlay space
  const overlay = document.querySelector('.lightbox-overlay');
  if (overlay) overlay.addEventListener('click', closeLightbox);
  
  // Keyboard Events Mapping
  window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox('next');
    if (e.key === 'ArrowLeft') navigateLightbox('prev');
  });

  /* ==========================================
     10. DOUBLE-CLICK DETAILED SPATIAL ZOOM
     ========================================== */
  let isZoomed = false;
  
  if (lightboxImg) {
    lightboxImg.addEventListener('dblclick', (e) => {
      toggleZoom(e);
    });
    
    lightboxImg.addEventListener('click', (e) => {
      // Small delay check to avoid collision with double click
      if (isZoomed) {
        toggleZoom(e);
      }
    });
  }

  function toggleZoom(e) {
    if (!lightboxImg) return;
    
    if (!isZoomed) {
      // Calculate double click cursor offset inside target boundary
      const rect = lightboxImg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Compute percentage shifts
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      
      lightboxImg.style.transformOrigin = `${pctX}% ${pctY}%`;
      lightboxImg.style.transform = 'scale(2.2)';
      lightboxImg.classList.add('zoomed');
      isZoomed = true;
      
      const indicator = document.querySelector('.lightbox-zoom-indicator');
      if (indicator) indicator.textContent = 'CLICK TO ZOOM OUT';
      
    } else {
      resetZoomState();
    }
  }

  function resetZoomState() {
    isZoomed = false;
    if (lightboxImg) {
      lightboxImg.style.transform = 'scale(1)';
      lightboxImg.classList.remove('zoomed');
    }
    const indicator = document.querySelector('.lightbox-zoom-indicator');
    if (indicator) indicator.textContent = 'DOUBLE-CLICK TO ZOOM';
  }

  /* ==========================================
     11. RESPONSIVE TOUCH SWIPE GESTURES
     ========================================== */
  let touchStartX = 0;
  let touchEndX = 0;
  
  if (lightbox) {
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });
  }

  function handleSwipeGesture() {
    if (isZoomed) return; // Disable swipes while zoomed in
    const swipeThreshold = 50; // pixels
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe Left -> Next
      navigateLightbox('next');
    }
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe Right -> Prev
      navigateLightbox('prev');
    }
  }

  // Set active items on startup
  addCursorHoverEvents();

});
