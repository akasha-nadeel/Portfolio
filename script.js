document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    const body = document.body;
    const heroSection = document.querySelector('.hero-section');

    // --- Lenis Smooth Scroll Setup ---
    // Only init on Desktop (>1100px) because Mobile uses CSS 3D Parallax which conflicts
    // --- Lenis Smooth Scroll Setup ---

    function initLenis() {
        if (window.lenis) return; // Already running

        window.lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });
    }

    function destroyLenis() {
        if (window.lenis) {
            window.lenis.destroy();
            window.lenis = null;
        }
    }

    // --- Global Animation Loop (Runs on both Mobile & Desktop) ---
    function globalRaf(time) {
        // 1. Update Lenis if active
        if (window.lenis) {
            window.lenis.raf(time);
        }

        // 2. Desktop Parallax (Only apply if Lenis/Desktop is likely active or check width)
        if (window.innerWidth > 1100 && heroSection) {
            const scrollY = window.scrollY;
            const parallaxValue = scrollY * 0.5;
            heroSection.style.setProperty('--hero-y', `${parallaxValue}px`);
        }

        // 3. Horizontal Scroll Text logic (Applies to EVERYONE)
        const scrollRightEls = document.querySelectorAll('.scroll-move-right');
        scrollRightEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            const top = rect.top;
            const windowHeight = window.innerHeight;

            if (top < windowHeight && rect.bottom > 0) {
                const centerY = window.innerHeight / 2;
                const elementY = rect.top + (rect.height / 2);
                const distFromCenter = centerY - elementY;
                const speed = 0.3;
                el.style.transform = `translateX(${distFromCenter * speed}px)`;
            }
        });

        requestAnimationFrame(globalRaf);
    }

    // Start the global loop once
    requestAnimationFrame(globalRaf);

    // Initialize based on screen size
    function checkScrollMode() {
        if (window.innerWidth > 1100) {
            initLenis();
        } else {
            destroyLenis();
        }
    }

    // Run on load and resize
    checkScrollMode();
    window.addEventListener('resize', checkScrollMode);

    // Loader Logic
    const loader = document.getElementById('loader');
    if (loader) {
        // Function to hide loader
        const hideLoader = () => {
            loader.classList.add('loader-hidden');
            loader.addEventListener('transitionend', () => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            });
        };

        // Sound logic: Play *during* the loading animation
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); // Sci-fi Scanner Hum
        audio.loop = true;
        audio.volume = 0.5;

        // Try to play as soon as possible (Browser policy permitting)
        audio.play().catch(e => console.log("Audio autoplay blocked (requires interaction):", e));

        // Force a minimum display time of 1.5s so animation is visible
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Stop the sound when animation ends
                audio.pause();
                audio.currentTime = 0;

                hideLoader();
                document.body.classList.add('loaded');

                // Hero Stats Counting Animation - Start AFTER fade-in
                // CSS Animation delay is 3.6s for .stats
                setTimeout(() => {
                    const heroCounters = document.querySelectorAll('.count-up');
                    heroCounters.forEach(counter => {
                        const target = +counter.getAttribute('data-target');
                        const duration = 2000;
                        const increment = target / (duration / 16);

                        let current = 0;
                        const updateCounter = () => {
                            current += increment;
                            if (current < target) {
                                counter.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCounter);
                            } else {
                                counter.innerText = target;
                            }
                        };
                        updateCounter();
                    });
                }, 3800); // 3.6s delay + 200ms buffer
            }, 1500);
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const updateThemeUI = (isDark) => {
        const floatingIcon = document.getElementById('floating-theme-btn')?.querySelector('i');

        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
            if (floatingIcon) floatingIcon.classList.replace('fa-moon', 'fa-sun');
            if (heroSection) heroSection.style.setProperty('--hero-bg', "url('dark-hero-image.png')");
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
            if (floatingIcon) floatingIcon.classList.replace('fa-sun', 'fa-moon');
            if (heroSection) heroSection.style.setProperty('--hero-bg', "url('hero-image.png')");
        }
    };

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        updateThemeUI(true);
    }

    themeBtn.addEventListener('click', () => {
        // Add transition class for smooth state change
        body.classList.add('changing-theme');

        body.classList.toggle('dark-mode');
        const isDark = body.classList.contains('dark-mode');
        updateThemeUI(isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // Remove the class after transition completes to avoid performance hit
        setTimeout(() => {
            body.classList.remove('changing-theme');
        }, 400);
    });

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // CV Download Confirmation
    // CV Download Confirmation (Custom Modal)
    const cvBtns = document.querySelectorAll('.download-cv-btn');
    const modal = document.getElementById('cv-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');
    let pendingUrl = '';

    cvBtns.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            pendingUrl = this.getAttribute('href');
            modal.classList.add('active');
        });
    });

    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (pendingUrl) {
                const link = document.createElement('a');
                link.href = pendingUrl;
                link.download = 'Akasha_Nadeel_CV.pdf'; // Force download name
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            modal.classList.remove('active');
        });
    }

    if (confirmNoBtn) {
        confirmNoBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Intersection Observer for Animate on Scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px 100px 0px" // Triggers 100px before entering viewport for smoother feel
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Only remove if we want them to re-play. 
                // To fix vibration, we ensure we don't toggle continuously at the edge.
                // If the user wants animations to replay, we must remove the class.
                // The rootMargin above helps stabilize it.
                if (entry.boundingClientRect.top > 0) {
                    // Only reset if scrolling UP (element goes down offscreen)
                    // This prevents "flicker" when half-scrolled past.
                    entry.target.classList.remove('visible');
                }
            }
        });
    }, observerOptions);

    // Unified observer for all animation classes
    const animatedElements = document.querySelectorAll('.animate-on-scroll, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    animatedElements.forEach((el) => {
        observer.observe(el);
    });
    // Navbar Scroll Logic
    const navbar = document.querySelector('.navbar');
    const floatingBtn = document.getElementById('floating-theme-btn');

    // Attach same theme toggle logic to floating button
    floatingBtn.addEventListener('click', () => {
        themeBtn.click(); // Reuse existing logic
    });

    // Enhanced Scroll Logic (Supports Native + Lenis)
    const handleThemeBtnScroll = () => {
        // robustly get scroll position
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        // Show after scrolling 50% of viewport (passing Home)
        if (scrollY > window.innerHeight * 0.5) {
            floatingBtn.classList.add('visible');
        } else {
            floatingBtn.classList.remove('visible');
        }
    };

    window.addEventListener('scroll', handleThemeBtnScroll);

    // Check if Lenis moves the scroll
    if (window.lenis) {
        window.lenis.on('scroll', handleThemeBtnScroll);
    } else {
        // Fallback: Check constantly in case Lenis loads later
        const checkForLenis = setInterval(() => {
            if (window.lenis) {
                window.lenis.on('scroll', handleThemeBtnScroll);
                clearInterval(checkForLenis);
            }
        }, 500);
    }

    // --- Hero Center Area Hover Effect ---
    const heroHitbox = document.getElementById('hero-center-area');
    if (heroSection && heroHitbox) {
        heroHitbox.addEventListener('mouseenter', () => {
            // Only apply if desktop (width > 1100) or if we want it generally but hitbox might not exist on mobile
            if (window.innerWidth > 1100) {
                heroSection.classList.add('zoom-active');
            }
        });
        heroHitbox.addEventListener('mouseleave', () => {
            heroSection.classList.remove('zoom-active');
        });
    }
});

