// ========================================
// CARRUSEL DE IMÁGENES DE FONDO
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.carousel-slide');
    let currentSlide = 0;
    const slideInterval = 5000; // 7 segundos

    // Función para cambiar a la siguiente imagen
    function nextSlide() {
        // Remover clase active del slide actual
        slides[currentSlide].classList.remove('active');
        
        // Incrementar al siguiente slide
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Agregar clase active al nuevo slide
        slides[currentSlide].classList.add('active');
    }

    // Iniciar el carrusel automático
    // const carouselTimer = setInterval(nextSlide, slideInterval);

    // Opcional: Pausar el carrusel si el usuario interactúa con el login
    const loginBox = document.querySelector('.login-box');
    
    if (loginBox) {
        loginBox.addEventListener('mouseenter', function() {
            clearInterval(carouselTimer);
        });

        loginBox.addEventListener('mouseleave', function() {
            setInterval(nextSlide, slideInterval);
        });
    }

    // Precargar todas las imágenes para transiciones suaves
    function preloadImages() {
        slides.forEach(slide => {
            const bgImage = slide.style.backgroundImage;
            if (bgImage) {
                const url = bgImage.slice(4, -1).replace(/"/g, '');
                const img = new Image();
                img.src = url;
            }
        });
    }

    preloadImages();

    console.log('Carrusel iniciado: ' + slides.length + ' imágenes en rotación');
});