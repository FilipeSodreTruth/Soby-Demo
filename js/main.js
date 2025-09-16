// main.js — mantém o caminho da Terra e adiciona intro estilo exemplo
gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

// Controle de performance do GIF
function setupGifPerformanceControl() {
    const videoGif = document.getElementById('video-gif');
    if (!videoGif) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (videoGif.style.animationPlayState !== 'running') {
                    videoGif.style.animationPlayState = 'running';
                }
            } else {
                videoGif.style.animationPlayState = 'paused';
            }
        });
    }, { threshold: 0.1 });

    observer.observe(videoGif);

    let autoTimeout = setTimeout(() => {
        videoGif.style.animationPlayState = 'paused';
    }, 10000);

    const resumeOnInteraction = () => {
        clearTimeout(autoTimeout);
        videoGif.style.animationPlayState = 'running';
        autoTimeout = setTimeout(() => {
            videoGif.style.animationPlayState = 'paused';
        }, 8000);
    };

    document.addEventListener('scroll', resumeOnInteraction, { passive: true });
    document.addEventListener('mousemove', resumeOnInteraction, { passive: true });
}

function updateProgressBar() {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.querySelector('.progress').style.width = scrolled + '%';
}

/* ========= Intro: círculo no centro -> cresce até TAMANHO FIXO =========
   (somente tamanho alterado; resto do código intacto) */
function videoIntroAnimation() {
    const videoCircle = document.getElementById('video-circle');
    const videoGif = document.getElementById('video-gif');
    if (!videoCircle || !videoGif) return;

    // Tamanhos finais (aumentados para GIF maior)
    const ASPECT = 16 / 9;
    const TARGET_DESKTOP_W = 1500;  // >=1280px (era 960, agumento +25%)
    const TARGET_LARGE_W = 1050;   // >=992px (era 840, aumento +25%)
    const TARGET_TABLET_W = 900;   // >=768px (era 720, aumento +25%)
    const TARGET_PHABLET_W = 700;  // >=480px (era 560, aumento +25%)
    const TARGET_MOBILE_W = 525;   // <480px (era 420, aumento +25%)

    const vw = window.innerWidth;
    const targetW =
        vw >= 1080 ? TARGET_DESKTOP_W :
            vw >= 992 ? TARGET_LARGE_W :
                vw >= 768 ? TARGET_TABLET_W :
                    vw >= 480 ? TARGET_PHABLET_W :
                        TARGET_MOBILE_W;

    const targetH = Math.round(targetW / ASPECT);

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: "#video-intro-section",
            start: "top center",
            end: "bottom center",
            toggleActions: "play none none none"
        }
    });

    // começa pequeno (50x50 do CSS) e cresce até o tamanho final centralizado
    tl.set(videoCircle, { width: 50, height: 50 })
        .to({}, { duration: 0.25 }) // pequena pausa
        .to(videoCircle, {
            width: targetW,
            height: targetH,
            borderRadius: 0,
            duration: 2.0,
            ease: "power2.inOut"
        });

    // o GIF respeita a proporção dentro do container
    gsap.set(videoGif, { objectFit: "contain" });

    // mantém coerente em resize/refresh
    ScrollTrigger.addEventListener("refreshInit", () => {
        const vw2 = window.innerWidth;
        const w2 =
            vw2 >= 1280 ? 1200 :  // TARGET_DESKTOP_W
                vw2 >= 992 ? 1050 :   // TARGET_LARGE_W
                    vw2 >= 768 ? 900 :    // TARGET_TABLET_W
                        vw2 >= 480 ? 700 :    // TARGET_PHABLET_W
                            525;              // TARGET_MOBILE_W
        gsap.set(videoCircle, { width: w2, height: Math.round(w2 / ASPECT) });
    });
}

/* ========= NOVA: Animação GSAP círculo para retângulo =========
   Substitui a animação CSS por uma versão GSAP mais controlada */
