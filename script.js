// Global image array
let images = [];
let sortableInstance = null;

// Viewer logic (loads from images.json)
fetch("images.json")
  .then(response => response.json())
  .then(imageList => {
    const book = document.getElementById("book");
    imageList.forEach((name, index) => {
      const page = document.createElement("div");
      page.className = "page";

      const img = document.createElement("img");
      img.src = `images/${name}`;
      img.onerror = () => {
        img.src = "images/placeholder.png"; // Optional fallback image
      };

      page.appendChild(img);
      book.appendChild(page);
    });

    $("#book").turn({
      width: 800,
      height: 500,
      autoCenter: true,
      direction: "rtl",
      when: {
        turning: function(event, page, view) {
          let audio = new Audio("sounds/page-flip.mp3");
          audio.play();
        }
      }
    });

    document.getElementById("loading")?.style.display = "none";
    book.style.display = "block";
  })
  .catch(error => {
    console.error("Error loading images.json:", error);
    const loading = document.getElementById("loading");
    if (loading) loading.textContent = "⚠️ Failed to load images.json";
  });

// Admin panel logic (only runs if admin elements exist)
function uploadImages() {
  const uploadInput = document.getElementById('upload');
  if (!uploadInput) return;

  const files = uploadInput.files;
  for (let file of files) {
    const reader = new FileReader();
    reader.onload = function(e) {
      images.push({ name: file.name, src: e.target.result });
      renderList();
    };
    reader.readAsDataURL(file);
  }
}

function renderList() {
  const list = document.getElementById('imageList');
  if (!list) return;

  list.innerHTML = '';

  images.forEach((img, index) => {
    const card = document.createElement('div');
    card.className = 'image-card';

    const image = document.createElement('img');
    image.src = img.src;

    const name = document.createElement('div');
    name.className = 'image-name';
    name.textContent = img.name;

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'Remove';
    removeBtn.onclick = function () {
      images.splice(index, 1);
      renderList();
    };

    card.appendChild(image);
    card.appendChild(name);
    card.appendChild(removeBtn);
    list.appendChild(card);
  });

  // Prevent duplicate Sortable initialization
  if (sortableInstance) sortableInstance.destroy();
  sortableInstance = Sortable.create(list, {
    animation: 150,
    onEnd: function () {
      const newOrder = [];
      const cards = list.querySelectorAll('.image-card .image-name');
      cards.forEach(card => {
        const name = card.textContent;
        const imgObj = images.find(i => i.name === name);
        if (imgObj) newOrder.push(imgObj);
      });
      images = newOrder;
    }
  });
}

function generateJson() {
  const output = document.getElementById("jsonOutput");
  if (!output) return;

  if (images.length === 0) {
    alert("No images to save.");
    return;
  }

  const filenames = images.map(img => img.name);
  const json = JSON.stringify(filenames, null, 2);
  output.value = json;
}

// Optional: Fullscreen toggle
function toggleFullscreen() {
  const elem = document.documentElement;
  if (!document.fullscreenElement) {
    elem.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}