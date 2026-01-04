// ---------- Utilities ----------
const storage = {
  get(key, fallback) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

// ---------- Theme (light/dark) ----------
(function initTheme() {
  const saved = storage.get('theme', 'light');
  if (saved === 'dark') document.body.classList.add('dark');
  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
      storage.set('theme', mode);
    });
  }
})();

// ---------- Greeting + date on homepage ----------
(function initGreeting() {
  const el = document.getElementById('greeting');
  if (!el) return;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  el.textContent = `${greeting}, today is ${new Date().toDateString()}`;
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();

// ---------- Cart (persistent across pages) ----------
const cart = storage.get('cart', []);

function saveCart() { storage.set('cart', cart); }

function renderCartCount() {
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function addToCart(name, price) {
  const existing = cart.find(i => i.name === name);
  if (existing) existing.qty += 1;
  else cart.push({ name, price: Number(price), qty: 1 });
  saveCart();
  renderCartCount();
}

function removeFromCart(name) {
  const idx = cart.findIndex(i => i.name === name);
  if (idx > -1) cart.splice(idx, 1);
  saveCart();
  renderCartCount();
  renderCartPage();
}

function changeQty(name, delta) {
  const item = cart.find(i => i.name === name);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(name);
  else { saveCart(); renderCartCount(); renderCartPage(); }
}

function renderCartPage() {
  const list = document.getElementById('cartItems');
  const totalEl = document.getElementById('cartTotal');
  if (!list || !totalEl) return;
  list.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${item.name}</span>
      <span>$${(item.price * item.qty).toFixed(2)}</span>
      <span>
        <button aria-label="Decrease quantity">-</button>
        <strong>${item.qty}</strong>
        <button aria-label="Increase quantity">+</button>
        <button aria-label="Remove item">Remove</button>
      </span>
    `;
    const [decBtn, , incBtn, removeBtn] = li.querySelectorAll('button');
    decBtn.addEventListener('click', () => changeQty(item.name, -1));
    incBtn.addEventListener('click', () => changeQty(item.name, +1));
    removeBtn.addEventListener('click', () => removeFromCart(item.name));
    list.appendChild(li);
  });
  totalEl.textContent = total.toFixed(2);
}

// Bind product buttons
(function bindProductButtons() {
  document.querySelectorAll('button[data-name][data-price]').forEach(btn => {
    btn.addEventListener('click', () => addToCart(btn.dataset.name, btn.dataset.price));
  });
})();

// Initial render
renderCartCount();
renderCartPage();

// ---------- Contact form validation ----------
(function contactValidation() {
  const form = document.getElementById('contactForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    const email = document.getElementById('email').value.trim();
    const name = document.getElementById('name').value.trim();
    const message = document.getElementById('message').value.trim();
    const validEmail = email.includes('@') && email.indexOf('@') > 0 && email.lastIndexOf('.') > email.indexOf('@') + 1;
    if (!name || !validEmail || !message) {
      alert('Please fill all fields with a valid email.');
      e.preventDefault();
    }
  });
})();

// ---------- Checkout validation ----------
(function checkoutValidation() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const fullname = document.getElementById('fullname').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const payment = document.getElementById('payment').value;
    const validEmail = email.includes('@') && email.indexOf('@') > 0 && email.lastIndexOf('.') > email.indexOf('@') + 1;

    if (!fullname || !address || !validEmail || !payment) {
      alert('Please complete all fields with a valid email.');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }
    alert('Order placed successfully! Thank you for shopping at Elegance Wardrobe.');
    // Clear cart after successful checkout
    cart.splice(0, cart.length);
    saveCart();
    renderCartCount();
    renderCartPage();
    form.reset();
  });
})();