// --- Huge Image Slider Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const slides = document.querySelectorAll('.slide-item');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    let autoPlayInterval;

    if (sliderWrapper && slides.length > 0) {
        // Clone first slide for infinite loop effect
        const firstClone = slides[0].cloneNode(true);
        sliderWrapper.appendChild(firstClone);

        let currentSlide = 0;
        // The original slide count is slides.length. 
        // We now have slides.length + 1 elements.
        const totalSlides = slides.length;

        function updateSlider(enableTransition = true) {
            if (enableTransition) {
                sliderWrapper.style.transition = 'transform 0.6s cubic-bezier(0.65, 0, 0.35, 1)';
            } else {
                sliderWrapper.style.transition = 'none';
            }

            const translateX = -(currentSlide * 100);
            sliderWrapper.style.transform = `translateX(${translateX}%)`;
        }

        function nextSlide() {
            currentSlide++;
            updateSlider(true);

            // If we reached the clone (which is at index == totalSlides)
            if (currentSlide === totalSlides) {
                // Wait for transition to end, then instant snap back to 0
                setTimeout(() => {
                    currentSlide = 0;
                    updateSlider(false);
                }, 600); // Matches CSS transition time
            }
        }

        function prevSlide() {
            // Standard previous logic
            if (currentSlide === 0) {
                currentSlide = totalSlides - 1;
            } else {
                currentSlide--;
            }
            updateSlider(true);
        }

        function resetAutoPlay() {
            clearInterval(autoPlayInterval);
            autoPlayInterval = setInterval(nextSlide, 4000); // Speed increased to 4 seconds
        }

        // Global function for the pause button
        window.toggleSlidePlay = function (btn) {
            const icon = btn.querySelector('i');
            // If currently playing (icon is pause) -> pause it
            if (icon.classList.contains('fa-pause')) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null; // Mark as paused

                // Update all buttons to show play icon (sync state)
                document.querySelectorAll('.slide-pause-btn i').forEach(i => {
                    i.classList.remove('fa-pause');
                    i.classList.add('fa-play');
                });
                btn.title = "Resume Autoplay";
            } else {
                // Resume
                nextSlide(); // Optional: move to next immediately
                resetAutoPlay();

                // Update all buttons to show pause icon
                document.querySelectorAll('.slide-pause-btn i').forEach(i => {
                    i.classList.remove('fa-play');
                    i.classList.add('fa-pause');
                });
                btn.title = "Pause Autoplay";
            }
        };

        // Event Listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                // Determine if we are currently mid-snap (at the clone) to avoid glitches
                // For simplicity, just run nextSlide logic
                if (currentSlide === totalSlides) return; // Prevent clicking while resetting
                nextSlide();
                resetAutoPlay();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                prevSlide();
                resetAutoPlay();
            });
        }

        // Initialize Auto Play
        resetAutoPlay();

        // Handle transitionend to be safe? 
        // setTimeout is sufficient if matched with CSS duration.
        // But let's ensure the slider starts at 0 correctly.
        updateSlider(true);
    }
});

