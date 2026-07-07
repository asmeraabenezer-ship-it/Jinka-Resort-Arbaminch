// ===== Currency System Constants =====
let currentCurrency = localStorage.getItem('selectedCurrency') || 'ETB';
const EXCHANGE_RATE = 20; // 1 USD = 20 ETB

// API URL Logic
// On local: uses localhost:5000
// On production (Vercel): uses the Render-hosted backend URL
const RENDER_API_URL = 'https://jinkaresort-com.onrender.com/api';
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') 
  ? 'http://localhost:5000/api' 
  : RENDER_API_URL;


function formatPriceString(priceInEtb) {
  if (currentCurrency === 'USD') {
    const usd = Math.round(priceInEtb / EXCHANGE_RATE);
    return `$${usd} USD`;
  } else {
    return `${priceInEtb.toLocaleString()} ETB`;
  }
}

// ===== Toast Notification System =====
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';

  toast.innerHTML = `
    <div class="toast-icon"><i class="fas ${iconClass}"></i></div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  // Trigger Reflow to enable CSS transition
  toast.offsetHeight;

  // Add show class
  toast.classList.add('show');

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => {
      toast.remove();
    });
  }, 4000);
}

// ===== Navbar Scroll Effect =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== Mobile Menu Toggle =====
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.getElementById('nav-menu');

mobileMenu.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('active');
  });
});

// ===== Scroll Animations =====
const observerOptions = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('appear');
      // If it's a counter, trigger the counter animation
      if (entry.target.classList.contains('stat-item') && !entry.target.classList.contains('counted')) {
        const counter = entry.target.querySelector('.counter');
        const target = +counter.getAttribute('data-target');
        const increment = target / 100;
        
        let current = 0;
        const updateCounter = () => {
          if (current < target) {
            current += increment;
            counter.innerText = Math.ceil(current);
            setTimeout(updateCounter, 20);
          } else {
            counter.innerText = target + (target > 50 ? '+' : '');
          }
        };
        updateCounter();
        entry.target.classList.add('counted');
      }
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .slide-in-left, .slide-in-right, .stat-item').forEach(el => {
  observer.observe(el);
});

// ===== Menu Data & Logic =====
const menuData = [
  { id: 1, name: "Truffle Eggs Benedict", category: "breakfast", price: 2400, desc: "Poached eggs, truffle hollandaise, English muffin", img: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
  { id: 2, name: "Avocado Toast", category: "breakfast", price: 1800, desc: "Sourdough, smashed avocado, cherry tomatoes, microgreens", img: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
  { id: 3, name: "Wagyu Beef Burger", category: "mains", price: 4500, desc: "Caramelized onions, aged cheddar, brioche bun", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
  { id: 4, name: "Pan-Seared Salmon", category: "mains", price: 3800, desc: "Asparagus, lemon butter sauce, roasted potatoes", img: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
  { id: 5, name: "Chocolate Lava Cake", category: "desserts", price: 1600, desc: "Vanilla bean ice cream, fresh berries", img: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
  { id: 6, name: "Classic Tiramisu", category: "desserts", price: 1400, desc: "Espresso, mascarpone, cocoa powder", img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" }
];

const tabBtns = document.querySelectorAll('.tab-btn');

// Render Menu Items
async function renderMenu(category = 'all') {
  const menuGrid = document.getElementById('menu-container');
  if (!menuGrid) return;
  menuGrid.innerHTML = '<p class="text-center">Loading our exquisite menu...</p>';
  
  try {
    const res = await fetch(`${API_URL}/menu`);
    let menuItems = await res.json();
    
    if (category !== 'all') {
      menuItems = menuItems.filter(item => item.category === category);
    }
    
    menuGrid.innerHTML = '';
    if (menuItems.length === 0) {
      menuGrid.innerHTML = '<p class="text-center">No items available in this category.</p>';
      return;
    }

    menuItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'menu-item fade-in-up appear';
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}">
        <div class="menu-info">
          <div class="menu-title">
            <h4>${item.name}</h4>
            <span class="menu-price">${formatPriceString(item.price)}</span>
          </div>
          <p class="menu-desc">${item.description}</p>
          <div class="menu-actions">
            <button class="add-to-cart" onclick="addToCart('${item.id}', '${item.name}', ${item.price})">Add to Cart</button>
            <button class="order-now" onclick="orderNow('${item.id}', '${item.name}', ${item.price})">Order Now</button>
          </div>
        </div>
      `;
      menuGrid.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    menuGrid.innerHTML = '<p class="text-center">Error loading menu. Please refresh.</p>';
  }
}

