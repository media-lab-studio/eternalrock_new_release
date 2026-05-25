// Функция для генерации слайдов и индикаторов
function generateSlides() {
  const slidesContainer = document.getElementById("slidesContainer");
  const indicatorsContainer = document.getElementById("slideIndicators");

  if (!slidesContainer) return;

  // Очищаем контейнеры
  slidesContainer.innerHTML = "";
  indicatorsContainer.innerHTML = "";

  // Массив с alt текстами для разных слайдов
  const altTexts = {
    1: "Rock Concert",
    2: "Guitar Player",
    3: "Band Performance",
    4: "Stage Show",
  };

  // Количество слайдов (можно легко изменить)
  const totalSlides = 130;

  // Выбираем случайный индекс для первого слайда (от 0 до totalSlides-1)
  const randomStartIndex = Math.floor(Math.random() * totalSlides);
  
  console.log(`🎲 Случайный начальный слайд: ${randomStartIndex + 1}`);

  // Генерируем слайды
  for (let i = 0; i < totalSlides; i++) {
    // Создаем слайд
    const slideDiv = document.createElement("div");
    // Делаем активным только тот слайд, который соответствует случайному индексу
    slideDiv.className = `slide ${i === randomStartIndex ? "active" : ""}`;

    const img = document.createElement("img");
    img.src = `img/slides/slide${i + 1}.jpg`;
    img.alt = altTexts[i + 1] || "Audience";
    img.loading = "lazy";

    slideDiv.appendChild(img);
    slidesContainer.appendChild(slideDiv);

    // Генерируем индикаторы (только первые 5)
    if (i < 5) {
      const indicator = document.createElement("span");
      // Делаем активным индикатор, соответствующий случайному начальному слайду (только если он в первых 5)
      indicator.className = `indicator ${i === randomStartIndex && randomStartIndex < 5 ? "active" : ""}`;
      indicatorsContainer.appendChild(indicator);
    }
  }

  console.log(`✅ Сгенерировано ${totalSlides} слайдов, начальный слайд: ${randomStartIndex + 1}`);
  
  // Возвращаем случайный индекс, чтобы использовать его в SlideShow
  return randomStartIndex;
}

// Класс SlideShow (только один раз!)
class SlideShow {
  constructor(startIndex = 0) {
    // После генерации слайдов обновляем ссылки на элементы
    this.slides = document.querySelectorAll(".slide");
    this.indicators = document.querySelectorAll(".indicator");
    this.prevBtn = document.querySelector(".slide-nav.prev");
    this.nextBtn = document.querySelector(".slide-nav.next");
    this.currentSlide = startIndex; // Используем переданный начальный индекс
    this.slideInterval = null;
    this.slideDuration = 30000; // 30 секунд
    this.isFullscreen = false;

    this.init();
  }

