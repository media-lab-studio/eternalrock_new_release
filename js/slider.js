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
  
  function loadNextSlide() {
    const img = new Image();
    img.onload = () => {
      // Создаем слайд
      const slideDiv = document.createElement("div");
      slideDiv.className = `slide ${i === 1 ? "active" : ""}`;
      img.alt = altTexts[i] || "Audience";
      img.loading = "lazy";
      slideDiv.appendChild(img);
      slidesContainer.appendChild(slideDiv);

      // Создаем индикатор для каждого слайда
      const indicator = document.createElement("span");
      indicator.className = `indicator ${i === 1 ? "active" : ""}`;
      indicatorsContainer.appendChild(indicator);
      
      totalSlides = i;
      i++;
      loadNextSlide(); // Загружаем следующий
    };
    
    img.onerror = () => {
      console.log(`✅ Сгенерировано ${totalSlides} слайдов`);
    };
    
    img.src = `img/slides/slide${i}.jpg`;
  }
  
  loadNextSlide();
}
