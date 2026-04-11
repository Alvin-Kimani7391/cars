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
const showcart = document.getElementById("showcart");
const mycart = document.getElementById("mycart");
const mycartcontent = document.getElementById("mycart-content");
const closeMyCart = document.getElementById("closeMyCart");

// Modals
const orderModal = document.getElementById("orderFormModal");
const closeOrderForm = document.getElementById("closeOrderForm");
const hotsearches = document.getElementById("hotsearches");
const closehotsearches = document.getElementById("closehotsearches");

// === EVENT LISTENERS FOR POPUPS ===
closehotsearches.addEventListener("click", () => hotsearches.style.display = "none");
closeOrderForm.addEventListener("click", () => orderModal.style.display = "none");

window.addEventListener("click", e => {
  if (e.target === orderModal) orderModal.style.display = "none";
  if (e.target === hotsearches) hotsearches.style.display = "none";
  if (e.target === mycart) mycart.style.display = "none";
  if (e.target === popup) popup.style.display = "none";
});

// === GLOBAL VARIABLES ===
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let cars = [];
let currentPage = 1;
let showNewOnly = false;
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
function sendOrderToSeller() {
  document.getElementById("orderFormModal").style.display = "flex";
}

document.getElementById("orderForm").addEventListener("submit", function (e) {
  e.preventDefault();

  cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const buyerName = document.getElementById("buyerName").value.trim();
  const buyerEmail = document.getElementById("buyerEmail").value.trim();
  const buyerPhone = document.getElementById("buyerPhone").value.trim();
  const buyerAddress = document.getElementById("buyerAddress").value.trim();

  let message = `🛍️ *New Order from ${buyerName}*\n\n`;
  message += `📞 Phone: ${buyerPhone}\n📧 Email: ${buyerEmail}\n🏠 Address: ${buyerAddress}\n\n`;
  message += `🧾 *Order Details:*\n`;

  let total = 0;
  cart.forEach((item, i) => {
    message += `${i + 1}. ${item.make} ${item.model} - *Ksh.${item.price.toLocaleString()}*\n`;
    total += item.price;
  });

  message += `\n-------------------------\n💰 *Total: Ksh.${total.toLocaleString()}*\n\nPlease confirm my order. ✅`;

  const sellerPhone = "254794327798";
  const whatsappURL = `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`;
  window.open(whatsappURL, "_blank");

  localStorage.removeItem("cart");
  displaycart();
  updateshowcart();
  orderModal.style.display = "none";
});

// ===============================
// CART MANAGEMENT
// ===============================
showcart.addEventListener("click", () => {
  displaymycart();
  mycart.style.display = "flex";
});

closeMyCart.addEventListener("click", () => (mycart.style.display = "none"));
closePopup.addEventListener("click", () => (popup.style.display = "none"));

