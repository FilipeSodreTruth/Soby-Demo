// app.js — SOPY Earth (Three.js + GSAP) - Versão Mobile Otimizada
// Define Three.js components in the global scope
let camera, scene, renderer, earthModel;
let container, animStarted = false;
let needsRender = true;
let renderRequestId = null;

// Mobile detection and optimization
const isMobile = () => window.innerWidth <= 768;
const isTablet = () => window.innerWidth > 768 && window.innerWidth <= 1024;

function init3D() {
  // Scene
  scene = new THREE.Scene();

  // Container
  container = document.getElementById('earth-container');
  if (!container) {
    console.error('Container #earth-container not found!');
    return;
  }

  // Renderer com otimizações para mobile
  const rendererOptions = {
    alpha: true,
    antialias: !isMobile(), // Desabilita antialiasing em mobile para performance
    powerPreference: isMobile() ? "low-power" : "high-performance",
    preserveDrawingBuffer: false,
    stencil: false,
    depth: true
  };
  
  renderer = new THREE.WebGLRenderer(rendererOptions);
  
  // Pixel ratio otimizado para mobile
  const pixelRatio = isMobile() ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x000000, 0); // 100% transparente
  
  // Shadow settings otimizados
  if (!isMobile()) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }
  
  const rect = container.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);
  container.appendChild(renderer.domElement);

  // Camera otimizada para cada dispositivo
  const fov = isMobile() ? 50 : 45; // FOV maior em mobile para compensar tela menor
  camera = new THREE.PerspectiveCamera(fov, rect.width / rect.height, 0.1, 1000);
  camera.position.set(0, 0, isMobile() ? 12 : 15); // Câmera mais próxima em mobile
  camera.lookAt(0, 0, 0);

  // Lights otimizadas para mobile
  const ambientIntensity = isMobile() ? 1.4 : 1.6;
  const directionalIntensity = isMobile() ? 0.9 : 1.1;
  
  const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
  scene.add(ambient);
  
  const dir = new THREE.DirectionalLight(0xffffff, directionalIntensity);
  dir.position.set(5, 5, 10);
  if (!isMobile()) {
    dir.castShadow = true;
    dir.shadow.mapSize.width = 1024;
    dir.shadow.mapSize.height = 1024;
  }
  scene.add(dir);

  // Load Earth model
  const loader = new THREE.GLTFLoader();
  loader.load('./images/earth.glb', onModelLoaded, undefined, (e) => {
    console.error('Error loading earth model:', e);
  });

  // Resize com debounce para mobile
  let resizeTimeout;
  const handleResize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(onResize, isMobile() ? 200 : 100);
  };
  window.addEventListener('resize', handleResize, { passive: true });
  
  // Pause rendering quando a aba não está visível (mobile battery saving)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      pauseRendering();
    } else {
      resumeRendering();
    }
  });
}

function onModelLoaded(gltf) {
  earthModel = gltf.scene;
  scene.add(earthModel);

  // Escala primeiro, depois recentra no (0,0,0)
  const scaleValue = 5;
  earthModel.scale.setScalar(scaleValue);

  earthModel.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(earthModel);
  const center = box.getCenter(new THREE.Vector3());
  earthModel.position.sub(center);
  earthModel.updateWorldMatrix(true, true);

  // Enquadra a câmera para o canvas atual
  fitToObject(earthModel, 1.08); // ~8% de margem

  // Disponibiliza para main.js
  window.earthModel = earthModel;

  // Inicia animações (se definidas em main.js)
  if (typeof startAnimations === 'function') startAnimations();

  // Render loop
  startRenderLoop();
}

// Calcula distância da câmera para o objeto caber no canvas
function fitToObject(object, margin = 1.1) {
  const rect = container.getBoundingClientRect();

  // Garante aspect correto
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();

  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);

  const vFOV = THREE.MathUtils.degToRad(camera.fov);
  const fitHeightDist = maxSize / (2 * Math.tan(vFOV / 2));
  const fitWidthDist = fitHeightDist / camera.aspect;
  const distance = margin * Math.max(fitHeightDist, fitWidthDist);

  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);
}