// Global addToCart helper
window.addToCart = (id, name, price) => {
  cart.push({ id, name, price });
  updateCartCount();
  showToast(`${name} added to cart!`, 'success');
};

function updateCartCount() {
  const cartCountEl = document.getElementById('cart-count');
  if (cartCountEl) cartCountEl.innerText = cart.length;
}

renderMenu();

// Tab clicking
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(btn.getAttribute('data-filter'));
  });
});

// ===== Shopping Cart Logic =====
let cart = [];
const cartCount = document.getElementById('cart-count');

window.orderNow = (id, name, price) => {
  window.addToCart(id, name, price);
  const viewCartBtn = document.getElementById('view-cart-btn');
  if (viewCartBtn) viewCartBtn.click();
};

// ===== Modals Logic =====
const bookingModal = document.getElementById('booking-modal');
const cartModal = document.getElementById('cart-modal');
const closeBtns = document.querySelectorAll('.close-modal');

function openBookingModal(roomName, price, roomId) {
  // ===== LOGIN GATE: Must be logged in to book =====
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData) {
    showToast('Please log in to book a room.', 'error');
    // Open auth modal after short delay so toast is visible
    setTimeout(() => {
      if (authModal) authModal.style.display = 'flex';
    }, 600);
    return;
  }

  document.getElementById('modal-room-name').innerText = roomName;
  
  const roomSelect = document.getElementById('booking-room-type');
  if (roomSelect && roomId) {
    roomSelect.value = roomId;
  }

  const modalPriceSpan = document.getElementById('modal-room-price');
  const modalCurrencySpan = document.getElementById('modal-currency-label');
  if (modalPriceSpan) {
    if (currentCurrency === 'USD') {
      modalPriceSpan.innerText = Math.round(price / EXCHANGE_RATE);
      if (modalCurrencySpan) modalCurrencySpan.innerText = 'USD';
    } else {
      modalPriceSpan.innerText = price.toLocaleString();
      if (modalCurrencySpan) modalCurrencySpan.innerText = 'ETB';
    }
  }
  
  bookingModal.style.display = 'flex';
}

document.getElementById('view-cart-btn').addEventListener('click', (e) => {
  e.preventDefault();
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalPrice = document.getElementById('cart-total-price');
  
  cartItemsContainer.innerHTML = '';
  let total = 0;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
  } else {
    cart.forEach((item, index) => {
      total += item.price;
      cartItemsContainer.innerHTML += `
        <div class="cart-item">
          <span>${item.name}</span>
          <span>${formatPriceString(item.price)}</span>
        </div>
      `;
    });
  }
  
  if (currentCurrency === 'USD') {
    cartTotalPrice.innerText = `$${Math.round(total / EXCHANGE_RATE)} USD`;
  } else {
    cartTotalPrice.innerText = `${total.toLocaleString()} ETB`;
  }
  cartModal.style.display = 'flex';
});

closeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    bookingModal.style.display = 'none';
    cartModal.style.display = 'none';
  });
});

window.addEventListener('click', (e) => {
  if (e.target === bookingModal) bookingModal.style.display = 'none';
  if (e.target === cartModal) cartModal.style.display = 'none';
});