function addToCart(id) {
  const car = cars.find(c => c.id === id);
  if (!car) return;

  if (cart.some(item => item.id === car.id)) {
    alert(`${car.make} ${car.model} is already in your cart.`);
    return;
  }

  cart.push(car);
  localStorage.setItem("cart", JSON.stringify(cart));
  displaycart();
  updateshowcart();
  alert(`${car.make} ${car.model} added to cart successfully!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displaycart();
  displaymycart();
  updateshowcart();
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
function displaymycart() {
  const cartbox = document.getElementById("cartbox");

  mycartcontent.innerHTML = "";

  let itemCount = 0;
  let total = 0;

  cart.forEach((item, index) => {
    itemCount++;
    total += item.price; // ✅ FIX: calculate total

    const imgSrc = Array.isArray(item.image) ? item.image[0] : item.image;

    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <div class="mycart-item-info">
        <img src="${imgSrc}" style="width:50px;height:auto;">
        <h3>${item.make} ${item.model}</h3>
        <p><strong>Price: Ksh.${item.price.toLocaleString()}</strong></p>
        <button class="removebtn" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;

    mycartcontent.appendChild(div);
  });

  // ✅ Cart count
  if (cartbox) {
    cartbox.classList.add("cartboxx");
    cartbox.innerHTML = `MY CART: ${itemCount}`;
  }

  // ✅ Summary (FIXED CONTAINER)
  if (cart.length > 0) {
    const summary = document.createElement("div");
    summary.classList.add("cart-summary2");

    summary.innerHTML = `
      <h3>SubTotal: Ksh.${total.toLocaleString()}</h3>
      
    `;

    mycartcontent.appendChild(summary); // ✅ FIX HERE

     setTimeout(() => {
      const sendOrderBtn = document.getElementById("send-order-btn");
      if (sendOrderBtn) sendOrderBtn.addEventListener("click", sendOrderToSeller);
    }, 10);

  } else {
    cartcontainer.innerHTML = `<p class="empty">Your cart is empty.</p>`;
  }

  carttotal.textContent = `Total: Ksh.${total.toLocaleString()}`;
}

// ===============================
// UPDATE CART ICON
// ===============================
function updateshowcart() {
  showcart.innerHTML = `
    <a><i class="fa-solid fa-cart-shopping fa-lg" style="color: #f9f9ff;"></i> ${cart.length}</a>
  `;
}

// ===============================
// DISPLAY CART
// ===============================
function displaycart() {
  cartcontainer.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const imgSrc = Array.isArray(item.image) ? item.image[0] : item.image;
    total += item.price;

    const div = document.createElement("div");
    div.classList.add("cart-item");

    div.innerHTML = `
      <div class="cart-item-info">
        <img src="${imgSrc}" style="width:50px;height:auto;">
        <h3>${item.make} ${item.model}</h3>
        <p><strong>Price: Ksh.${item.price.toLocaleString()}</strong></p>
        <button class="removebtn" onclick="removeFromCart(${index})">Remove</button>
      </div>
    `;

    cartcontainer.appendChild(div);
  });

  if (cart.length > 0) {
    const summary = document.createElement("div");
    summary.classList.add("cart-summary");

    summary.innerHTML = `
      <h3>Total: Ksh.${total.toLocaleString()}</h3>
      <button class="paybtn" id="send-order-btn">Send Order to Seller</button>
    `;

    cartcontainer.appendChild(summary);

    setTimeout(() => {
      const sendOrderBtn = document.getElementById("send-order-btn");
      if (sendOrderBtn) sendOrderBtn.addEventListener("click", sendOrderToSeller);
    }, 10);

  } else {
    cartcontainer.innerHTML = `<p class="empty">Your cart is empty.</p>`;
  }

  carttotal.textContent = `Total: Ksh.${total.toLocaleString()}`;
}

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

  return diffDays <= 7; // change days if you want
}

// ===============================
// MAIN
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  function displaycars(filter = "", category = "all") {
    carscontainer.innerHTML = "";

    const filteredCars = cars.filter(car => {
  const namematch = (`${car.make} ${car.model}`).toLowerCase().includes(filter.toLowerCase());
  const categorymatch = category === "all" || car.category === category;

  let newMatch = true;

  if (showNewOnly) {
    newMatch = isNewProduct(car); // ✅ SAFE check
  }

  return namematch && categorymatch && newMatch;
});

    const totalPages = Math.ceil(filteredCars.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const carsToShow = filteredCars.slice(startIndex, startIndex + productsPerPage);

    carsToShow.forEach(car => {
      const imgSrc = Array.isArray(car.image) ? car.image[0] : car.image;

      const div = document.createElement("div");
      div.classList.add("product-item");

      let oldPriceHtml = "";
      if (car.oldPrice) {
        oldPriceHtml = `<p class="old-price"><strong>Was: Ksh.${car.oldPrice.toLocaleString()}</strong></p>`;
      }

      div.innerHTML = `
        <img src="${imgSrc}" onclick="openProduct(${car.id})">
        <div class="product-item-info">
          <h3>${car.make} ${car.model}</h3>
          <p class="price"><strong>Price: Ksh.${car.price.toLocaleString()}</strong></p>
          ${oldPriceHtml}
          <button class="addbtn" onclick="addToCart(${car.id})">Add To Cart</button>
        </div>
      `;

      carscontainer.appendChild(div);
    });

    renderPagination(totalPages);
    updateshowcart();
  }



const newBtn = document.getElementById("newProductsBtn");

if (newBtn) {
  newBtn.addEventListener("click", () => {
    showNewOnly = !showNewOnly;
    currentPage = 1;

    // ✅ Remove active state from categories
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));

    newBtn.textContent = showNewOnly ? "Show All Products" : "New Arrivals";

    displaycars(
      document.getElementById("searchbar").value.trim().toLowerCase(),
      "all" // ✅ IGNORE category
    );
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
        document.querySelector(".filter-btn.active")?.dataset.category || "all"
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

  searchbar.addEventListener("focus", () => (hotsearches.style.display = "flex"));
  searchbar.addEventListener("blur", () => setTimeout(() => hotsearches.style.display = "none", 150));

  searchbar.addEventListener("keyup", e => {
    const text = e.target.value.trim().toLowerCase();
    displaycars(text, document.querySelector(".filter-btn.active")?.dataset.category || "all");
  });

  document.addEventListener("click", e => {
  if (e.target.classList.contains("filter-btn")) {

    // ✅ TURN OFF new mode when category is clicked
    showNewOnly = false;

    // ✅ Reset New button text
    const newBtn = document.getElementById("newProductsBtn");
    if (newBtn) newBtn.textContent = "New Arrivals";

    const category = e.target.getAttribute("data-category");

    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    e.target.classList.add("active");

    displaycars(
      document.getElementById("searchbar").value.trim().toLowerCase(),
      category
    );

    hotsearches.style.display = "none";
  }
});

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
    popup.style.display = "flex";
  });

  window.addEventListener("pageshow", () => {
    cart = JSON.parse(localStorage.getItem("cart")) || [];
    updateshowcart();
    displaycart();
    displaymycart();
  });


  const footer = document.getElementById("footer");

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + window.innerHeight;
  const footerTop = footer.offsetTop;

  if(scrollY >= footerTop) {
    showcartbtn.classList.add('hidden'); // hide button
  } else {
    showcartbtn.classList.remove('hidden'); // show button
  }
});


  // ===============================
  // LOAD DATA (BACKEND FIRST, JSON FALLBACK)
  // ===============================
  fetch(API_URL + "/api/cars")
    .then(res => res.json())
    .then(data => {
      cars = shufflearray(data);
      displaycars();
    })
    .catch(() => {
      fetch("cars.json")
        .then(res => res.json())
        .then(data => {
          cars = shufflearray(data);
          displaycars();
        });
    });

});