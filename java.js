document.addEventListener("DOMContentLoaded", () => {
    const fadeElements = document.querySelectorAll('.bg-name, .profile-img, .bio, .cta-group, .stats, .role-box');

    // Initial State
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.8s ease-out';
    });

    // Animate in sequence
    fadeElements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 150 * index); // Staggered delay
    });
});