function gsapCircleToRectangleAnimation() {
    const videoSection = document.getElementById('video-intro-section');
    if (!videoSection) return;

    // Remove a animação CSS e controla via GSAP
    videoSection.style.animation = 'none';
    
    // Configuração inicial: círculo pequeno no centro
    gsap.set(videoSection, {
        clipPath: "circle(0px at 50% 50%)"
    });

    // Timeline principal da animação - com mais tempo no círculo pequeno
    const tl = gsap.timeline({
        delay: 1.0 // delay inicial maior
    });

    // Primeiro: fica um tempo com círculo muito pequeno
    tl.to(videoSection, {
        clipPath: "circle(100px at 50% 50%)",
        duration: 1, // 2 segundos com círculo pequeno
        ease: "power2.inOut"
    })
    // Depois: pausa mantendo o círculo pequeno
    .to({}, { duration: 1.5 }) // 1.5 segundos de pausa
    // Finalmente: crescimento rápido até cobrir toda a tela
    .to(videoSection, {
        clipPath: "circle(150vmax at 50% 50%)",
        duration: 3.5, // crescimento final
        ease: "power2.out"
    });

    // Verificar se usuário prefere movimento reduzido
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
        // Pula a animação e vai direto para o final
        gsap.set(videoSection, {
            clipPath: "circle(150vmax at 50% 50%)"
        });
    }
}

/* ========= Controle de visibilidade do header =========
   Esconde header na primeira seção e mostra fixo a partir da segunda */
function setupHeaderVisibility() {
    const header = document.querySelector('header');
    if (!header) return;

    // Inicialmente esconde o header
    gsap.set(header, {
        opacity: 0,
        y: -100,
        pointerEvents: 'none'
    });

    // Cria ScrollTrigger para mostrar/esconder header
    ScrollTrigger.create({
        trigger: "#section2",
        start: "top 90%", // Quando section2 está quase entrando na tela
        end: "bottom top",
        onEnter: () => {
            // Mostra header com animação suave
            gsap.to(header, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: "power2.out",
                pointerEvents: 'auto'
            });
        },
        onLeaveBack: () => {
            // Esconde header quando volta para section1
            gsap.to(header, {
                opacity: 0,
                y: -100,
                duration: 0.3,
                ease: "power2.in",
                pointerEvents: 'none'
            });
        }
    });

    // Adiciona classe para tornar header fixo quando visível
    const style = document.createElement('style');
    style.textContent = `
        header.fixed-header {
            position: fixed !important;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(245, 236, 228, 0.95);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }
    `;
    document.head.appendChild(style);
    
    // Adiciona classe quando header estiver visível
    ScrollTrigger.create({
        trigger: "#section2",
        start: "top 90%",
        end: "bottom top",
        onEnter: () => header.classList.add('fixed-header'),
        onLeaveBack: () => header.classList.remove('fixed-header')
    });
}

