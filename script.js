const products = [
  {
    id: 1,
    name: "Ivory Morning",
    details: "White roses, lisianthus, eucalyptus",
    price: 72,
    color: "linear-gradient(135deg, #f6d9c4, #eddad0)"
  },
  {
    id: 2,
    name: "Scarlet Grace",
    details: "Red roses, hypericum, ruscus",
    price: 64,
    color: "linear-gradient(135deg, #c85d57, #e9b8a7)"
  },
  {
    id: 3,
    name: "Sunlit Meadow",
    details: "Gerberas, chrysanthemums, alstroemeria",
    price: 58,
    color: "linear-gradient(135deg, #f3b765, #f7dfb6)"
  },
  {
    id: 4,
    name: "Blush Whisper",
    details: "Peonies, spray roses, waxflower",
    price: 79,
    color: "linear-gradient(135deg, #e79892, #f4d8d3)"
  },
  {
    id: 5,
    name: "Garden Tide",
    details: "Hydrangea, carnations, fern",
    price: 61,
    color: "linear-gradient(135deg, #96b8a1, #d8e9de)"
  },
  {
    id: 6,
    name: "Golden Hour",
    details: "Sunflowers, roses, statice",
    price: 68,
    color: "linear-gradient(135deg, #f7c66c, #ffe6b3)"
  },
  {
    id: 7,
    name: "Berry Dusk",
    details: "Purple asters, roses, eucalyptus",
    price: 66,
    color: "linear-gradient(135deg, #8a6f94, #d6c2db)"
  },
  {
    id: 8,
    name: "Pure Celebration",
    details: "Lilies, roses, baby breath",
    price: 74,
    color: "linear-gradient(135deg, #ebebeb, #f7f7f7)"
  }
];

const productGrid = document.querySelector("#bouquetGrid");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const cartItems = document.querySelector("#cartItems");
const cartPanel = document.querySelector("#cartPanel");
const overlay = document.querySelector("#overlay");
const cartButton = document.querySelector("#cartButton");
const closeCart = document.querySelector("#closeCart");
const checkoutBtn = document.querySelector("#checkoutBtn");
const checkoutDialog = document.querySelector("#checkoutDialog");
const cancelCheckout = document.querySelector("#cancelCheckout");
const checkoutForm = document.querySelector("#checkoutForm");
const checkoutAmount = document.querySelector("#checkoutAmount");
const placeOrderBtn = document.querySelector("#placeOrderBtn");
const toast = document.querySelector("#toast");
const bestSellerButton = document.querySelector("#scrollToBestSeller");
const paymentMethodRadios = document.querySelectorAll('input[name="paymentMethod"]');
const paymentSections = document.querySelectorAll("[data-payment]");
const cardNumberInput = document.querySelector("#cardNumber");
const cardExpiryInput = document.querySelector("#cardExpiry");
const cardCvvInput = document.querySelector("#cardCvv");
const upiIdInput = document.querySelector("#upiId");
const bankNameInput = document.querySelector("#bankName");

let cart = JSON.parse(localStorage.getItem("bloom-cart") || "[]");

const money = (value) => `$${value.toFixed(2)}`;

function saveCart() {
  localStorage.setItem("bloom-cart", JSON.stringify(cart));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove("show"), 1700);
}