// Booking Form Submission
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  // ===== LOGIN GATE =====
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData) {
    bookingModal.style.display = 'none';
    showToast('Please log in first to complete your booking.', 'error');
    setTimeout(() => { if (authModal) authModal.style.display = 'flex'; }, 600);
    return;
  }
  
  const roomId = document.getElementById('booking-room-type').value;
  const checkinStr = document.getElementById('checkin').value;
  const checkoutStr = document.getElementById('checkout').value;
  
  const checkinDate = new Date(checkinStr);
  const checkoutDate = new Date(checkoutStr);
  const diffTime = Math.abs(checkoutDate - checkinDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  
  const roomPrices = {
    'room-id-deluxe-garden': 5000,
    'room-id-presidential-suite': 8500,
    'room-id-luxury-villa': 12000
  };
  const pricePerNight = roomPrices[roomId] || 5000;
  const totalPrice = pricePerNight * diffDays;

  const bookingData = {
    user: userData.id,
    room: roomId,
    checkIn: checkinStr,
    checkOut: checkoutStr,
    totalPrice: totalPrice
  };

  try {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    if (res.ok) {
      showToast('Booking request sent! Check your dashboard for status updates.', 'success');
      bookingModal.style.display = 'none';
      document.getElementById('booking-form').reset();
    } else {
      showToast('Failed to send booking request. Please try again.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Connection Error: Is the backend server running?', 'error');
  }
});

// Order Form Submission
document.getElementById('order-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (cart.length === 0) {
    showToast('Please add items to your cart first.', 'error');
    return;
  }

  // ===== LOGIN GATE =====
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData) {
    cartModal.style.display = 'none';
    showToast('Please log in to place your food order.', 'error');
    setTimeout(() => { if (authModal) authModal.style.display = 'flex'; }, 600);
    return;
  }

  const orderData = {
    user: userData.id,
    items: cart.map(item => ({
      menuItem: item.id,
      quantity: 1,
      price: item.price
    })),
    totalAmount: cart.reduce((acc, item) => acc + item.price, 0),
    deliveryAddress: document.getElementById('delivery-address').value
  };

  try {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (res.ok) {
      showToast('Order placed! Check your dashboard to track delivery status.', 'success');
      cart = [];
      document.getElementById('cart-count').innerText = '0';
      cartModal.style.display = 'none';
    } else {
      showToast('Failed to place order. Please try again.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Connection Error: Is the backend server running?', 'error');
  }
});

// ===== Auth Modal Logic =====
const authModal = document.getElementById('auth-modal');
const loginBtn = document.querySelector('.login-btn');
const closeAuth = document.getElementById('close-auth');
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

loginBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData) {
    openDashboardModal();
  } else {
    authModal.style.display = 'flex';
  }
});

closeAuth?.addEventListener('click', () => {
  authModal.style.display = 'none';
});

tabLogin?.addEventListener('click', () => {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
});

tabRegister?.addEventListener('click', () => {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
});

// Handle Login
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const submitBtn = loginForm.querySelector('button[type="submit"]');

  // Disable button during request
  submitBtn.disabled = true;
  submitBtn.innerText = 'Signing In...';

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      showToast(`Welcome back, ${data.user.name}! 🎉`, 'success');
      authModal.style.display = 'none';
      loginForm.reset();
      updateUIForUser();
    } else {
      showToast(data.message || 'Invalid email or password. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Login error:', err);
    showToast('Cannot connect to server. Please make sure the backend is running.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerText = 'Sign In';
  }
});

// Handle Register
registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;

  try {
    const res = await fetch(`${API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem('userToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      showToast('Registration successful! Welcome to Jinka Resort.', 'success');
      authModal.style.display = 'none';
      updateUIForUser();
    } else {
      showToast(data.message || 'Registration failed', 'error');
    }
  } catch (err) {
    showToast('Connection error. Please try again.', 'error');
  }
});

function updateUIForUser() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (userData) {
    const firstName = userData.name.split(' ')[0];
    loginBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${firstName}`;
    loginBtn.classList.add('user-active');
  } else {
    const savedLang = localStorage.getItem('selectedLang') || 'en';
    loginBtn.innerHTML = translations[savedLang]['nav-login'];
    loginBtn.classList.remove('user-active');
  }
}

// ===== Dashboard Modal Logic =====
const dashboardModal = document.getElementById('dashboard-modal');
const closeDashboard = document.getElementById('close-dashboard');
const tabDashBookings = document.getElementById('tab-dash-bookings');
const tabDashOrders = document.getElementById('tab-dash-orders');
const dashBookingsContent = document.getElementById('dash-bookings-content');
const dashOrdersContent = document.getElementById('dash-orders-content');
const dashLogoutBtn = document.getElementById('dash-logout-btn');