function startAnimations() {
    /* ========== Animação do Vídeo Intro ========== */
    videoIntroAnimation();

    /* ========== ScrollSmoother (como no exemplo) ========== */
    const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 4, // Reduzido para melhor performance
        effects: true,
        onUpdate: updateProgressBar
    });

    /* ========== Animação inicial do título principal ========== */
    gsap.set("#section1 h1", { opacity: 0, y: 50 });
    gsap.to("#section1 h1", {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power2.out",
        delay: 0.3
    });

    /* ========== 3D: spin contínuo do globo ========== */
    const earth = window.earthModel;
    if (earth) {
        gsap.set(earth.scale, { x: 5, y: 5, z: 5 });
        gsap.set(earth.position, { x: 0, y: -1, z: 0 });
        gsap.set(earth.rotation, { x: 0.2, y: -0.5, z: 0 });

        gsap.to(earth.rotation, {
            y: `+=${Math.PI * 2}`,
            ease: "none",
            repeat: -1,
            duration: 22
        });
    }

    /* ========== 2D: mover #earth-container (MESMA ANIMAÇÃO, COMEÇA INVISÍVEL) ========== */
    const globeEl = document.getElementById("earth-container");

    // knobs do dock final
    const DOCK_X = "-56vw";
    const DOCK_Y = "10vh";
    const LANE_L = "clamp(360px, 42vw, 640px)";

    // GLOBO COMEÇA INVISÍVEL
    gsap.set(globeEl, {
        x: "-32vw",
        y: "-2vh",
        opacity: 0,
        scale: 0
    });

    // Aparece quando section1 entra em vista
    gsap.to(globeEl, {
        opacity: 1,
        scale: 1,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#section1",
            start: "top 30%", // Aparece quando section1 está bem visível (30% da tela)
            toggleActions: "play none none none"
        }
    });

    // Timeline de movimento COMPLETA (mesmo caminho original)
    const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
            trigger: "#smooth-content", // Volta ao trigger original
            start: "top top",
            end: "bottom bottom", // Vai até o final
            scrub: 1,
            fastScrollEnd: true,
            invalidateOnRefresh: true
        }
    });

    tl.to(globeEl, {
        keyframes: [
            { x: "-22vw", y: "8vh", duration: 0.22 }, // section 2
            { x: "-36vw", y: "-6vh", duration: 0.22 }, // section 3
            { x: "-18vw", y: "10vh", duration: 0.18 }, // section 4
            { x: "-28vw", y: "2vh", duration: 0.18 }, // section 5
            { x: DOCK_X, y: DOCK_Y, duration: 0.20 }  // section 6 (dock final)
        ]
    });

    /* ========== Dock final: só mexe no layout do texto (CSS) ========== */
    ScrollTrigger.create({
        trigger: "#section6",
        start: "top 75%",
        end: "bottom bottom",
        onEnter: () => {
            const s6 = document.getElementById("section6");
            s6.classList.add("globe-docked");
            s6.style.setProperty("--globe-lane", LANE_L);
            s6.style.setProperty("--text-dock-y", "10vh");
        },
        onLeaveBack: () => {
            const s6 = document.getElementById("section6");
            s6.classList.remove("globe-docked");
            s6.style.removeProperty("--globe-lane");
            s6.style.removeProperty("--text-dock-y");
        }
    });

    /* ========== Dock final: só mexe no layout do texto (CSS) ========== */
    ScrollTrigger.create({
        trigger: "#section6",
        start: "top 75%",
        end: "bottom bottom",
        onEnter: () => {
            const s6 = document.getElementById("section6");
            s6.classList.add("globe-docked");
            s6.style.setProperty("--globe-lane", LANE_L);
            s6.style.setProperty("--text-dock-y", "10vh");
        },
        onLeaveBack: () => {
            const s6 = document.getElementById("section6");
            s6.classList.remove("globe-docked");
            s6.style.removeProperty("--globe-lane");
            s6.style.removeProperty("--text-dock-y");
        }
    });

    /* ========== Animações de conteúdo (iguais/compatíveis) ========== */
    gsap.from(
        ['#section2 .heading', '#section2 .content-wrapper', '#section2 .feature-box'],
        {
            y: 40,
            opacity: 0,
            duration: 0.45,
            stagger: 0.06,
            ease: 'power3.out',
            scrollTrigger: { trigger: '#section2', start: 'top 72%', toggleActions: 'play none none reverse' }
        }
    );

    gsap.from('#section3 .content-wrapper', {
        scrollTrigger: { trigger: '#section3', start: 'top 60%', end: 'bottom center', scrub: 1 },
        y: '80%', opacity: 0, ease: 'power1.inOut',
    });

    gsap.from('#section6 .content-wrapper', {
        scrollTrigger: { trigger: '#section6', start: 'top 60%', end: 'bottom center', scrub: 1 },
        y: '50%', opacity: 0, ease: 'power1.inOut',
    });

    // reposiciona base quando recalcular layout
    ScrollTrigger.addEventListener("refreshInit", () => {
        gsap.set(globeEl, { x: "-32vw", y: "-2vh" });
    });
}

/* Intro (primeira visita): apenas SplitText no título */
function runIntro() {
    // Globo não aparece aqui - só na section1

    try {
        const split = SplitText.create('#section1 .heading', {
            type: 'chars, words, lines',
            mask: 'lines'
        });

        gsap.from(split.chars, {
            yPercent: () => gsap.utils.random(-100, 100),
            rotation: () => gsap.utils.random(-30, 30),
            autoAlpha: 0,
            ease: 'back.out(1.5)',
            stagger: { amount: 0.5, from: 'random' },
            duration: 1.5
        });
    } catch (e) {
        gsap.from('#section1 .heading', {
            y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
        });
    }

    /* ========== INTRO estilo do exemplo (não altera a trajetória) ========== */
    runIntro();
}

/* Intro (primeira visita): apenas SplitText no título */
function runIntro() {
    // Globo não aparece aqui - só na section1

    try {
        const split = SplitText.create('#section1 .heading', {
            type: 'chars, words, lines',
            mask: 'lines'
        });

        gsap.from(split.chars, {
            yPercent: () => gsap.utils.random(-100, 100),
            rotation: () => gsap.utils.random(-30, 30),
            autoAlpha: 0,
            ease: 'back.out(1.5)',
            stagger: { amount: 0.5, from: 'random' },
            duration: 1.5
        });
    } catch (e) {
        gsap.from('#section1 .heading', {
            y: 40, opacity: 0, duration: 0.8, ease: 'power2.out'
        });
    }
}

// deixa acessível no console se precisar
window.startAnimations = startAnimations;

// Inicializa controles de performance quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    setupGifPerformanceControl();
    
    // Inicia a nova animação GSAP círculo para retângulo
    gsapCircleToRectangleAnimation();
    
    // Configura visibilidade do header
    setupHeaderVisibility();
});
