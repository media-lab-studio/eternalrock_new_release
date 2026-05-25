// Функция для генерации слайдов и индикаторов
function generateSlides() {
  const slidesContainer = document.getElementById("slidesTrack");
  const indicatorsContainer = document.getElementById("sliderIndicators");

  if (!slidesContainer) return;

  // Очищаем контейнеры
  slidesContainer.innerHTML = "";
  indicatorsContainer.innerHTML = "";

  const altTexts = {
    1: "Rock Concert",
    2: "Guitar Player", 
    3: "Band Performance",
    4: "Stage Show",
  };

  let i = 1;
  let totalSlides = 0;
  let stop = false;
  
  function loadNextSlide() {
    if (stop) return;
    
    const img = new Image();
    img.onload = () => {
      if (stop) return;
      
      // Создаем слайд
      const slideDiv = document.createElement("div");
      slideDiv.className = `slide ${totalSlides === 0 ? "active" : ""}`;
      
      img.alt = altTexts[i] || "Audience";
      img.loading = "lazy";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "cover";
      
      slideDiv.appendChild(img);
      slidesContainer.appendChild(slideDiv);
      
      // Создаем индикатор
      const indicator = document.createElement("span");
      indicator.className = `indicator ${totalSlides === 0 ? "active" : ""}`;
      indicatorsContainer.appendChild(indicator);
      
      totalSlides++;
      i++;
      loadNextSlide();
    };
    
    img.onerror = () => {
      stop = true;
      console.log(`✅ Сгенерировано ${totalSlides} слайдов`);
      
      // Если нет слайдов - показываем заглушку
      if (totalSlides === 0) {
        const slideDiv = document.createElement("div");
        slideDiv.className = "slide active";
        slideDiv.innerHTML = '<div style="background:#1a1a2e; display:flex; align-items:center; justify-content:center; height:100%; color:white;">Нет изображений</div>';
        slidesContainer.appendChild(slideDiv);
      }
    };
    
    img.src = `img/slides/slide${i}.jpg`;
  }
  
  loadNextSlide();
}
