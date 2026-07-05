// Debug timers (optional)
setInterval(() => console.log("Hi this runs after 1 second"), 1000);
setTimeout(() => console.log("This runs once"), 1000);

// ===============================
// BACKEND CONFIG
// ===============================
const API_URL = "https://cars3-158h.onrender.com"; // CHANGE THIS

// === DOM ELEMENTS ===

const carscontainer = document.getElementById("product");
const cartcontainer = document.getElementById("cart-content");
const carttotal = document.getElementById("cart-total");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");
const showcart = document.getElementById("showcartbtn");
const mycart = document.getElementById("mycart");
const mycartcontent = document.getElementById("mycart-content");
const closeMyCart = document.getElementById("closeMyCart");
const newArrivalsContainer = document.getElementById("new-arrivals");
const hotDealsContainer = document.getElementById("hot-deals");
const someProductsContainer = document.getElementById("someproduct");






window.addEventListener("click", e => {
 
  if (e.target === mycart) mycart.style.display = "none";
  if (e.target === popup) popup.style.display = "none";
});

// === GLOBAL VARIABLES ===
let currentCategory = "all";
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cars = [];
let currentPage = 1;
//let showNewOnly = false;
let showHotDealsOnly = false;
const productsPerPage = 26;

// ===============================
// SHUFFLE
// ===============================
function shufflearray(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
  return array;
}

// ===============================
// ORDER FORM (UNCHANGED)
// ===============================



// ===============================
// CART MANAGEMENT
// ===============================
showcart.addEventListener("click", () => {
  displaymycart();
  
  mycart.style.display = "none";
  window.location.href = "pay.html";
});


function updateCartUI() {
  updateshowcart();
  
}