function startRenderLoop() {
  if (animStarted) return;
  animStarted = true;

  // FPS throttling para mobile (30fps vs 60fps)
  const targetFPS = isMobile() ? 30 : 60;
  const frameInterval = 1000 / targetFPS;
  let lastFrameTime = 0;

  function render(currentTime = 0) {
    if (needsRender) {
      // Throttle FPS em mobile
      if (isMobile()) {
        if (currentTime - lastFrameTime >= frameInterval) {
          renderer.render(scene, camera);
          lastFrameTime = currentTime;
          needsRender = false;
        }
      } else {
        renderer.render(scene, camera);
        needsRender = false;
      }
    }
    renderRequestId = requestAnimationFrame(render);
  }
  render();
}

// Função para marcar que precisa renderizar
function markNeedsRender() {
  needsRender = true;
}

// Funções de pausa/resume para economizar bateria
function pauseRendering() {
  if (renderRequestId) {
    cancelAnimationFrame(renderRequestId);
    renderRequestId = null;
    animStarted = false;
  }
}

function resumeRendering() {
  if (!animStarted) {
    startRenderLoop();
  }
  markNeedsRender();
}

// Otimização: pausa renderização quando fora de vista (melhorada para mobile)
function setupRenderOptimization() {
  if (!container) return;

  const observerOptions = isMobile() ? 
    { threshold: 0.2, rootMargin: '50px' } : 
    { threshold: 0.1, rootMargin: '100px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Earth container está visível - retoma renderização
        resumeRendering();
      } else {
        // Earth container não está visível - pausa renderização
        pauseRendering();
      }
    });
  }, observerOptions);

  observer.observe(container);
  
  // Performance monitoring para mobile
  if (isMobile()) {
    let frameCount = 0;
    let lastCheck = performance.now();
    
    const checkPerformance = () => {
      frameCount++;
      const now = performance.now();
      
      if (now - lastCheck > 5000) { // Check every 5 seconds
        const fps = (frameCount * 1000) / (now - lastCheck);
        
        // Se FPS muito baixo em mobile, reduz qualidade
        if (fps < 20 && renderer.getPixelRatio() > 1) {
          renderer.setPixelRatio(1);
          console.log('Reduced pixel ratio for better performance');
        }
        
        frameCount = 0;
        lastCheck = now;
      }
      
      if (needsRender) {
        requestAnimationFrame(checkPerformance);
      }
    };
    
    requestAnimationFrame(checkPerformance);
  }
}

function onResize() {
  if (!container) return;
  
  // Debounce resize para mobile
  const r = container.getBoundingClientRect();
  renderer.setSize(r.width, r.height);
  
  // Atualiza pixel ratio se necessário
  const newPixelRatio = isMobile() ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  if (renderer.getPixelRatio() !== newPixelRatio) {
    renderer.setPixelRatio(newPixelRatio);
  }
  
  camera.aspect = r.width / r.height;
  camera.updateProjectionMatrix();

  if (earthModel) {
    fitToObject(earthModel, 1.08);
    markNeedsRender(); // Marca para re-renderizar após resize
  }
}

// Initialize the 3D scene on DOM content load
document.addEventListener('DOMContentLoaded', () => {
  init3D();
  // Configura otimização de renderização após inicialização
  setTimeout(setupRenderOptimization, 1000);
  
  // Mobile-specific optimizations
  if (isMobile()) {
    // Reduce quality on low-end devices
    const canvas = renderer.domElement;
    canvas.style.imageRendering = 'auto';
    canvas.style.imageRendering = 'optimize-speed';
    
    // Prevent zoom on double tap
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    let lastTouchEnd = 0;
    canvas.addEventListener('touchend', (e) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });
  }
});
