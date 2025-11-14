    document.addEventListener('DOMContentLoaded', () => {
            const navLinks = document.getElementById("navLinks");
            const menuBtn = document.getElementById("menuBtn");
            const typingElement = document.getElementById("typing");
            const toggleAudioBtn = document.getElementById("toggleAudio");
            const contactForm = document.getElementById("contactForm");
            const popup = document.getElementById("popup");
            const networkCanvas = document.getElementById("networkCanvas");
            const ctx = networkCanvas.getContext("2d");
            
            let audioPlaying = false;
            let synth;
            let resizeTimeout;

            // --- 1. CANVAS NETWORK ANIMADO ---
            let particles = [];
            const DOT_COUNT = 80;
            const CONNECT_DISTANCE = 120;
            
            function initCanvas() {
                networkCanvas.width = window.innerWidth;
                networkCanvas.height = window.innerHeight;
                particles = [];
                for (let i = 0; i < DOT_COUNT; i++) {
                    particles.push({
                        x: Math.random() * networkCanvas.width,
                        y: Math.random() * networkCanvas.height,
                        vx: (Math.random() - 0.5) * 0.7,
                        vy: (Math.random() - 0.5) * 0.7
                    });
                }
            }
            
            function drawNetwork() {
                // Fondo con desvanecimiento sutil para un efecto de "rastro"
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, networkCanvas.width, networkCanvas.height);
            
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;

                    // Manejo de límites
                    if (p.x < 0 || p.x > networkCanvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > networkCanvas.height) p.vy *= -1;

                    // Dibujar punto (nodo)
                    ctx.fillStyle = "#00eaff"; 
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });

                // Conectar partículas (aristas)
                for (let i = 0; i < particles.length; i++) {
                    for (let j = i + 1; j < particles.length; j++) {
                        let dx = particles[i].x - particles[j].x;
                        let dy = particles[i].y - particles[j].y;
                        let dist = Math.sqrt(dx * dx + dy * dy);

                        if (dist < CONNECT_DISTANCE) {
                            let opacity = 1 - (dist / CONNECT_DISTANCE);
                            ctx.strokeStyle = `rgba(0, 234, 255, ${opacity * 0.5})`; // Líneas sutiles
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(drawNetwork);
            }
            
            // Re-inicializar en resize
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(initCanvas, 250);
            });
            
            initCanvas();
            drawNetwork();


            // --- 2. TYPING EFECT (Con borrado y frases mejoradas) ---
            const typingTexts = [
                "Conectando el futuro.",
                "Datos en tiempo real.",
                "Automatización inteligente.",
                "El mundo es nuestra red."
            ];
            let index = 0;
            let charIndex = 0;
            let isDeleting = false;

            function typingEffect() {
                const currentPhrase = typingTexts[index];
                
                if (isDeleting) {
                    typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
                    charIndex--;
                } else {
                    typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
                    charIndex++;
                }

                if (!isDeleting && charIndex === currentPhrase.length) {
                    setTimeout(() => isDeleting = true, 1500);
                } else if (isDeleting && charIndex === 0) {
                    isDeleting = false;
                    index = (index + 1) % typingTexts.length;
                    setTimeout(typingEffect, 500);
                    return;
                }

                const typingSpeed = isDeleting ? 40 : 80;
                setTimeout(typingEffect, typingSpeed);
            }
            typingEffect();


            // --- 3. SCROLL REVEAL (Intersection Observer) ---
            const sections = document.querySelectorAll(".reveal");
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                });
            }, observerOptions);

            sections.forEach(section => {
                observer.observe(section);
            });


            // --- 4. MENÚ MÓVIL ---
            menuBtn.addEventListener("click", () => {
                navLinks.classList.toggle("show");
            });
            
            // Cerrar menú al hacer clic en un enlace
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    if (navLinks.classList.contains('show')) {
                        navLinks.classList.remove('show');
                    }
                });
            });


            // --- 5. LIGHTBOX ---
            window.openLightbox = (src) => {
                const lightboxImg = document.getElementById("lightboxImg");
                const lightbox = document.getElementById("lightbox");
                lightboxImg.src = src;
                lightbox.style.display = "flex";
                document.body.style.overflow = 'hidden'; 
            };

            window.closeLightbox = () => {
                document.getElementById("lightbox").style.display = "none";
                document.body.style.overflow = 'auto';
            };

            document.addEventListener("keydown", e => {
                if (e.key === "Escape") window.closeLightbox();
            });


            // --- 6. AUDIO AMBIENTAL (Tone.js) ---
            function initAudio() {
                if (Tone.context.state !== 'running') {
                    Tone.start();
                }

                // Synth para un sonido de pad futurista
                synth = new Tone.PolySynth(Tone.Synth, {
                    oscillator: { type: "sine" },
                    envelope: {
                        attack: 4, decay: 1, sustain: 0.5, release: 8
                    }
                }).toDestination();
                
                // Reverb para ambiente espacial
                const reverb = new Tone.Reverb(5).toDestination();
                synth.connect(reverb);
                
                // Progresión de acordes Cm9 -> Abmaj7
                const chord1 = ["C3", "Eb3", "G3", "Bb3", "D4"];
                const chord2 = ["Ab3", "C4", "Eb4", "G4"];
                let chordIndex = 0;

                const loop = new Tone.Loop(time => {
                    if (chordIndex % 2 === 0) {
                        synth.triggerAttackRelease(chord1, "8m", time);
                    } else {
                        synth.triggerAttackRelease(chord2, "8m", time);
                    }
                    chordIndex++;
                }, "8m").start(0);

                Tone.Transport.bpm.value = 40; 
                Tone.Transport.loop = true;
                Tone.Transport.loopEnd = "16m";
            }

            toggleAudioBtn.addEventListener("click", async () => {
                if (!synth) {
                    initAudio();
                }
                
                if (audioPlaying) {
                    Tone.Transport.stop();
                    synth.releaseAll();
                    toggleAudioBtn.textContent = "🔊 Música";
                } else {
                    await Tone.start();
                    Tone.Transport.start();
                    toggleAudioBtn.textContent = "🔇 Silenciar";
                }
                audioPlaying = !audioPlaying;
            });


            // --- 7. FORMULARIO – POPUP ---
            contactForm.addEventListener("submit", (e) => {
                e.preventDefault();

                popup.style.display = "block";
                
                setTimeout(() => {
                    popup.style.display = "none";
                }, 3000); 

                e.target.reset();
            });

            // --- 8. PARALLAX SUAVE ---
            const heroContent = document.querySelector(".hero-content");
            window.addEventListener("scroll", () => {
                let offset = window.pageYOffset;
                heroContent.style.transform = 
                    `translateY(${offset * 0.25}px) translateZ(0)`;
            });
            
        });