// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functions
    initNavigation();
    initAnimations();
    initContactForm();
    initParallaxEffects();
    initTypingEffect();
    initParticleSystem();
    initScrollProgress();
    initMagneticEffects();
    initGlitchEffect();
    initMatrixRain();
});

// Navigation
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle with enhanced animation
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animate hamburger bars with glow effect
        const bars = hamburger.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            if (hamburger.classList.contains('active')) {
                if (index === 0) {
                    bar.style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                    bar.style.boxShadow = '0 0 10px rgba(0, 102, 255, 0.8)';
                }
                if (index === 1) {
                    bar.style.opacity = '0';
                    bar.style.transform = 'scale(0)';
                }
                if (index === 2) {
                    bar.style.transform = 'rotate(45deg) translate(-5px, -6px)';
                    bar.style.boxShadow = '0 0 10px rgba(0, 102, 255, 0.8)';
                }
            } else {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
                bar.style.boxShadow = 'none';
            }
        });
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            const bars = hamburger.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
                bar.style.boxShadow = 'none';
            });
        });
    });

    // Enhanced navbar scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
            navbar.style.backdropFilter = 'blur(30px)';
        } else {
            navbar.classList.remove('scrolled');
            navbar.style.backdropFilter = 'blur(20px)';
        }
    });

    // Smooth scrolling for navigation links with enhanced animation
navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
      e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70;
                
                // Add scroll animation
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });

                // Add ripple effect to clicked link
                const ripple = document.createElement('span');
                ripple.className = 'nav-ripple';
                link.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });
}

// Advanced Animations
function initAnimations() {
    // Animate numbers with enhanced effects
    const animateNumbers = () => {
        const numbers = document.querySelectorAll('[data-number]');
        numbers.forEach(number => {
            const target = parseInt(number.getAttribute('data-number'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                number.textContent = Math.floor(current);
                
                // Add glow effect during animation
                const progress = current / target;
                number.style.textShadow = `0 0 ${10 + progress * 20}px rgba(0, 102, 255, ${0.5 + progress * 0.5})`;
            }, 16);
        });
    };

    // Trigger number animation when in view
    const numberObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumbers();
                numberObserver.unobserve(entry.target);
    }
  });
});

    const numberContainer = document.querySelector('.numbers-container');
    if (numberContainer) {
        numberObserver.observe(numberContainer);
    }

    // Enhanced hover effects for cards
    const cards = document.querySelectorAll('.feature-card, .service-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-15px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(0, 102, 255, 0.6)';
            card.style.borderColor = 'rgba(0, 102, 255, 0.8)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 4px 8px rgba(0, 102, 255, 0.3)';
            card.style.borderColor = 'rgba(0, 102, 255, 0.2)';
        });
    });

    // Enhanced button ripple effect
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');

            this.appendChild(ripple);

            // Add glow effect to button
            this.style.boxShadow = '0 0 30px rgba(0, 102, 255, 0.8)';
            
            setTimeout(() => {
                this.style.boxShadow = '';
            }, 300);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Contact Form with enhanced validation
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = this.querySelector('input[type="text"]').value;
            const email = this.querySelector('input[type="email"]').value;
            const message = this.querySelector('textarea').value;

            // Enhanced validation
            if (!name || !email || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }

            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }

            if (message.length < 10) {
                showNotification('Message must be at least 10 characters long', 'error');
                return;
            }

            // Enhanced form submission animation
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            submitBtn.style.background = 'linear-gradient(45deg, #0066ff, #00aaff)';
            submitBtn.style.animation = 'button-glow 1s ease-in-out infinite';

            // Simulate API call
  setTimeout(() => {
                showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.animation = '';
            }, 2000);
        });

        // Add real-time validation feedback
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                validateField(input);
            });
            
            input.addEventListener('input', () => {
                if (input.classList.contains('error')) {
                    validateField(input);
                }
            });
        });
    }
}

