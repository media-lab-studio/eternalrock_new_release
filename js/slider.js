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

  let i = 1;
  let totalSlides = 0;
  
  function tryLoadSlide() {
    const img = new Image();
    img.onload = () => {
      // Слайд существует - создаем его
      const slideDiv = document.createElement("div");
      slideDiv.className = `slide ${totalSlides === 0 ? "active" : ""}`;
      img.alt = altTexts[i] || "Audience";
      img.loading = "lazy";
      slideDiv.appendChild(img);
      slidesContainer.appendChild(slideDiv);

      // Создаем индикатор
      const indicator = document.createElement("span");
      indicator.className = `indicator ${totalSlides === 0 ? "active" : ""}`;
      indicatorsContainer.appendChild(indicator);
      
      totalSlides++;
      i++;
      tryLoadSlide(); // Пробуем следующий
    };
    
    img.onerror = () => {
      // Слайд не существует - останавливаемся
      console.log(`✅ Сгенерировано ${totalSlides} слайдов`);
    };
    
    img.src = `img/slides/slide${i}.jpg`;
  }
  
  tryLoadSlide();
}
