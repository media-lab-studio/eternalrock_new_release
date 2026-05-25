// Функция для генерации слайдов и индикаторов
function generateSlides() {
    const slidesContainer = document.getElementById("slidesContainer");
    const indicatorsContainer = document.getElementById("slideIndicators");

    if (!slidesContainer) return;

    slidesContainer.innerHTML = "";
    indicatorsContainer.innerHTML = "";

    const altTexts = {
        1: "Rock Concert",
        2: "Guitar Player",
        3: "Band Performance",
        4: "Stage Show",
    };

    const totalSlides = 130;
    const randomStartIndex = Math.floor(Math.random() * totalSlides);
    
    console.log(`🎲 Случайный начальный слайд: ${randomStartIndex + 1}`);

    for (let i = 0; i < totalSlides; i++) {
        const slideDiv = document.createElement("div");
        slideDiv.className = `slide ${i === randomStartIndex ? "active" : ""}`;

        const img = document.createElement("img");
        img.src = `img/slides/slide${i + 1}.jpg`;
        img.alt = altTexts[i + 1] || "Audience";
        img.loading = "lazy";

        slideDiv.appendChild(img);
        slidesContainer.appendChild(slideDiv);

        if (i < 5) {
            const indicator = document.createElement("span");
            indicator.className = `indicator ${i === randomStartIndex && randomStartIndex < 5 ? "active" : ""}`;
            indicatorsContainer.appendChild(indicator);
        }
    }

    console.log(`✅ Сгенерировано ${totalSlides} слайдов`);
    return randomStartIndex;
}

class SlideShow {
    constructor(startIndex = 0) {
        this.slides = document.querySelectorAll(".slide");
        this.indicators = document.querySelectorAll(".indicator");
        this.prevBtn = document.querySelector(".slide-nav.prev");
        this.nextBtn = document.querySelector(".slide-nav.next");
        this.currentSlide = startIndex;
        this.slideInterval = null;
        this.slideDuration = 30000;
        this.isFullscreen = false;

        this.init();
    }

    init() {
        if (this.slides.length === 0) {
            console.warn("⚠️ Слайды не найдены");
            return;
        }

        this.showSlide(this.currentSlide);

        if (this.prevBtn) {
            this.prevBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.prevSlide();
                this.resetAutoSlide();
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                this.nextSlide();
                this.resetAutoSlide();
            });
        }

        this.indicators.forEach((indicator, index) => {