function openDashboardModal() {
  const userData = JSON.parse(localStorage.getItem('userData'));
  if (!userData) return;

  const dashNameEl = document.getElementById('dash-user-name');
  const dashEmailEl = document.getElementById('dash-user-email');
  if (dashNameEl) dashNameEl.innerText = userData.name;
  if (dashEmailEl) dashEmailEl.innerText = userData.email;

  const currentLang = localStorage.getItem('selectedLang') || 'en';
  setLanguage(currentLang);

  if (dashboardModal) dashboardModal.style.display = 'flex';
  loadUserDashboard(userData.id);
}

async function loadUserDashboard(userId) {
  const bookingsTbody = document.querySelector('#dash-bookings-table tbody');
  const ordersTbody = document.querySelector('#dash-orders-table tbody');

  if (bookingsTbody) bookingsTbody.innerHTML = `<tr><td colspan="6" class="text-center">Loading bookings...</td></tr>`;
  if (ordersTbody) ordersTbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading orders...</td></tr>`;

  try {
    const [bookingsRes, ordersRes] = await Promise.all([
      fetch(`${API_URL}/bookings/user/${userId}`),
      fetch(`${API_URL}/orders/user/${userId}`)
    ]);

    const bookings = await bookingsRes.json();
    const orders = await ordersRes.json();

    // Render bookings
    if (bookingsTbody) {
      bookingsTbody.innerHTML = '';
      if (bookings.length === 0) {
        bookingsTbody.innerHTML = `<tr><td colspan="6" class="text-center">No bookings found yet. Start booking your stay above!</td></tr>`;
      } else {
        bookings.forEach(b => {
          const checkIn = new Date(b.check_in).toLocaleDateString();
          const checkOut = new Date(b.check_out).toLocaleDateString();
          const priceStr = formatPriceString(b.total_price);
          const status = b.status || 'pending';
          bookingsTbody.innerHTML += `
            <tr>
              <td>#${b.id.substring(0, 8)}</td>
              <td><strong>${b.room?.title || 'Unknown Room'}</strong></td>
              <td>${checkIn}</td>
              <td>${checkOut}</td>
              <td>${priceStr}</td>
              <td><span class="status-badge status-${status}">${status}</span></td>
            </tr>
          `;
        });
      }
    }

    // Render orders
    if (ordersTbody) {
      ordersTbody.innerHTML = '';
      if (orders.length === 0) {
        ordersTbody.innerHTML = `<tr><td colspan="5" class="text-center">No food orders found yet. Order delicious meals from the dining section!</td></tr>`;
      } else {
        orders.forEach(o => {
          const itemsList = o.order_items?.map(i => `${i.menu_items?.name || 'Item'} (x${i.quantity})`).join(', ') || 'No items';
          const totalAmountStr = formatPriceString(o.total_amount);
          const status = o.status || 'pending';
          ordersTbody.innerHTML += `
            <tr>
              <td>#${o.id.substring(0, 8)}</td>
              <td>${itemsList}</td>
              <td>Room: <strong>${o.delivery_address || 'N/A'}</strong></td>
              <td>${totalAmountStr}</td>
              <td><span class="status-badge status-${status}">${status}</span></td>
            </tr>
          `;
        });
      }
    }
  } catch (err) {
    console.error(err);
    if (bookingsTbody) bookingsTbody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:red;">Error loading bookings.</td></tr>`;
    if (ordersTbody) ordersTbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color:red;">Error loading orders.</td></tr>`;
  }
}

tabDashBookings?.addEventListener('click', () => {
  tabDashBookings.classList.add('active');
  tabDashOrders.classList.remove('active');
  dashBookingsContent?.classList.add('active');
  dashOrdersContent?.classList.remove('active');
});

tabDashOrders?.addEventListener('click', () => {
  tabDashOrders.classList.add('active');
  tabDashBookings.classList.remove('active');
  dashOrdersContent?.classList.add('active');
  dashBookingsContent?.classList.remove('active');
});

closeDashboard?.addEventListener('click', () => {
  if (dashboardModal) dashboardModal.style.display = 'none';
});

dashLogoutBtn?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('userData');
  localStorage.removeItem('userToken');
  if (dashboardModal) dashboardModal.style.display = 'none';
  showToast('Logged out successfully!', 'success');
  updateUIForUser();
});