// Modal Logic (Global Scope)
function openModal(imageSrc) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('img01');
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    modalImg.src = imageSrc;
}

function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = "none";
    }, 300); // Wait for transition
}

window.openModal = openModal;
window.closeModal = closeModal;

// Close modal when clicking outside the image
window.addEventListener('click', (e) => {
    const modal = document.getElementById('imageModal');
    if (e.target === modal) {
        closeModal();
    }
});
// --- Stats Bar Animation ---
const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const container = entry.target;
            const counters = container.querySelectorAll('.stat-number');

            counters.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 seconds
                // Calculate increment to ensure all finish at same time
                // This is an approximate step size assuming 16ms frames (60fps)
                // total frames = 2000 / 16 = 125 frames
                const increment = target / (duration / 16);

                let current = 0;

                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.innerText = Math.ceil(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.innerText = target;
                    }
                };

                updateCounter();
            });

            // Only animate once
            observer.unobserve(container);
        }
    });
}, { threshold: 0.5 });

const statsContainer = document.querySelector('.stats-bar-container');
if (statsContainer) {
    statsObserver.observe(statsContainer);
}

// --- Contact Modal Logic ---
function openContactModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('contactModal');
    modal.style.display = "flex";
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = "none";
    }, 300);
}

// Handle Form Submit via AJAX (Formspree)
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const form = e.target;
            const data = new FormData(form);
            const action = form.action;

            // Check if user has replaced the placeholder
            if (action.includes("YOUR_FORM_ID_HERE")) {
                // FALLBACK: Use Mailto if no Formspree ID is set
                const subject = `Portfolio Contact from ${data.get('name')}`;
                const body = `Name: ${data.get('name')}%0D%0AEmail: ${data.get('email')}%0D%0AMessage: ${data.get('message')}`;
                window.location.href = `mailto:Kha.akashanadeel@gmail.com?subject=${subject}&body=${body}`;

                closeContactModal();
                form.reset();
                return;
            }

            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;

            fetch(action, {
                method: form.method,
                body: data,
                headers: {
                    'Accept': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    closeContactModal();
                    openThankYouModal();
                    form.reset();
                } else {
                    response.json().then(data => {
                        if (Object.hasOwn(data, 'errors')) {
                            alert(data["errors"].map(error => error["message"]).join(", "));
                        } else {
                            alert("Oops! There was a problem submitting your form.");
                        }
                    });
                }
            }).catch(error => {
                alert("Oops! There was a problem submitting your form.");
            }).finally(() => {
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            });
        });
    }
});