// Field validation
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let message = '';

    if (field.type === 'email' && value) {
        if (!isValidEmail(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }

    if (field.type === 'text' && value.length < 2) {
        isValid = false;
        message = 'Name must be at least 2 characters long';
    }

    if (field.tagName === 'TEXTAREA' && value.length < 10) {
        isValid = false;
        message = 'Message must be at least 10 characters long';
    }

    if (!isValid) {
        field.classList.add('error');
        field.style.borderColor = '#ef4444';
        field.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.3)';
    } else {
        field.classList.remove('error');
        field.style.borderColor = 'rgba(0, 102, 255, 0.2)';
        field.style.boxShadow = '';
    }
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Enhanced notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Enhanced styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: all 0.4s ease;
        backdrop-filter: blur(10px);
        border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'};
        ${type === 'success' ? 'background: rgba(16, 185, 129, 0.9);' : 'background: rgba(239, 68, 68, 0.9);'}
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;

    // Add notification content styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .notification-content i {
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(notificationStyles);

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
  setTimeout(() => {
            notification.remove();
        }, 400);
    }, 4000);
}

// Enhanced Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.parallax');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            const rotation = scrolled * 0.01;
            element.style.transform = `translateY(${yPos}px) rotate(${rotation}deg)`;
        });
    });
}

// Enhanced Typing Effect
function initTypingEffect() {
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        const texts = ['AI Solutions', 'Machine Learning', 'Data Analytics', 'Automation', 'Innovation'];
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function type() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = 100;

            if (isDeleting) {
                typeSpeed /= 2;
            }

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500; // Pause before next word
            }

            // Add glow effect during typing
            typingElement.style.textShadow = `0 0 20px rgba(0, 102, 255, 0.8)`;

            setTimeout(type, typeSpeed);
        }

        type();
    }
}

// Enhanced Particle System
function initParticleSystem() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const particleCount = 80;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.size = Math.random() * 3 + 1;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.color = `hsl(${200 + Math.random() * 60}, 100%, 70%)`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Add some randomness
            this.vx += (Math.random() - 0.5) * 0.1;
            this.vy += (Math.random() - 0.5) * 0.1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.opacity;
            ctx.fill();
            
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();

    // Resize canvas on window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}

// Scroll Progress Bar
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Magnetic Effects
function initMagneticEffects() {
    const magneticElements = document.querySelectorAll('.btn, .feature-card, .service-card');
    
    magneticElements.forEach(element => {
        // Skip hero title to keep it stable
        if (element.closest('.hero-title') || element.classList.contains('hero-title')) {
            return;
        }
        
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            element.style.transform = `translate(${x * 0.05}px, ${y * 0.05}px)`;
        });
        
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'translate(0, 0)';
        });
    });
}

// Glitch Effect
function initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.hero-title, .section-title');
    
    glitchElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.animation = 'glitch 0.3s ease-in-out';
        });
        
        element.addEventListener('animationend', () => {
            element.style.animation = '';
  });
}); 
}

// Matrix Rain Effect
function initMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
        opacity: 0.1;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
    const matrixArray = matrix.split("");

    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#0066ff';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(draw, 35);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add enhanced CSS for new effects
const enhancedStyles = document.createElement('style');
enhancedStyles.textContent = `
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .notification {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }
    
    .nav-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(0, 102, 255, 0.3);
        transform: scale(0);
        animation: nav-ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes nav-ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .form-group input.error,
    .form-group textarea.error {
        border-color: #ef4444;
        box-shadow: 0 0 10px rgba(239, 68, 68, 0.3);
    }
    
    /* Ensure hero title stays stable */
    .hero-title {
        transform: none !important;
        transition: none !important;
    }
    
    .hero-title:hover {
        transform: none !important;
    }
`;
document.head.appendChild(enhancedStyles);

// Performance optimization
window.addEventListener('scroll', debounce(() => {
    // Throttled scroll events for better performance
}, 16));

// Initialize on window load
window.addEventListener('load', () => {
    console.log('🚀 Lockend AI website loaded successfully with enhanced animations!');
    
    // Add success animation to page load
    document.body.style.animation = 'fadeIn 1s ease-in-out';
    
    const fadeInStyles = document.createElement('style');
    fadeInStyles.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
    `;
    document.head.appendChild(fadeInStyles);
});
