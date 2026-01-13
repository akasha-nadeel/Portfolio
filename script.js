document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle');
    const icon = themeBtn.querySelector('i');
    const body = document.body;
    const heroSection = document.querySelector('.hero-section');

    // --- Lenis Smooth Scroll Setup ---
    // Using the user's preferred settings for that "heavy" smooth feel
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);

        // --- Custom Parallax Logic ---
        if (heroSection) {
            // Parallax speed (0.5 means half the scroll speed)
            const scrollY = window.scrollY; // Or use lenis.scroll for more precision if needed
            const parallaxValue = scrollY * 0.5;
            heroSection.style.setProperty('--hero-y', `${parallaxValue}px`);
        }

        // --- Horizontal Scroll Text (Left to Right) ---
        const scrollRightEls = document.querySelectorAll('.scroll-move-right');
        scrollRightEls.forEach(el => {
            const rect = el.getBoundingClientRect();
            const top = rect.top;
            const windowHeight = window.innerHeight;

            // Calculate progress: 0 when entering bottom, 1 when leaving top
            // But for simple movement we just want basic offset logic
            if (top < windowHeight && rect.bottom > 0) {
                // Calculate distance from the center of the viewport
                // rect.top is relative to viewport
                const centerY = window.innerHeight / 2;
                const elementY = rect.top + (rect.height / 2);

                // If element is below center (elementY > centerY), we want negative X (left)
                // If element is above center (elementY < centerY), we want positive X (right)
                const distFromCenter = centerY - elementY;

                // Speed factor
                const speed = 0.3;

                el.style.transform = `translateX(${distFromCenter * speed}px)`;
            }
        });

        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

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
            }, 1500);
        });
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    const updateThemeUI = (isDark) => {
        if (isDark) {
            icon.classList.replace('fa-moon', 'fa-sun');
            if (heroSection) heroSection.style.setProperty('--hero-bg', "url('dark-hero-image.png')");
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
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
                link.download = 'Akasha_Nadeel_CV.png'; // Force download name
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
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                // Remove 'visible' class when element leaves view
                // This resets the animation so it plays again upon re-entry
                entry.target.classList.remove('visible');
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
    /* Scroll logic removed */
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
    // Small delay to allow display:flex to apply before adding opacity class for transition
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

// Close modal when clicking outside the image
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
function openThankYouModal() {
    const modal = document.getElementById('thank-you-modal');
    modal.classList.add('active');
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

    // Check if we are currently showing or hiding
    const isExpanded = btn.getAttribute('data-expanded') === 'true';

    if (!isExpanded) {
        hiddenProjects.forEach(project => {
            project.style.display = 'block';
            // Slight delay to allow display:block to apply before animating opacity if desired
            // For now, just showing them is fine
        });
        btn.innerHTML = 'Show Less';
        btn.setAttribute('data-expanded', 'true');
    } else {
        hiddenProjects.forEach(project => {
            project.style.display = 'none';
        });
        btn.innerHTML = 'Show More';
        btn.setAttribute('data-expanded', 'false');

        // Optional: Scroll back up to projects start if needed
        document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
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