// --- Thank You Modal Logic ---
function openThankYouModal(title = "Message Sent!", msg = "Thanks for reaching out! I'll get back to you soon.") {
    const modal = document.getElementById('thank-you-modal');
    if (modal) {
        // Update text content
        const h3 = modal.querySelector('h3');
        const p = modal.querySelector('p');
        if (h3) h3.innerText = title;
        if (p) p.innerText = msg;

        modal.classList.add('active');
        // Ensure it sits on top of comment modal if open
        modal.style.zIndex = '2200';
    }
}

function closeThankYouModal() {
    const modal = document.getElementById('thank-you-modal');
    modal.classList.remove('active');
}

// Make functions globally available
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.closeThankYouModal = closeThankYouModal; // Expose for button click

// --- Show More Projects Logic ---
function toggleProjects() {
    const hiddenProjects = document.querySelectorAll('.hidden-project');
    const btn = document.querySelector('.see-more-btn');

    if (hiddenProjects.length === 0) return;

    // Check actual visibility of the first item to determine state
    // Note: getComputedStyle is safer than .style.display for initial state (css class)
    const firstProjectStyle = window.getComputedStyle(hiddenProjects[0]);
    const isCurrentlyVisible = firstProjectStyle.display !== 'none';

    if (!isCurrentlyVisible) {
        // Expand
        hiddenProjects.forEach(project => {
            project.style.display = 'block';
        });
        btn.innerHTML = 'Show Less';
    } else {
        // Collapse
        hiddenProjects.forEach(project => {
            project.style.display = 'none';
        });
        btn.innerHTML = 'Show More';

        // Scroll to the button instantly so the user doesn't lose mapped position
        setTimeout(() => {
            btn.focus();

            if (window.lenis) {
                // Desktop Smooth Scroll Active - Use Lenis API
                // Offset checks: roughly center the button
                const offset = -window.innerHeight / 2 + btn.offsetHeight / 2;
                window.lenis.scrollTo(btn, { offset: offset, duration: 1.5 });
            } else {
                // Mobile / Native Scroll
                btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
    }
}
window.toggleProjects = toggleProjects;

// Close modal when clicking outside the form content
window.addEventListener('click', (e) => {
    const contactModal = document.getElementById('contactModal');
    const thankYouModal = document.getElementById('thank-you-modal');

    if (e.target === contactModal) {
        closeContactModal();
    }
    if (e.target === thankYouModal) {
        closeThankYouModal();
    }
});

// --- Slider Autoplay Toggle ---
function toggleSlidePlay(btn) {
    // Prevent default behaviors/bubbling
    if (window.event) {
        window.event.preventDefault();
        window.event.stopPropagation();
    }

    const wrapper = document.querySelector('.slider-wrapper');
    // Check state first
    if (wrapper.classList.contains('paused')) {
        // ALREADY PAUSED: User clicked "Manual Sliding Button".
        // Instead of resuming, we SCROLL MANUALLY.
        wrapper.scrollBy({ left: window.innerWidth * 0.8, behavior: 'smooth' });

        // No text change needed, staying in manual mode
    } else {
        // CURRENTLY PLAYING: User wants to PAUSE.
        wrapper.classList.add('paused');

        btn.innerText = "Stopped - Double Click to Resume";
        btn.setAttribute('title', 'Click to drag or advance manually. Dbl-Click to Resume.');
    }
}

// Double click logic to resume autoplay
document.querySelectorAll('.slide-pause-btn').forEach(btn => {
    btn.ondblclick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const wrapper = document.querySelector('.slider-wrapper');
        const icon = btn.querySelector('i');

        // If currently paused, double click resumes
        if (wrapper.classList.contains('paused')) {
            wrapper.classList.remove('paused'); // Resume it
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
            btn.setAttribute('title', 'Pause Autoplay');
        }
    };
});

window.toggleSlidePlay = toggleSlidePlay;

window.openModal = openModal;
window.closeModal = closeModal;

/* --- Card Interactions --- */
/* --- Card Interactions --- */
function toggleLike(btn) {
    const card = btn.closest('.browser-card') || btn.closest('.slide-item');
    if (!card) return;

    const titleEl = card.querySelector('h3') || card.querySelector('h2');
    const title = titleEl ? titleEl.innerText : 'Project';
    const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '');
    const statusKey = `portfolio_like_status_${safeTitle}`;
    const countKey = `portfolio_like_count_${safeTitle}`;

    btn.classList.toggle('liked');
    const icon = btn.querySelector('i');
    const countSpan = btn.querySelector('.count');
    let count = parseInt(countSpan.innerText);

    const isLiked = btn.classList.contains('liked');

    if (isLiked) {
        icon.classList.remove('far');
        icon.classList.add('fas'); // Switch to solid heart
        count++;
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far'); // Switch back to outline
        count--;
    }
    countSpan.innerText = count;

    // Persist to LocalStorage
    localStorage.setItem(statusKey, isLiked ? 'true' : 'false');
    localStorage.setItem(countKey, count.toString());
}

window.toggleLike = toggleLike;

/* --- Download Logic --- */
document.addEventListener('DOMContentLoaded', () => {
    const downloadBtns = document.querySelectorAll('.download-btn');
    const downloadModal = document.getElementById('download-modal');
    const downloadYes = document.getElementById('download-yes');
    const downloadNo = document.getElementById('download-no');
    const filenameDisplay = downloadModal ? downloadModal.querySelector('.download-filename') : null;

    let targetFile = '';

    if (downloadBtns && downloadModal) {
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent card click

                // Find associated image
                const card = btn.closest('.browser-card') || btn.closest('.slide-item');
                if (card) {
                    const img = card.querySelector('img.browser-img') || card.querySelector('img.mockup-img') || card.querySelector('img');
                    if (img) {
                        const src = img.getAttribute('src');
                        // Extract filename
                        targetFile = src.split('/').pop().split('?')[0];

                        if (filenameDisplay) filenameDisplay.innerText = `File: ${targetFile}`;

                        downloadModal.style.display = 'flex';
                        setTimeout(() => downloadModal.classList.add('show'), 10);
                    }
                }
            });
        });

        if (downloadYes) {
            downloadYes.addEventListener('click', () => {
                // Trigger download
                const link = document.createElement('a');
                link.href = targetFile;
                link.download = targetFile;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Close modal
                downloadModal.classList.remove('show');
                setTimeout(() => downloadModal.style.display = 'none', 300);
            });
        }

        if (downloadNo) {
            downloadNo.addEventListener('click', () => {
                downloadModal.classList.remove('show');
                setTimeout(() => downloadModal.style.display = 'none', 300);
            });
        }

        // Close on outside click
        downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal) {
                downloadModal.classList.remove('show');
                setTimeout(() => downloadModal.style.display = 'none', 300);
            }
        });
    }

    // --- Comment Modal Logic (Persistent + Social Proof) ---
    const commentModal = document.getElementById('comment-modal');
    const modalTitle = document.getElementById('comment-project-title');
    const modalBody = document.getElementById('comment-list-container');
    const modalInput = document.getElementById('modal-comment-input');
    const modalSubmit = document.getElementById('modal-comment-submit');
    const modalClose = document.querySelector('.close-comment-modal');

    let activeCardForComments = null;
    let currentProjectKey = '';

    // Load Comments (Empty Default)
    const loadCommentsForProject = (projectTitle) => {
        // Create a safe key - CHANGED PREFIX TO INVALIDATE OLD DUMMY DATA
        currentProjectKey = `portfolio_real_comments_${projectTitle.replace(/[^a-zA-Z0-9]/g, '')}`;
        const stored = localStorage.getItem(currentProjectKey);

        let comments = [];
        if (stored) {
            comments = JSON.parse(stored);
            // Cleanup specific unwanted comment
            const originalLength = comments.length;
            comments = comments.filter(c => c.text !== "hihihbu");
            if (comments.length !== originalLength) {
                localStorage.setItem(currentProjectKey, JSON.stringify(comments));
            }
        }
        return comments;
    };

    const renderComments = (comments) => {
        modalBody.innerHTML = '';
        if (comments.length === 0) {
            modalBody.innerHTML = '<div class="no-comments-msg">No comments yet.</div>';
            return;
        }

        comments.forEach((c, index) => {
            // Time Calculation Logic
            let displayTime = c.time;
            if (c.timestamp) {
                const now = new Date();
                const past = new Date(c.timestamp);
                const diffMs = now - past;
                const diffMins = Math.floor(diffMs / 60000);

                if (diffMins < 1) {
                    displayTime = "Just now";
                } else if (diffMins < 60) {
                    displayTime = `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
                } else if (diffMins < 1440) {
                    const hours = Math.floor(diffMins / 60);
                    displayTime = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
                } else {
                    const days = Math.floor(diffMins / 1440);
                    displayTime = `${days} ${days === 1 ? 'day' : 'days'} ago`;
                }
            }

            const item = document.createElement('div');
            item.className = 'user-comment-item';
            const isYou = c.isOwner === true;

            // Format handle: e.g. "Kevin" -> "@Kevin"
            let handle = c.user;
            if (!handle.startsWith('@')) {
                handle = '@' + handle.replace(/\s+/g, '');
            }

            // Only adding options for comments marked as isOwner
            let optionsHtml = '';
            if (isYou) {
                optionsHtml = `
                    <div class="comment-options-container">
                        <button class="comment-options-btn" onclick="window.toggleCommentOption(event, ${index})">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="comment-dropdown-menu" id="comment-menu-${index}">
                            <button class="comment-dropdown-item" onclick="window.editComment(${index})">Edit</button>
                            <button class="comment-dropdown-item delete" onclick="window.deleteComment(${index})">Delete</button>
                        </div>
                    </div>`;
            }

            item.innerHTML = `
                <div class="comment-top-row">
                    <strong class="comment-user ${isYou ? 'is-you' : ''}">${handle} <span class="comment-time">${displayTime}</span></strong>
                    ${optionsHtml}
                </div>
                <div style="margin-top:2px; word-break: break-word; color: inherit;">${c.text}</div>
            `;
            modalBody.appendChild(item);
        });
        modalBody.scrollTop = modalBody.scrollHeight;
    };

    // Global Helpers for Comment Actions
    window.toggleCommentOption = (e, index) => {
        e.stopPropagation();
        // Close others
        document.querySelectorAll('.comment-dropdown-menu').forEach(el => el.classList.remove('show'));

        const menu = document.getElementById(`comment-menu-${index}`);
        if (menu) menu.classList.toggle('show');
    };

    let commentToDeleteIndex = null;
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

    window.deleteComment = (index) => {
        // Hide menu
        const menu = document.getElementById(`comment-menu-${index}`);
        if (menu) menu.classList.remove('show');

        commentToDeleteIndex = index;
        if (deleteModal) {
            deleteModal.style.display = 'flex';
            // Animation class if needed
        }
    };

    if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = () => { // overwritten to avoid duplicates
            if (commentToDeleteIndex !== null) {
                let comments = JSON.parse(localStorage.getItem(currentProjectKey) || '[]');
                comments.splice(commentToDeleteIndex, 1);
                localStorage.setItem(currentProjectKey, JSON.stringify(comments));

                renderComments(comments);

                // Update Count
                if (activeCardForComments) {
                    const countSpan = activeCardForComments.querySelector('.comment-btn .count');
                    if (countSpan) countSpan.innerText = comments.length;
                }
                commentToDeleteIndex = null;
            }
            if (deleteModal) deleteModal.style.display = 'none';
        };
    }

    if (cancelDeleteBtn) {
        cancelDeleteBtn.onclick = () => {
            if (deleteModal) deleteModal.style.display = 'none';
            commentToDeleteIndex = null;
        };
    }

    // Close on outside click for delete modal
    if (deleteModal) {
        deleteModal.onclick = (e) => {
            if (e.target === deleteModal) {
                deleteModal.style.display = 'none';
            }
        };
    }

    window.editComment = (index) => {
        // Hide menu
        const menu = document.getElementById(`comment-menu-${index}`);
        if (menu) menu.classList.remove('show');

        // Find the specific comment element
        // We assume 1-to-1 mapping between comments array and children
        const commentItem = modalBody.children[index];
        if (!commentItem) return;

        // The text div is the second child (index 1) or we find it
        // Structure: .comment-top-row, then div with text
        const textDiv = commentItem.lastElementChild;
        const currentText = textDiv.innerText;

        // Replace with inline editor
        textDiv.innerHTML = `
            <input type="text" id="edit-input-${index}" class="inline-edit-input" value="${currentText.replace(/"/g, '&quot;')}" 
                style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 8px; font-family: inherit;">
            <div class="edit-actions" style="margin-top: 8px; display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="window.cancelEdit()" style="font-size: 0.8rem; padding: 6px 12px; background: #f1f1f1; color: #333; border: none; border-radius: 12px; cursor: pointer;">Cancel</button>
                <button onclick="window.saveEdit(${index})" style="font-size: 0.8rem; padding: 6px 12px; background: #0A4D9C; color: white; border: none; border-radius: 12px; cursor: pointer;">Save</button>
            </div>
        `;

        // Focus input
        setTimeout(() => {
            const input = document.getElementById(`edit-input-${index}`);
            if (input) input.focus();
        }, 50);
    };

    window.saveEdit = (index) => {
        const input = document.getElementById(`edit-input-${index}`);
        if (!input) return;

        const newText = input.value.trim();
        if (!newText) return;

        let comments = JSON.parse(localStorage.getItem(currentProjectKey) || '[]');
        if (comments[index]) {
            comments[index].text = newText;
            localStorage.setItem(currentProjectKey, JSON.stringify(comments));
            renderComments(comments);
        }
    };

    window.cancelEdit = () => {
        // Just re-render to discard changes
        let comments = JSON.parse(localStorage.getItem(currentProjectKey) || '[]');
        renderComments(comments);
    };

    // Close menus on outside click
    window.addEventListener('click', () => {
        document.querySelectorAll('.comment-dropdown-menu').forEach(el => el.classList.remove('show'));
    });

    // Redefine global toggleComments to open modal
    window.toggleComments = function (btn) {
        const card = btn.closest('.browser-card') || btn.closest('.slide-item');
        if (!card) return;

        activeCardForComments = card;
        const titleEl = card.querySelector('h3') || card.querySelector('h2');
        const title = titleEl ? titleEl.innerText : 'Project';

        modalTitle.innerText = `${title} - Comments`;

        // Load & Render
        const comments = loadCommentsForProject(title);
        renderComments(comments);

        // Update visible count to match storage
        const countSpan = activeCardForComments.querySelector('.comment-btn .count');
        if (countSpan) countSpan.innerText = comments.length;

        // Show Modal
        if (commentModal) {
            commentModal.style.display = 'flex';
            setTimeout(() => commentModal.classList.add('show'), 10);
        }
    };

    // Close Logic
    const closeCommentModal = () => {
        if (commentModal) {
            commentModal.classList.remove('show');
            setTimeout(() => commentModal.style.display = 'none', 300);
        }
    };

    if (modalClose) modalClose.addEventListener('click', closeCommentModal);
    if (commentModal) {
        commentModal.addEventListener('click', (e) => {
            if (e.target === commentModal) closeCommentModal();
        });
    }

    const submitModalComment = () => {
        const text = modalInput.value.trim();
        const nameVal = document.getElementById('modal-comment-name').value.trim();
        const errorDiv = document.getElementById('comment-error-msg');

        if (!nameVal) {
            if (errorDiv) {
                errorDiv.innerText = "Please enter your name.";
                errorDiv.style.display = 'block';
            }
            return;
        } else {
            if (errorDiv) errorDiv.style.display = 'none';
        }

        if (!text) return;

        // Basic Profanity Filter
        const badWords = ["fuck", "shit", "bitch", "asshole", "damn", "hell", "idiot", "stupid", "crap", "suck"];
        const containsProfanity = (str) => {
            const lower = str.toLowerCase();
            return badWords.some(word => lower.includes(word));
        };

        if (containsProfanity(text) || containsProfanity(nameVal)) {
            if (errorDiv) {
                errorDiv.innerText = "Please keep the language respectful.";
                errorDiv.style.display = 'block';
            }
            return;
        }

        // Get current list
        let comments = JSON.parse(localStorage.getItem(currentProjectKey) || '[]');

        // Add new
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        comments.push({
            user: nameVal || "You", // Use entered name or default
            text: text,
            time: "Just now", // Initial display
            timestamp: now.toISOString(), // For dynamic calculation
            isOwner: true // Mark as user-created so they can edit/delete
        });

        // Save
        localStorage.setItem(currentProjectKey, JSON.stringify(comments));

        // Re-render
        renderComments(comments);

        // Update Count on Card
        if (activeCardForComments) {
            const countSpan = activeCardForComments.querySelector('.comment-btn .count');
            if (countSpan) {
                let count = parseInt(countSpan.innerText) || 0;
                countSpan.innerText = count + 1;
            }
        }

        modalInput.value = '';

        // Tell them Thank You (Window)
        setTimeout(() => {
            if (window.openThankYouModal) {
                window.openThankYouModal("Comment Posted!", "Thank you for sharing your thoughts!");
            }
        }, 100);
    };

    if (modalSubmit) modalSubmit.addEventListener('click', submitModalComment);
    if (modalInput) {
        modalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') submitModalComment();
        });
    }
    // --- Init Persistent Counts ---
    const cards = document.querySelectorAll('.browser-card, .slide-item, .bento-card');
    cards.forEach(card => {
        const titleEl = card.querySelector('h3') || card.querySelector('h2');
        if (!titleEl) return;

        const title = titleEl.innerText;
        // Identical Key Generation logic
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '');

        // 1. Comments
        const commentKey = `portfolio_real_comments_${safeTitle}`;
        const storedComments = localStorage.getItem(commentKey);
        if (storedComments) {
            const comments = JSON.parse(storedComments);
            const commentBtn = card.querySelector('.comment-btn .count');
            if (commentBtn) commentBtn.innerText = comments.length;
        }

        // 2. Likes
        const likeKey = `portfolio_like_status_${safeTitle}`;
        const countKey = `portfolio_like_count_${safeTitle}`;

        const isLiked = localStorage.getItem(likeKey) === 'true';
        const savedCount = localStorage.getItem(countKey);

        const likeBtn = card.querySelector('.like-btn');
        if (likeBtn) {
            if (isLiked) {
                likeBtn.classList.add('liked');
                const icon = likeBtn.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }
            if (savedCount) {
                const countSpan = likeBtn.querySelector('.count');
                if (countSpan) countSpan.innerText = savedCount;
            }
        }
    });

    // Remove old setupCommentSystem call since we replaced it
});

// --- Scroll Progress Bar Logic ---
window.addEventListener('scroll', () => {
    const progressBar = document.getElementById('scroll-progress-bar');
    if (progressBar) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;

        const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    }
});

/* --- 3D Services Slider Logic --- */
let s3dCurrentIndex = 1; // Start at middle (Web) by default

function update3DSlider() {
    const s3dItems = document.querySelectorAll('.s3d-item');
    const s3dDots = document.querySelectorAll('.s3d-dot');
    const s3dCounter = document.querySelector('.service-counter');

    if (s3dItems.length === 0) return;

    const total = s3dItems.length;

    s3dItems.forEach((item, index) => {
        // Reset classes
        item.classList.remove('active', 'prev', 'next', 'hidden');

        if (index === s3dCurrentIndex) {
            item.classList.add('active');
        } else if (index === (s3dCurrentIndex - 1 + total) % total) {
            item.classList.add('prev');
        } else if (index === (s3dCurrentIndex + 1) % total) {
            item.classList.add('next');
        } else {
            item.classList.add('hidden');
        }
    });

    // Update Dots
    s3dDots.forEach((dot, index) => {
        if (index === s3dCurrentIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });

    // Update Counter
    if (s3dCounter) {
        s3dCounter.innerText = `0${s3dCurrentIndex + 1}/0${total}`;
    }
}

function nextService() {
    const s3dItems = document.querySelectorAll('.s3d-item');
    if (s3dItems.length) {
        s3dCurrentIndex = (s3dCurrentIndex + 1) % s3dItems.length;
        update3DSlider();
    }
}

function prevService() {
    const s3dItems = document.querySelectorAll('.s3d-item');
    if (s3dItems.length) {
        s3dCurrentIndex = (s3dCurrentIndex - 1 + s3dItems.length) % s3dItems.length;
        update3DSlider();
    }
}

function goToService(index) {
    s3dCurrentIndex = index;
    update3DSlider();
}

// Global exposure for onclick handlers in HTML
window.goToService = goToService;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const prevBtn = document.querySelector('.prev-btn-3d');
    const nextBtn = document.querySelector('.next-btn-3d');

    if (prevBtn) prevBtn.addEventListener('click', prevService);
    if (nextBtn) nextBtn.addEventListener('click', nextService);

    // Initial call to set correct states
    update3DSlider();
});