function openCart() {
  cartPanel.classList.add("open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

function closeCartPanel() {
  cartPanel.classList.remove("open");
  cartPanel.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

function updateCartUI() {
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.qty * item.price, 0);

  cartCount.textContent = String(totalQty);
  cartTotal.textContent = money(totalPrice);
  checkoutAmount.textContent = money(totalPrice);

  if (!cart.length) {
    cartItems.innerHTML = "<p>Your cart is empty. Add a bouquet to continue.</p>";
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;

  cartItems.innerHTML = cart
    .map(
      (item) => `
      <article class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div>${money(item.price)}</div>
        </div>
        <div class="qty-row">
          <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
          <span>${item.qty}</span>
          <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
        </div>
      </article>`
    )
    .join("");
}

function getSelectedPaymentMethod() {
  const selected = document.querySelector('input[name="paymentMethod"]:checked');
  return selected ? selected.value : "card";
}

function setRequiredFields(method) {
  cardNumberInput.required = method === "card";
  cardExpiryInput.required = method === "card";
  cardCvvInput.required = method === "card";
  upiIdInput.required = method === "upi";
  bankNameInput.required = method === "netbanking";

  if (method === "card") {
    cardNumberInput.pattern = "[0-9 ]{19}";
    cardExpiryInput.pattern = "(0[1-9]|1[0-2])/[0-9]{2}";
    cardCvvInput.pattern = "[0-9]{3,4}";
  } else {
    cardNumberInput.removeAttribute("pattern");
    cardExpiryInput.removeAttribute("pattern");
    cardCvvInput.removeAttribute("pattern");
  }

  if (method === "upi") {
    upiIdInput.pattern = "[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}";
  } else {
    upiIdInput.removeAttribute("pattern");
  }
}

function updatePaymentUI() {
  const method = getSelectedPaymentMethod();

  paymentSections.forEach((section) => {
    section.hidden = section.dataset.payment !== method;
  });

  setRequiredFields(method);
}

function normalizeCheckoutInputs() {
  const cardDigits = cardNumberInput.value.replace(/\D/g, "").slice(0, 16);
  cardNumberInput.value = cardDigits.replace(/(\d{4})(?=\d)/g, "$1 ");

  const expiryDigits = cardExpiryInput.value.replace(/\D/g, "").slice(0, 4);
  cardExpiryInput.value =
    expiryDigits.length > 2
      ? `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`
      : expiryDigits;

  cardCvvInput.value = cardCvvInput.value.replace(/\D/g, "").slice(0, 4);
  upiIdInput.value = upiIdInput.value.trim().toLowerCase();
}

function simulateOrderPlacement(method) {
  placeOrderBtn.disabled = true;
  placeOrderBtn.textContent = "Processing...";

  window.setTimeout(() => {
    cart = [];
    saveCart();
    updateCartUI();
    checkoutDialog.close();
    closeCartPanel();
    checkoutForm.reset();
    updatePaymentUI();
    placeOrderBtn.disabled = false;
    placeOrderBtn.textContent = "Place Order";

    const paymentLabelMap = {
      card: "Card",
      upi: "UPI",
      netbanking: "Net Banking",
      cod: "Cash on Delivery"
    };

    showToast(`Order placed with ${paymentLabelMap[method]}. Thank you!`);
  }, 700);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart`);
}

function updateQuantity(productId, action) {
  const product = cart.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  if (action === "increase") {
    product.qty += 1;
  }

  if (action === "decrease") {
    product.qty -= 1;
    if (product.qty <= 0) {
      cart = cart.filter((item) => item.id !== productId);
    }
  }

  saveCart();
  updateCartUI();
}

function renderProducts() {
  productGrid.innerHTML = products
    .map(
      (product) => `
      <article class="product-card section-reveal" data-id="${product.id}">
        <div class="product-thumb" style="background:${product.color}"></div>
        <div class="product-body">
          <div class="product-row">
            <h3>${product.name}</h3>
            <span class="price">${money(product.price)}</span>
          </div>
          <p class="product-meta">${product.details}</p>
          <button class="btn btn-primary btn-full add-to-cart" type="button" data-id="${product.id}">Add to cart</button>
        </div>
      </article>`
    )
    .join("");
}

function setupScrollReveal() {
  const items = document.querySelectorAll(".section-reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((item) => io.observe(item));
}

function buttonRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement("span");
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);

  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
  ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
  ripple.style.position = "absolute";
  ripple.style.background = "rgba(255,255,255,0.38)";
  ripple.style.borderRadius = "50%";
  ripple.style.transform = "scale(0)";
  ripple.style.pointerEvents = "none";
  ripple.style.animation = "ripple 600ms ease-out";

  button.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

function setupEvents() {
  cartButton.addEventListener("click", openCart);
  closeCart.addEventListener("click", closeCartPanel);
  overlay.addEventListener("click", closeCartPanel);

  productGrid.addEventListener("click", (event) => {
    const addBtn = event.target.closest(".add-to-cart");
    if (!addBtn) {
      return;
    }
    const id = Number(addBtn.dataset.id);
    addToCart(id);
    if (!cartPanel.classList.contains("open")) {
      openCart();
    }
  });

  cartItems.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }
    const id = Number(button.dataset.id);
    const action = button.dataset.action;
    updateQuantity(id, action);
  });

  checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
      showToast("Your cart is empty");
      return;
    }
    checkoutAmount.textContent = money(cart.reduce((sum, item) => sum + item.qty * item.price, 0));
    updatePaymentUI();
    checkoutDialog.showModal();
  });

  cancelCheckout.addEventListener("click", () => checkoutDialog.close());

  checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    normalizeCheckoutInputs();
    updatePaymentUI();

    if (!checkoutForm.checkValidity()) {
      checkoutForm.reportValidity();
      return;
    }

    simulateOrderPlacement(getSelectedPaymentMethod());
  });

  paymentMethodRadios.forEach((radio) => {
    radio.addEventListener("change", updatePaymentUI);
  });

  cardNumberInput.addEventListener("input", normalizeCheckoutInputs);
  cardExpiryInput.addEventListener("input", normalizeCheckoutInputs);
  cardCvvInput.addEventListener("input", normalizeCheckoutInputs);

  bestSellerButton.addEventListener("click", () => {
    document.querySelector("#shop").scrollIntoView({ behavior: "smooth", block: "start" });
    const bestSeller = document.querySelector('.product-card[data-id="4"]');
    if (bestSeller) {
      bestSeller.animate(
        [
          { transform: "translateY(0)", boxShadow: "0 0 0 rgba(0,0,0,0)" },
          { transform: "translateY(-6px)", boxShadow: "0 14px 30px rgba(31,35,33,0.16)" },
          { transform: "translateY(0)", boxShadow: "0 0 0 rgba(0,0,0,0)" }
        ],
        { duration: 750, easing: "ease-out", delay: 500 }
      );
    }
  });

  document.querySelectorAll(".btn").forEach((button) => {
    button.addEventListener("click", buttonRipple);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartPanel.classList.contains("open")) {
      closeCartPanel();
    }
  });
}

function injectDynamicKeyframes() {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes ripple {
      to {
        transform: scale(2.4);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

function init() {
  renderProducts();
  updateCartUI();
  updatePaymentUI();
  setupEvents();
  setupScrollReveal();
  injectDynamicKeyframes();
}

init();