  init() {
    // Проверяем, есть ли слайды
    if (this.slides.length === 0) {
      console.warn("⚠️ Слайды не найдены");
      return;
    }

    // Показываем слайд с случайным индексом
    this.showSlide(this.currentSlide);

    // Настройка кнопок
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

    // Настройка индикаторов
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener("click", (e) => {
        e.stopPropagation();
        this.showSlide(index);
        this.resetAutoSlide();
      });
    });

    // Пауза при наведении
    const slideShow = document.querySelector(".slide-show");
    if (slideShow) {
      slideShow.addEventListener("mouseenter", () => {
        this.stopAutoSlide();
      });

      slideShow.addEventListener("mouseleave", () => {
        this.startAutoSlide();
      });

      slideShow.addEventListener("click", (e) => e.stopPropagation());
    }

    // Запуск автопрокрутки
    this.startAutoSlide();
    console.log(
      `🎬 Слайдер инициализирован. Всего слайдов: ${this.slides.length}, текущий слайд: ${this.currentSlide + 1}`,
    );
  }

  showSlide(index) {
    // Скрыть текущий слайд
    this.slides.forEach((slide) => slide.classList.remove("active"));
    this.indicators.forEach((indicator) =>
      indicator.classList.remove("active"),
    );

    // Установить новый индекс
    this.currentSlide = (index + this.slides.length) % this.slides.length;

    // Показать новый слайд
    this.slides[this.currentSlide].classList.add("active");
    if (this.indicators[this.currentSlide]) {
      this.indicators[this.currentSlide].classList.add("active");
    }
  }

  nextSlide() {
    // выбираем случайный слайд
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
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, this.slideDuration);
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

    if (!slideShow) return;

    // Перемещаем слайдер в body
    const slideShowContainer = slideShow.parentNode;
    slideShowContainer.removeChild(slideShow);
    body.appendChild(slideShow);

    // Применяем полноэкранные стили
    slideShow.style.position = "fixed";
    slideShow.style.top = "0";
    slideShow.style.left = "0";
    slideShow.style.width = "100vw";
    slideShow.style.height = "100vh";
    slideShow.style.margin = "0";
    slideShow.style.padding = "0";
    slideShow.style.borderRadius = "0";
    slideShow.style.border = "none";
    slideShow.style.boxShadow = "none";
    slideShow.style.backgroundColor = "#000";
    slideShow.style.zIndex = "99999";

    // Обновляем изображения
    this.slides.forEach((slide) => {
      const img = slide.querySelector("img");
      if (img) {
        img.style.width = "100vw";
        img.style.height = "100vh";
        img.style.objectFit = "contain";
      }
    });

    // Увеличиваем кнопки
    if (this.prevBtn) {
      this.prevBtn.style.width = "60px";
      this.prevBtn.style.height = "60px";
      this.prevBtn.style.fontSize = "1.5rem";
      this.prevBtn.style.left = "25px";
    }

    if (this.nextBtn) {
      this.nextBtn.style.width = "60px";
      this.nextBtn.style.height = "60px";
      this.nextBtn.style.fontSize = "1.5rem";
      this.nextBtn.style.right = "25px";
    }

    // Увеличиваем индикаторы
    this.indicators.forEach((indicator) => {
      indicator.style.width = "16px";
      indicator.style.height = "16px";
    });

    // Добавляем классы
    slideShow.classList.add("fullscreen");
    body.classList.add("fullscreen-mode");

    // Показываем кнопку выхода
    const fullscreenExit = document.getElementById("fullscreenExit");
    if (fullscreenExit) {
      fullscreenExit.style.display = "flex";
    }

    // Блокируем прокрутку
    document.documentElement.style.overflow = "hidden";
    body.style.overflow = "hidden";

    this.isFullscreen = true;
    console.log("📺 Полноэкранный режим включен");

    // Продолжаем автопрокрутку
    this.startAutoSlide();
  }

  exitFullscreen() {
    const slideShow = document.querySelector(".slide-show");
    const body = document.body;
    const slideShowContainer = document.querySelector(".slide-show-container");

    if (!slideShow || !slideShowContainer) return;

    // Возвращаем слайдер обратно
    body.removeChild(slideShow);
    slideShowContainer.appendChild(slideShow);

    // Сбрасываем стили
    slideShow.style.cssText = "";

    // Сбрасываем стили изображений
    this.slides.forEach((slide) => {
      const img = slide.querySelector("img");
      if (img) {
        img.style.cssText = "";
      }
    });

    // Сбрасываем стили кнопок
    if (this.prevBtn) {
      this.prevBtn.style.cssText = "";
    }

    if (this.nextBtn) {
      this.nextBtn.style.cssText = "";
    }

    // Сбрасываем стили индикаторов
    this.indicators.forEach((indicator) => {
      indicator.style.cssText = "";
    });

    // Убираем классы
    slideShow.classList.remove("fullscreen");
    body.classList.remove("fullscreen-mode");

    // Скрываем кнопку выхода
    const fullscreenExit = document.getElementById("fullscreenExit");
    if (fullscreenExit) {
      fullscreenExit.style.display = "none";
    }

    // Разблокируем прокрутку
    document.documentElement.style.overflow = "";
    body.style.overflow = "";

    this.isFullscreen = false;
    console.log("🚪 Полноэкранный режим выключен");

    // Продолжаем автопрокрутку
    this.startAutoSlide();
  }

  toggleFullscreen() {
    if (this.isFullscreen) {
      this.exitFullscreen();
    } else {
      this.enterFullscreen();
    }
  }
}

// Функция для обновления ссылок на элементы после генерации слайдов
function updateSlideReferences() {
  if (window.slideShowInstance) {
    window.slideShowInstance.slides = document.querySelectorAll(".slide");
    window.slideShowInstance.indicators =
      document.querySelectorAll(".indicator");
    console.log("🔄 Ссылки на слайды обновлены");
  }
}

// Обновление текущего времени
function updateCurrentTime() {
  const timeElement = document.getElementById("currentTime");
  if (!timeElement) return;

  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");

  timeElement.textContent = `${hours}:${minutes}`;
}

