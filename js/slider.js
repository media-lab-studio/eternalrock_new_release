// Функция для генерации слайдов и индикаторов
function generateSlides() {
  const slidesContainer = document.getElementById("slidesTrack");
  const indicatorsContainer = document.getElementById("sliderIndicators");

  if (!slidesContainer) return;

  slidesContainer.innerHTML = "";
  indicatorsContainer.innerHTML = "";

  const altTexts = {
    1: "Rock Concert",
    2: "Guitar Player",
    3: "Band Performance", 
    4: "Stage Show",
  };

  const totalSlides = 8; // Ваши 8 слайдов

  for (let i = 1; i <= totalSlides; i++) {
    const slideDiv = document.createElement("div");
    slideDiv.className = `slide ${i === 1 ? "active" : ""}`;
    
    const img = document.createElement("img");
    img.src = `img/slides/slide${i}.jpg`;
    img.alt = altTexts[i] || "Audience";
    img.loading = "lazy";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    
    slideDiv.appendChild(img);
    slidesContainer.appendChild(slideDiv);
    
    const indicator = document.createElement("span");
    indicator.className = `indicator ${i === 1 ? "active" : ""}`;
    indicatorsContainer.appendChild(indicator);
  }

  console.log(`✅ Сгенерировано ${totalSlides} слайдов`);
}