// Initial check
updateUIForUser();

window.addEventListener('click', (e) => {
  if (e.target === bookingModal) bookingModal.style.display = 'none';
  if (e.target === cartModal) cartModal.style.display = 'none';
  if (e.target === authModal) authModal.style.display = 'none';
  if (e.target === dashboardModal) dashboardModal.style.display = 'none';
});

// ===== Dark Theme Toggle =====
const themeToggle = document.getElementById('theme-toggle');
themeToggle?.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  if(document.body.classList.contains('dark-theme')) {
    themeToggle.classList.remove('fa-moon');
    themeToggle.classList.add('fa-sun');
  } else {
    themeToggle.classList.remove('fa-sun');
    themeToggle.classList.add('fa-moon');
  }
});

// ===== Language / Translation System =====
const translations = {
  en: {
    'nav-home': 'Home',
    'nav-about': 'About',
    'nav-rooms': 'Rooms',
    'nav-dining': 'Dining',
    'nav-gallery': 'Gallery',
    'nav-contact': 'Contact',
    'nav-login': 'Login / Register',
    'hero-title': 'Where culture meets <br>world-class hospitality',
    'hero-subtitle': 'Experience the breathtaking city',
    'btn-book': 'Book Now',
    'btn-order': 'Order Food',
    'about-subtitle': 'Welcome to Jinka',
    'about-title': 'A Sanctuary of Elegance',
    'about-desc': 'Immerse yourself in a world where luxury meets nature. Jinka Resort offers a perfect blend of modern sophistication and timeless tranquility. Every detail is crafted to provide you with an unforgettable experience.',
    'rooms-subtitle': 'Luxurious Stays',
    'rooms-title': 'Our Exquisite Rooms',
    'dining-subtitle': 'Culinary Excellence',
    'dining-title': 'Restaurant & In-Room Dining',
    'dining-desc': 'Order fresh, gourmet food directly to your room or reserve a table.',
    'view-cart': 'View Cart',
    'dash-title': 'My Dashboard',
    'dash-logged-in': 'Logged in as:',
    'dash-logout': 'Logout',
    'dash-bookings': 'My Bookings',
    'dash-orders': 'My Food Orders',
    'dash-id': 'ID',
    'dash-room': 'Room',
    'dash-checkin': 'Check-In',
    'dash-checkout': 'Check-Out',
    'dash-total': 'Total Price',
    'dash-status': 'Status',
    'dash-items': 'Items Ordered',
    'dash-delivery': 'Delivery Info'
  },
  am: {
    'nav-home': 'ዋና ገጽ',
    'nav-about': 'ስለ እኛ',
    'nav-rooms': 'ክፍሎች',
    'nav-dining': 'ምግብ',
    'nav-gallery': 'ፎቶዎች',
    'nav-contact': 'እውቂያ',
    'nav-login': 'ግባ / ተመዝገብ',
    'hero-title': 'ባህል ከዓለም አቀፍ የላቀ መስተንግዶ ጋር የሚገናኝበት',
    'hero-subtitle': 'አስደናቂዋን ከተማ ይለማመዱ',
    'btn-book': 'አሁን ይያዙ',
    'btn-order': 'ምግብ ይዘዙ',
    'about-subtitle': 'እንኳን ወደ ጂንካ በደህና መጡ',
    'about-title': 'የውበት ማደሪያ',
    'about-desc': 'ቅንጦት ከተፈጥሮ ጋር በሚገናኝበት ዓለም ውስጥ እራስዎን ያስገቡ። ጂንካ ሪዞርት ዘመናዊ ውስብስብነት እና ጊዜ የማይሽረው መረጋጋት ፍጹም ቅንጅትን ያቀርባል። እያንዳንዱ ዝርዝር ሁኔታ የማይረሳ ተሞክሮ እንዲሰጥዎት ተደርጎ የተሰራ ነው።',
    'rooms-subtitle': 'የቅንጦት ቆይታ',
    'rooms-title': 'የእኛ ውብ ክፍሎች',
    'dining-subtitle': 'ምርጥ የምግብ ዝግጅት',
    'dining-title': 'ምግብ ቤት እና ክፍል ውስጥ መመገብ',
    'dining-desc': 'ትኩስ እና ጣፋጭ ምግቦችን በቀጥታ ወደ ክፍልዎ ይዘዙ ወይም ጠረጴዛ ያስይዙ።',
    'view-cart': 'ካርቱን ይመልከቱ',
    'dash-title': 'የእኔ ዳሽቦርድ',
    'dash-logged-in': 'በዚህ ስም ገብተዋል:',
    'dash-logout': 'ውጣ',
    'dash-bookings': 'የእኔ ክፍሎች ምዝገባ',
    'dash-orders': 'የእኔ የምግብ ትዕዛዞች',
    'dash-id': 'መለያ ቁጥር',
    'dash-room': 'ክፍል',
    'dash-checkin': 'መግቢያ ቀን',
    'dash-checkout': 'መውጫ ቀን',
    'dash-total': 'ጠቅላላ ዋጋ',
    'dash-status': 'ሁኔታ',
    'dash-items': 'የታዘዙ ምግቦች',
    'dash-delivery': 'የማድረሻ አድራሻ'
  }
};