// Подсветка текущего пункта расписания
function highlightCurrentSchedule() {
  const items = document.querySelectorAll(".schedule-item");
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  items.forEach((item) => {
    const timeText = item.querySelector(".time").textContent;
    const times = timeText.match(/(\d{2}):(\d{2})/g);

    if (times && times.length === 2) {
      const [start, end] = times;
      const [startHour, startMinute] = start.split(":").map(Number);
      const [endHour, endMinute] = end.split(":").map(Number);

      const startTime = startHour * 60 + startMinute;
      let endTime = endHour * 60 + endMinute;

      if (endTime < startTime) {
        endTime += 24 * 60;
      }

      let currentTimeAdjusted = currentTime;
      if (currentTime < startTime && endTime > 24 * 60) {
        currentTimeAdjusted += 24 * 60;
      }

      item.classList.remove("active");
      const liveBadge = item.querySelector(".live-badge");
      if (liveBadge) liveBadge.remove();

      if (currentTimeAdjusted >= startTime && currentTimeAdjusted < endTime) {
        item.classList.add("active");
        const programSpan = item.querySelector(".program");
        if (programSpan && !programSpan.querySelector(".live-badge")) {
          const badge = document.createElement("span");
          badge.className = "live-badge";
          badge.textContent = "СЕЙЧАС В ЭФИРЕ";
          programSpan.appendChild(badge);
        }
      }
    }
  });
}

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  // Сначала генерируем слайды и получаем случайный начальный индекс
  const randomStartIndex = generateSlides();

  // Затем инициализируем слайдер с случайным начальным индексом
  if (document.querySelector(".slide-show")) {
    window.slideShowInstance = new SlideShow(randomStartIndex);
  }

  // Кнопка полноэкранного режима
  const fullscreenToggle = document.getElementById("fullscreenToggle");
  if (fullscreenToggle) {
    fullscreenToggle.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.slideShowInstance) {
        window.slideShowInstance.toggleFullscreen();
      }
    });
  }

  // Кнопка выхода
  const fullscreenExit = document.getElementById("fullscreenExit");
  if (fullscreenExit) {
    fullscreenExit.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (window.slideShowInstance) {
        window.slideShowInstance.exitFullscreen();
      }
    });
  }

  // Выход по ESC
  document.addEventListener("keydown", function (event) {
    if (
      event.key === "Escape" &&
      window.slideShowInstance &&
      window.slideShowInstance.isFullscreen
    ) {
      window.slideShowInstance.exitFullscreen();
    }
  });

  // Клик вне слайдера для выхода
  document.addEventListener("click", function (event) {
    if (
      window.slideShowInstance &&
      window.slideShowInstance.isFullscreen &&
      !event.target.closest(".slide-show") &&
      !event.target.closest(".fullscreen-toggle") &&
      !event.target.closest(".fullscreen-exit") &&
      !event.target.closest(".slide-nav")
    ) {
      window.slideShowInstance.exitFullscreen();
    }
  });

  // Обновление времени
  updateCurrentTime();
  setInterval(updateCurrentTime, 60000);

  // Подсветка расписания
  highlightCurrentSchedule();
  setInterval(highlightCurrentSchedule, 60000);

  // Контроль громкости
  const volumeSlider = document.getElementById("volumeSlider");
  const volumePercent = document.getElementById("volumePercent");
  if (volumeSlider && volumePercent) {
    volumeSlider.addEventListener("input", function () {
      volumePercent.textContent = `${this.value}%`;
    });
  }

  // Анимация пластинки
  const recordButton = document.getElementById("recordButton");
  if (recordButton) {
    recordButton.addEventListener("click", function () {
      this.classList.toggle("record-playing-small");
    });
  }

  // Функция для тестирования
  window.testSlideShow = function () {
    if (window.slideShowInstance) {
      console.log("=== СТАТУС СЛАЙДЕРА ===");
      console.log("Текущий слайд:", window.slideShowInstance.currentSlide + 1);
      console.log("Всего слайдов:", window.slideShowInstance.slides.length);
      console.log(
        "Интервал активен:",
        window.slideShowInstance.slideInterval ? "ДА" : "НЕТ",
      );
      console.log(
        "Полноэкранный режим:",
        window.slideShowInstance.isFullscreen ? "ДА" : "НЕТ",
      );
      console.log(
        "Следующее переключение через:",
        window.slideShowInstance.slideInterval
          ? `${window.slideShowInstance.slideDuration / 1000} сек`
          : "не активен",
      );
    } else {
      console.log("❌ Слайдер не инициализирован");
    }
  };

  // Запустить тест сразу
  setTimeout(() => {
    window.testSlideShow();
  }, 1000);
});
