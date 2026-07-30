// Prevent Chrome from automatically scrolling down on refresh
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

// Intersection Observer for fade-up animations
window.initSiteJS = () => {
    // Intersection Observer for fade-up animations
    const fadeElements = document.querySelectorAll('.fade-up');

    // Navbar Scroll Effect
    const navbar = document.querySelector('site-header') ? document.querySelector('site-header').querySelector('.navbar') : document.querySelector('.navbar');
    if (navbar) {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        };
        // Remove old listener if exists to prevent duplicates
        window.removeEventListener('scroll', window._handleScroll);
        window._handleScroll = handleScroll;
        window.addEventListener('scroll', window._handleScroll);
        handleScroll(); // Initialize immediately on load
    }

    // Mobile Hamburger Menu
    const hamburgerBtn = navbar ? navbar.querySelector('.hamburger-btn') : null;
    if (hamburgerBtn && navbar) {
        let backdrop = document.querySelector('.menu-backdrop');
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'menu-backdrop';
            document.body.appendChild(backdrop);
        }

        const toggleMenu = () => {
            const isOpen = hamburgerBtn.classList.toggle('active');
            navbar.classList.toggle('menu-open');
            if (isOpen) {
                backdrop.classList.add('active');
            } else {
                backdrop.classList.remove('active');
            }
        };

        const closeMenu = () => {
            hamburgerBtn.classList.remove('active');
            navbar.classList.remove('menu-open');
            backdrop.classList.remove('active');
        };

        // Clone and replace to remove old event listeners
        const newHamburger = hamburgerBtn.cloneNode(true);
        hamburgerBtn.parentNode.replaceChild(newHamburger, hamburgerBtn);
        newHamburger.addEventListener('click', toggleMenu);

        const newBackdrop = backdrop.cloneNode(true);
        backdrop.parentNode.replaceChild(newBackdrop, backdrop);
        newBackdrop.addEventListener('click', closeMenu);

        // Close menu when a link is clicked
        const navItems = navbar.querySelectorAll('.nav-links a');
        navItems.forEach(item => {
            item.addEventListener('click', closeMenu);
        });
    }

    // Add visible class to hero immediately
    setTimeout(() => {
        const hero = document.querySelector('.hero');
        if (hero) hero.classList.add('visible');
    }, 100);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stop observing once it has become visible to prevent glitching
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.05,
        rootMargin: "0px 0px 0px 0px"
    });

    fadeElements.forEach(el => {
        // Skip hero as we handled it above
        if (!el.classList.contains('hero')) {
            observer.observe(el);
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Animated Statistics Logic
    const statCards = document.querySelectorAll('.stat-card');

    if (statCards.length > 0) {
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const valueEl = entry.target.querySelector('.stat-value');
                    if (!valueEl) return;
                    const targetAttr = valueEl.getAttribute('data-target');
                    if (!targetAttr) return;

                    const target = parseInt(targetAttr);
                    if (!isNaN(target)) {
                        animateValue(valueEl, 0, target, 1500);
                        // Prevent re-animating
                        valueEl.removeAttribute('data-target');
                    }
                }
            });
        }, { threshold: 0.5 });

        statCards.forEach(card => statObserver.observe(card));
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            let current = Math.floor(easeProgress * (end - start) + start);

            if (end === 140 && progress < 1) obj.innerHTML = current + "+";
            else if (end === 140) obj.innerHTML = "140+";
            else obj.innerHTML = current;

            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Projects Carousel Logic
    const carousels = document.querySelectorAll('.carousel');
    carousels.forEach(carousel => {
        const inner = carousel.querySelector('.carousel-inner');
        const items = carousel.querySelectorAll('.carousel-item');
        const prevBtn = carousel.querySelector('.carousel-prev');
        const nextBtn = carousel.querySelector('.carousel-next');
        const dotsContainer = carousel.querySelector('.carousel-dots');

        if (items.length <= 1) return; // No carousel needed

        let currentIndex = 0;
        let autoplayInterval;

        // Clear old dots
        dotsContainer.innerHTML = '';

        // Create dots
        items.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = carousel.querySelectorAll('.carousel-dot');

        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
            resetAutoplay();
        }

        function updateCarousel() {
            inner.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % items.length;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            updateCarousel();
        }

        if (prevBtn) {
            const newPrev = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            newPrev.addEventListener('click', () => { prevSlide(); resetAutoplay(); });
        }

        if (nextBtn) {
            const newNext = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            newNext.addEventListener('click', () => { nextSlide(); resetAutoplay(); });
        }

        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 3000);
        }

        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }

        function resetAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        startAutoplay();
    });

    // Lightbox Logic with Previous/Next Navigation
    let lightbox = document.getElementById('image-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'image-lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <button class="lightbox-prev" aria-label="Previous image">&#10094;</button>
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img class="lightbox-img" src="" alt="Fullscreen Image">
            </div>
            <button class="lightbox-next" aria-label="Next image">&#10095;</button>
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImg = lightbox.querySelector('.lightbox-img');
    const lightboxClose = lightbox.querySelector('.lightbox-close');
    const lightboxPrev = lightbox.querySelector('.lightbox-prev');
    const lightboxNext = lightbox.querySelector('.lightbox-next');

    let currentGalleryImages = [];
    let currentGalleryIndex = 0;

    function updateLightboxImage() {
        if (currentGalleryImages.length > 0 && lightboxImg) {
            lightboxImg.src = currentGalleryImages[currentGalleryIndex];
            const hasMultiple = currentGalleryImages.length > 1;
            if (lightboxPrev) lightboxPrev.style.display = hasMultiple ? 'flex' : 'none';
            if (lightboxNext) lightboxNext.style.display = hasMultiple ? 'flex' : 'none';
        }
    }

    function prevLightboxImage() {
        if (currentGalleryImages.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
        updateLightboxImage();
    }

    function nextLightboxImage() {
        if (currentGalleryImages.length <= 1) return;
        currentGalleryIndex = (currentGalleryIndex + 1) % currentGalleryImages.length;
        updateLightboxImage();
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', (e) => {
            e.stopPropagation();
            prevLightboxImage();
        });
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', (e) => {
            e.stopPropagation();
            nextLightboxImage();
        });
    }

    window.openLightboxImage = function(target) {
        let targetSrc = typeof target === 'string' ? target : target.src;
        let imgEl = typeof target === 'object' ? target : null;

        let groupContainer = imgEl ? (imgEl.closest('.carousel') || imgEl.closest('.project-showcase-card') || imgEl.closest('.project-section') || imgEl.closest('.container') || document.body) : document.body;
        let groupImgs = Array.from(groupContainer.querySelectorAll('.carousel-item img, .project-gallery-side img, .project-section img[style*="cursor:zoom-in"], .project-section img[style*="cursor: zoom-in"], img[style*="cursor:zoom-in"], img[style*="cursor: zoom-in"]'));
        
        let uniqueSrcs = [];
        groupImgs.forEach(i => {
            if (i.src && !uniqueSrcs.includes(i.src)) {
                uniqueSrcs.push(i.src);
            }
        });

        if (uniqueSrcs.length <= 1) {
            let allPageImgs = Array.from(document.querySelectorAll('.carousel-item img, .project-gallery-side img, .project-section img[style*="cursor:zoom-in"], .project-section img[style*="cursor: zoom-in"], img[style*="cursor:zoom-in"], img[style*="cursor: zoom-in"]'));
            allPageImgs.forEach(i => {
                if (i.src && !uniqueSrcs.includes(i.src)) {
                    uniqueSrcs.push(i.src);
                }
            });
        }

        currentGalleryImages = uniqueSrcs;
        currentGalleryIndex = currentGalleryImages.indexOf(targetSrc);
        if (currentGalleryIndex === -1) currentGalleryIndex = 0;

        updateLightboxImage();
        lightbox.classList.add('active');
    };

    document.querySelectorAll('.carousel-item img, .project-gallery-side img, .project-section img[style*="cursor:zoom-in"], .project-section img[style*="cursor: zoom-in"]').forEach(img => {
        img.addEventListener('click', (e) => {
            e.stopPropagation();
            window.openLightboxImage(img);
        });
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
    }

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) closeLightbox();
    });

    // Touch Swipe Navigation for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (!lightbox.classList.contains('active')) return;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) nextLightboxImage();
            else prevLightboxImage();
        }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        else if (e.key === 'ArrowLeft') prevLightboxImage();
        else if (e.key === 'ArrowRight') nextLightboxImage();
    });

    // Medium Articles Dynamic Rendering
    const mediumContainer = document.getElementById('medium-articles-container');
    if (mediumContainer) {
        let base = '.';
        const homeBtn = document.querySelector('.home-btn');
        if (homeBtn) {
            const href = homeBtn.getAttribute('href');
            if (href) {
                base = href.replace('/index.html', '').replace('index.html', '.');
            }
        }

        // Strip trailing slash from base to prevent // protocol-relative URL errors on Netlify
        const cleanBase = base.replace(/\/$/, '');
        const configUrl = cleanBase + '/medium_data/config.json';

        fetch(configUrl)
            .then(res => res.json())
            .then(data => {
                const articles = data.articles;
                let currentIndex = 0;
                const batchSize = 4;

                const renderBatch = () => {
                    const batch = articles.slice(currentIndex, currentIndex + batchSize);
                    if (batch.length === 0) return;

                    let html = '';
                    batch.forEach(article => {
                        const topicsHtml = article.topics.map(t => {
                            let cls = 'badge-tech';
                            const tl = t.toLowerCase();
                            if (tl.includes('astro') || tl.includes('space')) cls = 'badge-space';
                            else if (tl.includes('physics')) cls = 'badge-physics';
                            else if (tl.includes('quantum')) cls = 'badge-quantum';
                            return `<span class="cert-badge ${cls}">${t}</span>`;
                        }).join('');

                        html += `
                        <div class="project-showcase-card medium-card fade-up">
                            <div class="project-info-side">
                                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                    <h3 style="font-family: var(--font-serif); font-size: 2rem; margin-bottom: 0.5rem;">${article.title}</h3>
                                </div>
                                <span class="project-meta" style="display:block; margin-bottom: 1rem; color: var(--text-muted); font-size: 0.85rem;">
                                    ${article.subtitle} • ${article.date}
                                </span>
                                <div class="badge-group">${topicsHtml}</div>
                                <p style="color: var(--text-muted); margin: 1rem 0;">${article.description}</p>
                                
                                <div class="project-action-buttons" style="margin-top: 1.5rem;">
                                    <a href="${article.medium_url}" target="_blank" class="btn btn-primary transition-link">Read on Medium ↗</a>
                                    <a href="${article.pdf_url || '#'}" target="_blank" class="btn btn-secondary">View on GitHub ↗</a>
                                </div>
                            </div>
                            <div class="project-gallery-side" style="padding: 0;">
                                <img src="${cleanBase}/${article.folder_path}${article.thumbnail}" alt="${article.title}" 
                                     style="width: 100%; height: 100%; object-fit: cover; cursor: zoom-in;"
                                     onclick="window.openLightboxImage(this); event.stopPropagation();">
                            </div>
                        </div>
                        `;
                    });

                    const oldSentinel = document.getElementById('medium-sentinel');
                    if (oldSentinel) oldSentinel.remove();

                    mediumContainer.insertAdjacentHTML('beforeend', html);

                    const newCards = mediumContainer.querySelectorAll('.medium-card:not(.observed)');
                    newCards.forEach(el => {
                        el.classList.add('observed');
                        observer.observe(el);
                    });

                    currentIndex += batchSize;

                    if (currentIndex < articles.length) {
                        const sentinel = document.createElement('div');
                        sentinel.id = 'medium-sentinel';
                        sentinel.style.height = '20px';
                        mediumContainer.appendChild(sentinel);

                        const sentinelObserver = new IntersectionObserver(entries => {
                            if (entries[0].isIntersecting) {
                                sentinelObserver.disconnect();
                                renderBatch();
                            }
                        });
                        sentinelObserver.observe(sentinel);
                    }
                };

                renderBatch();
            })
            .catch(err => console.error("Error loading medium articles:", err));
    }

    // CV Modal Logic
    const cvModalBtns = document.querySelectorAll('.cv-modal-trigger');
    let cvModal = document.getElementById('cv-modal');

    // Create CV modal if it doesn't exist
    if (!cvModal) {
        cvModal = document.createElement('div');
        cvModal.id = 'cv-modal';
        cvModal.className = 'lightbox';

        let base = '.';
        const homeBtn = document.querySelector('.home-btn');
        if (homeBtn) {
            const href = homeBtn.getAttribute('href');
            if (href) base = href.replace('/index.html', '').replace('index.html', '.');
        }

        cvModal.innerHTML = `
            <div class="cv-modal-content">
                <div style="padding: 1rem 1.5rem; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: white;">
                    <h3 style="margin:0; font-family: var(--font-sans); color: var(--text-main); font-size: 1.2rem;">Curriculum Vitae</h3>
                    <div>
                        <a href="${base}/cv.pdf" download class="btn btn-primary btn-sm" style="padding: 0.5rem 1rem; margin-right: 1rem;">Download PDF</a>
                        <button class="btn btn-secondary btn-sm" id="cv-modal-close" style="padding: 0.5rem 1rem;">Close</button>
                    </div>
                </div>
                <iframe src="${base}/cv.pdf" style="width: 100%; height: 100%; border: none; background: #f0f0f0;"></iframe>
            </div>
        `;
        document.body.appendChild(cvModal);
    }

    if (cvModalBtns.length > 0 && cvModal) {
        const newCvModal = cvModal.cloneNode(true);
        cvModal.parentNode.replaceChild(newCvModal, cvModal);
        cvModal = newCvModal; // Update the reference to point to the active node in the DOM

        const cvModalClose = cvModal.querySelector('#cv-modal-close');

        // Clone and replace to remove old listeners
        cvModalBtns.forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                cvModal.classList.add('active');
            });
        });

        const closeCv = () => cvModal.classList.remove('active');

        if (cvModalClose) {
            cvModalClose.addEventListener('click', closeCv);
        }

        cvModal.addEventListener('click', (e) => {
            if (e.target === cvModal) closeCv();
        });
    }
};

document.addEventListener('DOMContentLoaded', window.initSiteJS);
