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
            indicator.addEventListener("click", (e) => {
                e.stopPropagation();
                this.showSlide(index);
                this.resetAutoSlide();
            });
        });

        const slideShow = document.querySelector(".slide-show");
        if (slideShow) {
            slideShow.addEventListener("mouseenter", () => this.stopAutoSlide());
            slideShow.addEventListener("mouseleave", () => this.startAutoSlide());
        }

        this.startAutoSlide();
        console.log(`🎬 Слайдер инициализирован. Слайдов: ${this.slides.length}`);
    }

    showSlide(index) {
        this.slides.forEach((slide) => slide.classList.remove("active"));
        this.indicators.forEach((indicator) => indicator.classList.remove("active"));

        this.currentSlide = (index + this.slides.length) % this.slides.length;
        this.slides[this.currentSlide].classList.add("active");
        if (this.indicators[this.currentSlide]) {
            this.indicators[this.currentSlide].classList.add("active");
        }
    }

    nextSlide() {
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * this.slides.length);
        } while (randomIndex === this.currentSlide && this.slides.length > 1);
        this.showSlide(randomIndex);
    }

    prevSlide() {
        this.showSlide(this.currentSlide - 1);
    }

    startAutoSlide() {
        this.stopAutoSlide();
        this.slideInterval = setInterval(() => this.nextSlide(), this.slideDuration);
    }

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    }

    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    }

    enterFullscreen() {
        const slideShow = document.querySelector(".slide-show");
        const body = document.body;
        const slideShowContainer = document.querySelector(".slide-show-container");

        if (!slideShow) return;

        slideShowContainer.removeChild(slideShow);
        body.appendChild(slideShow);

        slideShow.classList.add("fullscreen");
        body.classList.add("fullscreen-mode");

        const fullscreenExit = document.getElementById("fullscreenExit");
        if (fullscreenExit) fullscreenExit.style.display = "flex";

        document.documentElement.style.overflow = "hidden";
        body.style.overflow = "hidden";
        this.isFullscreen = true;
    }

    exitFullscreen() {
        const slideShow = document.querySelector(".slide-show");
        const body = document.body;
        const slideShowContainer = document.querySelector(".slide-show-container");

        if (!slideShow || !slideShowContainer) return;

        body.removeChild(slideShow);
        slideShowContainer.appendChild(slideShow);

        slideShow.classList.remove("fullscreen");
        body.classList.remove("fullscreen-mode");

        const fullscreenExit = document.getElementById("fullscreenExit");
        if (fullscreenExit) fullscreenExit.style.display = "none";

        document.documentElement.style.overflow = "";
        body.style.overflow = "";
        this.isFullscreen = false;
    }

    toggleFullscreen() {
        this.isFullscreen ? this.exitFullscreen() : this.enterFullscreen();
    }
}

// Обновление текущего времени
function updateCurrentTime() {
    const timeElement = document.getElementById("currentTime");
    if (!timeElement) return;
    const now = new Date();
    timeElement.textContent = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
}

// Подсветка текущего пункта расписания
function highlightCurrentSchedule() {
    const items = document.querySelectorAll(".schedule-item");
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    items.forEach((item) => {
        const timeText = item.querySelector(".time").textContent;
        const times = timeText.match(/(\d{2}):(\d{2})/g);

        if (times && times.length === 2) {
            const [start, end] = times;
            const [startHour, startMinute] = start.split(":").map(Number);
            const [endHour, endMinute] = end.split(":").map(Number);

            let startTime = startHour * 60 + startMinute;
            let endTime = endHour * 60 + endMinute;
            if (endTime < startTime) endTime += 24 * 60;

            let currentTimeAdjusted = currentTime;
            if (currentTime < startTime && endTime > 24 * 60) currentTimeAdjusted += 24 * 60;

            item.classList.remove("active");
            const liveBadge = item.querySelector(".live-badge");
            if (liveBadge) liveBadge.remove();

            if (currentTimeAdjusted >= startTime && currentTimeAdjusted < endTime) {
                item.classList.add("active");
                const programSpan = item.querySelector(".program");
                if (programSpan && !programSpan.querySelector(".live-badge")) {
                    const badge = document.createElement("span");
                    badge.className = "live-badge";
                    badge.textContent = "LIVE";
                    programSpan.appendChild(badge);
                }
            }
        }
    });
}

// Инициализация
document.addEventListener("DOMContentLoaded", () => {
    const randomStartIndex = generateSlides();

    if (document.querySelector(".slide-show")) {
        window.slideShowInstance = new SlideShow(randomStartIndex);
    }

    const fullscreenToggle = document.getElementById("fullscreenToggle");
    if (fullscreenToggle) {
        fullscreenToggle.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.slideShowInstance?.toggleFullscreen();
        });
    }

    const fullscreenExit = document.getElementById("fullscreenExit");
    if (fullscreenExit) {
        fullscreenExit.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.slideShowInstance?.exitFullscreen();
        });
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && window.slideShowInstance?.isFullscreen) {
            window.slideShowInstance.exitFullscreen();
        }
    });

    updateCurrentTime();
    setInterval(updateCurrentTime, 60000);

    highlightCurrentSchedule();
    setInterval(highlightCurrentSchedule, 60000);
});