function addToCart(id) {
  const car = cars.find(c => c.id === id);
  if (!car) return;

  if (cart.some(item => item.id === car.id)) {
    alert(`${car.make} ${car.model} is already in your cart.`);
    return;
  }

  cart.push(car);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  alert(`${car.make} ${car.model} added to cart successfully!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
}

function checkout(method, total) {
  if (total === 0) {
    alert("Your cart is empty.");
    return;
  }
  if (method === "mpesa") {
    alert(`Initiating M-Pesa payment of Ksh.${total.toLocaleString()}.`);
  } else if (method === "card") {
    alert(`Redirecting to card payment gateway for Ksh.${total.toLocaleString()}.`);
  }
}

// ===============================
// DISPLAY MINI CART
// ===============================


// ===============================
// UPDATE CART ICON
// ===============================
function updateshowcart() {
  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = cart.length;
}

// ===============================
// DISPLAY CART
// ===============================

// ===============================
// PRODUCT PAGE (FIXED FOR VERCEL + BACKEND)
// ===============================
function openProduct(id) {
  window.location.href = `carstv.html?id=${id}`;
}

// ===============================
// MENU TOGGLE (UNCHANGED)
// ===============================
function togglemenu(){
  const btn  = document.getElementById("button");
  const list = document.getElementById("list");
  btn.classList.toggle("open");
  list.classList.toggle("show");
}

document.addEventListener("click", function(e) {
  const menu   = document.getElementById("list");
  const button = document.getElementById("button");
  const clickoutside = !menu.contains(e.target) && e.target !== button;

  if (menu.classList.contains("show") && clickoutside) {
    menu.classList.remove("show");
    button.classList.remove("open");
  }
});


function isNewProduct(car) {
  if (!car.createdAt) return false;

  const created = new Date(car.createdAt);

  // Check if date is valid
  if (isNaN(created.getTime())) return false;

  const now = new Date();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);

  return diffDays <= 14; // change days if you want
}

// ===============================
// MAIN
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  

updateCartUI();
 syncActiveFilterButton(); // 👈 add this

  function displaycars(filter = "", category = "all") {
    carscontainer.innerHTML = "";

    const filteredCars = cars.filter(car => {
  const namematch = (`${car.make} ${car.model}`).toLowerCase().includes(filter.toLowerCase());
  const categorymatch = category === "all" || car.category === category;

  let newMatch = true;
  let hotMatch = true;

  
  return namematch && categorymatch && newMatch;
});

    const totalPages = Math.ceil(filteredCars.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const carsToShow = filteredCars.slice(startIndex, startIndex + productsPerPage);

    carsToShow.forEach(car => {
      const imgSrc = Array.isArray(car.image) ? car.image[0] : car.image;

      const discount = car.oldPrice
      ? Math.round(((car.oldPrice - car.price) / car.oldPrice) * 100)
      : 0;

    const stockPercent = Math.floor(Math.random() * 80) + 20;


      const div = document.createElement("div");
      div.classList.add("product-item");

      let oldPriceHtml = "";
      if (car.oldPrice) {
        oldPriceHtml = `<p class="old-price"><strong>Was: Ksh.${car.oldPrice.toLocaleString()}</strong></p>`;
      }

      div.innerHTML = `
      ${discount ? `<div class="discount">-${discount}%</div>` : ""}
        <img src="${imgSrc}" onclick="openProduct(${car.id})">
        <div class="product-item-info">
          <h3>${car.make} ${car.model}</h3>
          <p class="price"><strong>Price: Ksh.${car.price.toLocaleString()}</strong></p>
          ${oldPriceHtml}

           <div class="stock-bar">
        <div class="stock-fill" style="width:${stockPercent}%"></div>
      </div>

      <small>${Math.floor(Math.random()*40)+5} items left</small>

          <button class="addbtn" onclick="addToCart(${car.id})">Add To Cart</button>
        </div>
      `;

      carscontainer.appendChild(div);
    });

    renderPagination(totalPages);
    updateshowcart();
  }




function renderAllCars() {
  currentCategory = getCategoryFromURL();
  displaycars("", currentCategory);
}  
  


function getCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "all";
}



function showSuggestions(query) {
  const box = document.getElementById("suggestions-box");
  const q = query.trim().toLowerCase();

  if (!q) { box.style.display = "none"; return; }

  const filtered = cars.filter(car =>
    `${car.make} ${car.model}`.toLowerCase().includes(q)
  );

  if (!filtered.length) {
    box.innerHTML = `<div class="sug-empty"><strong>No products found</strong>Try a different keyword</div>`;
    box.style.display = "block";
    return;
  }

  function highlight(text) {
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
    return text.replace(re, '<em>$1</em>');
  }

  const items = filtered.slice(0, 6).map((car, i) => {
    const imgSrc = Array.isArray(car.image) ? car.image[0] : car.image;
    const disc = car.oldPrice ? Math.round(((car.oldPrice - car.price) / car.oldPrice) * 100) : 0;
    const badge = disc
      ? `<span class="sug-badge">-${disc}%</span>`
      : `<span class="sug-badge">${car.category || ''}</span>`;
    return `
      <div class="sug-item" data-id="${car.id}">
        <img class="sug-thumb" src="${imgSrc}" alt=""
          onerror="this.style.opacity='0'">
        <div class="sug-info">
          <p class="sug-name">${highlight(`${car.make} ${car.model}`)}</p>
          <div class="sug-meta">
            <span class="sug-price">KSh ${car.price.toLocaleString()}</span>
            ${badge}
          </div>
        </div>
        <i class="fa-solid fa-chevron-right sug-chevron"></i>
      </div>`;
  }).join("");

  box.innerHTML = `
    <div class="sug-header-bar">
      <span>${filtered.length} result${filtered.length !== 1 ? 's' : ''}</span>
      <button onclick="document.getElementById('searchbar').value=''; document.getElementById('suggestions-box').style.display='none';">Clear</button>
    </div>
    ${items}
    <div class="sug-footer-row" id="sug-see-all">
      <i class="fa-solid fa-magnifying-glass"></i>
      <span>See all results for "<b>${query.trim()}</b>"</span>
    </div>`;

  box.style.display = "block";

  box.querySelectorAll(".sug-item").forEach(el => {
    el.addEventListener("click", () => {
      window.location.href = `carstv.html?id=${el.dataset.id}`;
    });
  });

  document.getElementById("sug-see-all").addEventListener("click", () => {
    window.location.href = `product.html?search=${encodeURIComponent(query.trim())}`;
  });
}

document.addEventListener("click", e => {
  const box = document.getElementById("suggestions-box");
  const bar = document.getElementById("searchbar");
  if (!box.contains(e.target) && e.target !== bar) {
    box.style.display = "none";
  }
});
  

function syncActiveFilterButton() {
  const category = getCategoryFromURL(); // "all" if none in URL
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.category === category);
  });
}

  function renderPagination(totalPages) {
  const pagination = document.getElementById("pagination");
  if (!pagination) return;

  pagination.innerHTML = "";
  if (totalPages <= 1) return;

  const createButton = (text, page, className = "") => {
    const btn = document.createElement("button");
    btn.textContent = text;

    if (className) btn.classList.add(className);
    if (page === currentPage) btn.classList.add("active");

   btn.addEventListener("click", () => {
  currentPage = page;

  displaycars(
    document.getElementById("searchbar").value.trim().toLowerCase(),
    currentCategory
  );

  renderPagination(totalPages);

  document.getElementById("product")
    .scrollIntoView({ behavior: "smooth" });
});

    return btn;
  };

  // ⬅ PREVIOUS
  if (currentPage > 1) {
    pagination.appendChild(createButton("←", currentPage - 1, "nav"));
  }

  const maxVisible = 5;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + maxVisible - 1);

  // START DOTS
  if (start > 1) {
    pagination.appendChild(createButton(1, 1));

    if (start > 2) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      pagination.appendChild(dots);
    }
  }

  // MAIN NUMBERS
  for (let i = start; i <= end; i++) {
    pagination.appendChild(createButton(i, i));
  }

  // END DOTS
  if (end < totalPages) {
    if (end < totalPages - 1) {
      const dots = document.createElement("span");
      dots.textContent = "...";
      pagination.appendChild(dots);
    }

    pagination.appendChild(createButton(totalPages, totalPages));
  }

  // ➡ NEXT
  if (currentPage < totalPages) {
    pagination.appendChild(createButton("→", currentPage + 1, "nav"));
  }
}

 // Dynamic year in footer
    document.getElementById("year").textContent = new Date().getFullYear();

  // SEARCH + FILTER (UNCHANGED)
  const searchbar = document.getElementById("searchbar");

  





  searchbar.addEventListener("keyup", e => {
  const text = e.target.value.trim();
  currentPage = 1; // reset to page 1 on new search, otherwise you can land on an out-of-range page
  displaycars(text.toLowerCase(), currentCategory);
  showSuggestions(text);
});

searchbar.addEventListener("focus", e => {
  if (e.target.value.trim()) showSuggestions(e.target.value.trim());
});




document.addEventListener("click", (e) => {
  
  const search = document.getElementById("searchbar");

});




document.addEventListener("click", e => {
  const btn = e.target.closest(".filter-btn"); // ✅ handles clicks on image too
  if (!btn) return;

  const category = btn.getAttribute("data-category");

  // ✅ redirect to product page with category
  window.location.href = `product.html?category=${encodeURIComponent(category)}`;
});




const hotDealsBtn = document.getElementById("hotDealsBtn");






  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("hot-item")) {
      const searchName = e.target.textContent.trim().toLowerCase();

      const product = cars.find(c =>
        `${c.make} ${c.model}`.toLowerCase() === searchName ||
        c.make.toLowerCase() === searchName
      );

      if (product) {
        window.location.href = `carstv.html?id=${product.id}`;
      } else {
        alert("Product not found in database!");
      }
    }
  });

  const showcartbtn = document.getElementById("show-cart-btn");

  showcartbtn.addEventListener("click", () => {
    displaycart();
    popup.style.display = "none";
    window.location.href = "pay.html";// add hash to URL
  });

  window.addEventListener("pageshow", () => {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateshowcart();
    
  });

const footer = document.getElementById("footer");

const whatsappBtn = document.getElementById("whatsappBtn");
const whatsappBtn2 = document.getElementById("whatsappBtn2");

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + window.innerHeight;
  const footerTop = footer.offsetTop;

  if(scrollY >= footerTop) {
    showcartbtn.classList.add('hidden');
    whatsappBtn.classList.add('hidden');
    whatsappBtn2.classList.add('hidden'); // 👈 ADD THIS
  } else {
    showcartbtn.classList.remove('hidden');
    whatsappBtn.classList.remove('hidden'); // 👈 ADD THIS
    whatsappBtn2.classList.remove('hidden'); // 👈 ADD THIS
  }
});

  
  

// ===============================
// GLOBAL STATE
// ===============================
let carsLoadedFromBackend = false;

// ===============================
// CENTRAL RENDER FUNCTION
// ===============================


// ===============================
// 1. FAST LOAD (LOCAL JSON FIRST)
// ===============================
fetch("cars.json")
  .then(res => res.json())
  .then(data => {
    cars = shufflearray(data);
    renderAllCars(); // 🔥 instant UI (fast)

    // mark as local render
    carsLoadedFromBackend = false;
  })
  .catch(err => {
    console.log("Local JSON failed:", err);
  });

// ===============================
// 2. BACKEND UPGRADE (REPLACE DATA IF AVAILABLE)
// ===============================
fetch(API_URL + "/api/cars")
  .then(res => {
    if (!res.ok) throw new Error("Backend not ready");
    return res.json();
  })
  .then(data => {
    if (!Array.isArray(data)) return;

    cars = shufflearray(data);
    carsLoadedFromBackend = true;

    renderAllCars(); // 🔄 refresh UI with fresh backend data
  })
  .catch(err => {
    console.log("Backend not available, using local only");
  });
  });