function setLanguage(lang) {
  localStorage.setItem('selectedLang', lang);
  
  if (lang === 'am') {
    document.body.classList.add('lang-am');
  } else {
    document.body.classList.remove('lang-am');
  }

  // Update language switcher active buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Apply translations
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[lang] && translations[lang][key]) {
      el.innerHTML = translations[lang][key];
    }
  });

  // Re-apply user UI to keep/translate state correctly
  updateUIForUser();
}

// Set up language switcher events on load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.getAttribute('data-lang'));
    });
  });

  const savedLang = localStorage.getItem('selectedLang') || 'en';
  setLanguage(savedLang);
});

// Fallback setup in case DOMContentLoaded already fired
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.getAttribute('data-lang'));
  });
});
const savedLang = localStorage.getItem('selectedLang') || 'en';
setLanguage(savedLang);

function updatePricesUI() {
  // 1. Update room card prices
  document.querySelectorAll('.room-price-display').forEach(el => {
    const basePrice = parseInt(el.getAttribute('data-base-price'));
    if (basePrice) {
      el.innerText = `${formatPriceString(basePrice)}/night`;
    }
  });

  // 2. Update booking modal price (if currently open/visible)
  const modalPriceSpan = document.getElementById('modal-room-price');
  if (modalPriceSpan) {
    const activeRoomId = document.getElementById('booking-room-type').value;
    const roomPrices = {
      'room-id-deluxe-garden': 5000,
      'room-id-presidential-suite': 8500,
      'room-id-luxury-villa': 12000
    };
    const basePrice = roomPrices[activeRoomId] || 5000;
    
    if (currentCurrency === 'USD') {
      modalPriceSpan.innerText = Math.round(basePrice / EXCHANGE_RATE);
      const modalCurrencySpan = document.getElementById('modal-currency-label');
      if (modalCurrencySpan) modalCurrencySpan.innerText = 'USD';
    } else {
      modalPriceSpan.innerText = basePrice.toLocaleString();
      const modalCurrencySpan = document.getElementById('modal-currency-label');
      if (modalCurrencySpan) modalCurrencySpan.innerText = 'ETB';
    }
  }

  // 3. Re-render dining menu to apply current currency format
  const activeTab = document.querySelector('.tab-btn.active');
  if (activeTab) {
    renderMenu(activeTab.getAttribute('data-filter') || 'all');
  } else {
    renderMenu('all');
  }

  // 4. Update currency buttons UI active state
  document.querySelectorAll('.curr-btn').forEach(btn => {
    if (btn.getAttribute('data-curr') === currentCurrency) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function setCurrency(currency) {
  currentCurrency = currency;
  localStorage.setItem('selectedCurrency', currency);
  updatePricesUI();
}

// Bind currency switcher events on load
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.curr-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setCurrency(btn.getAttribute('data-curr'));
    });
  });
  updatePricesUI();
});

// Fallback currency switcher setup
document.querySelectorAll('.curr-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setCurrency(btn.getAttribute('data-curr'));
  });
});
updatePricesUI();

