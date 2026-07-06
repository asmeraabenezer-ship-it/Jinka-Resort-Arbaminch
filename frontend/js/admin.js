// ===== Admin Auth & Dashboard Logic =====
// On local: uses localhost:5000
// On production (Vercel): uses the Render-hosted backend URL
const RENDER_API_URL = 'https://jinka-resort-api.onrender.com/api'; // ← Your Render URL
const API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') 
  ? 'http://localhost:5000/api' 
  : RENDER_API_URL;


// Handle Login
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('admin-email').value;
  const password = document.getElementById('admin-password').value;

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && (data.user.role === 'admin' || data.user.role === 'superadmin')) {
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminRole', data.user.role);
      document.getElementById('admin-login-overlay').style.display = 'none';
      document.querySelector('.admin-layout').style.display = 'flex';
      applyRolePermissions(data.user.role);
      loadDashboardStats();
    } else {
      alert(data.message || 'Access Denied: Admin Authority Required');
    }
  } catch (err) {
    console.error('Login error details:', err);
    alert('Authority Server Error: ' + err.message + '\n\nMake sure the backend server is running on port 5000.\nAPI URL: ' + API_URL);
  }
});

// Tab Switching
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();
    const tab = item.getAttribute('data-tab');
    
    // Update UI
    navItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tab}-content`).classList.add('active');
    
    pageTitle.innerText = item.innerText.trim();
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
      document.querySelector('.sidebar').classList.remove('active');
      document.getElementById('sidebar-overlay').classList.remove('active');
    }

    // Load Data for Tab
    loadTabData(tab);
  });
});

// Mobile Toggle & Backdrop
const adminSidebar = document.querySelector('.sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');

document.getElementById('admin-mobile-toggle')?.addEventListener('click', () => {
  adminSidebar.classList.toggle('active');
  sidebarOverlay.classList.toggle('active');
});

sidebarOverlay?.addEventListener('click', () => {
  adminSidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
});

// Load Data based on Tab
async function loadTabData(tab) {
  switch(tab) {
    case 'dashboard':
      loadDashboardStats();
      break;
    case 'rooms':
      loadRooms();
      break;
    case 'bookings':
      loadBookings();
      break;
    case 'menu':
      loadMenu();
      break;
    case 'orders':
      loadOrders();
      break;
    case 'users':
      loadUsers();
      break;
    case 'settings':
      // Settings are static for now
      break;
  }
}

// User Management
async function loadUsers() {
  const tbody = document.querySelector('#all-users-table tbody');
  try {
    const res = await fetch(`${API_URL}/admin/users`);
    const users = await res.json();
    tbody.innerHTML = '';
    users.forEach(u => {
      tbody.innerHTML += `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td><span class="status-badge ${u.role === 'admin' || u.role === 'superadmin' ? 'status-confirmed' : 'status-pending'}">${u.role}</span></td>
          <td>${new Date(u.created_at).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-sm btn-delete" onclick="deleteUser('${u.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

async function deleteUser(id) {
  if (!confirm('Are you sure you want to remove this Authority User?')) return;
  try {
    await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE' });
    loadUsers();
  } catch (err) { alert('Failed to delete user'); }
}

// Settings Form
document.getElementById('settings-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('System Settings updated successfully!');
});

function openAddAdminModal() {
  const modal = document.getElementById('admin-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('admin-form');
  title.innerText = 'Create New Admin';
  form.innerHTML = `
    <div class="form-group">
      <label>Full Name</label>
      <input type="text" id="admin-new-name" required>
    </div>
    <div class="form-group">
      <label>Email Address</label>
      <input type="email" id="admin-new-email" required>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" id="admin-new-password" required>
    </div>
    <div class="form-group">
      <label>Assign Role</label>
      <select id="admin-new-role">
        <option value="admin">Sub-Admin (Room & Menu Controller)</option>
        <option value="superadmin">Super Administrator (Full Control)</option>
        <option value="user">Standard User</option>
      </select>
    </div>
    <button type="submit" class="btn btn-primary btn-block">Create Authority User</button>
  `;
  modal.style.display = 'flex';
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('admin-new-name').value,
      email: document.getElementById('admin-new-email').value,
      password: document.getElementById('admin-new-password').value,
      role: document.getElementById('admin-new-role').value
    };
    try {
      await fetch(`${API_URL}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      modal.style.display = 'none';
      loadUsers();
    } catch (err) { alert('Failed to create authority user'); }
  };
}

// Stats Loading
let revenueChart;

async function loadDashboardStats() {
  try {
    const [roomsRes, bookingsRes, ordersRes, logsRes] = await Promise.all([
      fetch(`${API_URL}/rooms`),
      fetch(`${API_URL}/admin/bookings`),
      fetch(`${API_URL}/admin/orders`),
      fetch(`${API_URL}/admin/logs`)
    ]);

    const rooms = await roomsRes.json();
    const bookings = await bookingsRes.json();
    const orders = await ordersRes.json();
    const logs = await logsRes.json();

    document.getElementById('stat-rooms').innerText = rooms.length;
    document.getElementById('stat-bookings').innerText = bookings.length;
    document.getElementById('stat-orders').innerText = orders.length;
    
    const revenue = bookings.reduce((acc, curr) => acc + (curr.total_price || 0), 0) + 
                    orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    document.getElementById('stat-revenue').innerText = `${revenue.toLocaleString()} ETB`;

    // Initialize Chart
    initRevenueChart(bookings, orders);

    // Populate Logs
    const logContainer = document.getElementById('activity-logs');
    logContainer.innerHTML = '';
    logs.forEach(log => {
      const time = new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      logContainer.innerHTML += `
        <div class="activity-item">
          <span class="activity-time">${time}</span>
          <span class="activity-action">${log.action}</span>
          <span class="activity-desc">${log.details}</span>
        </div>
      `;
    });

    // Populate Recent Bookings Table
    const tableBody = document.getElementById('recent-bookings-table');
    tableBody.innerHTML = '';
    bookings.slice(0, 5).forEach(b => {
      tableBody.innerHTML += `
        <tr>
          <td>${b.user?.name || 'Guest'}</td>
          <td>${b.room?.title || 'Unknown'}</td>
          <td>${new Date(b.check_in).toLocaleDateString()}</td>
          <td><span class="status-badge status-${b.status}">${b.status}</span></td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading stats:', err);
  }
}

function initRevenueChart(bookings, orders) {
  const canvas = document.getElementById('revenueChart');
  const ctx = canvas.getContext('2d');
  
  if (revenueChart) {
    revenueChart.destroy();
  }

  const roomRev = bookings.reduce((acc, curr) => acc + (curr.total_price || 0), 0);
  const cafeRev = orders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
  const totalRev = roomRev + cafeRev;

  // Create Gradients
  const gradGold = ctx.createLinearGradient(0, 0, 0, 400);
  gradGold.addColorStop(0, '#d4af37');
  gradGold.addColorStop(1, '#aa8c2c');

  const gradEmerald = ctx.createLinearGradient(0, 0, 0, 400);
  gradEmerald.addColorStop(0, '#0b3d2b');
  gradEmerald.addColorStop(1, '#052218');

  revenueChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Room Revenue', 'Cafe Revenue'],
      datasets: [{
        data: [roomRev, cafeRev],
        backgroundColor: [gradGold, gradEmerald],
        hoverOffset: 20,
        borderWidth: 0,
        borderRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            font: {
              family: "'Inter', sans-serif",
              size: 14,
              weight: '500'
            },
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#0b3d2b',
          titleFont: { size: 16 },
          bodyFont: { size: 14 },
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              let label = context.label || '';
              if (label) label += ': ';
              if (context.parsed !== null) {
                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB' }).format(context.parsed);
              }
              return label;
            }
          }
        }
      },
      animation: {
        animateScale: true,
        animateRotate: true
      }
    },
    plugins: [{
      id: 'centerText',
      afterDraw: (chart) => {
        const { ctx, chartArea: { top, width, height } } = chart;
        ctx.save();
        ctx.font = 'bold 2rem Inter';
        ctx.fillStyle = '#0b3d2b';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(totalRev.toLocaleString() + ' ETB', width / 2, top + (height / 2) - 10);
        
        ctx.font = '500 1rem Inter';
        ctx.fillStyle = '#666666';
        ctx.fillText('Total Revenue', width / 2, top + (height / 2) + 25);
        ctx.restore();
      }
    }]
  });
}

// Rooms Management
async function loadRooms() {
  const grid = document.getElementById('admin-rooms-grid');
  try {
    const res = await fetch(`${API_URL}/rooms`);
    const rooms = await res.json();
    grid.innerHTML = '';
    rooms.forEach(room => {
      grid.innerHTML += `
        <div class="admin-card">
          <img src="${room.image}" alt="${room.title}" class="admin-card-img">
          <div class="admin-card-body">
            <h3>${room.title}</h3>
            <p>${room.price} ETB / night</p>
            <div class="admin-card-actions">
              <button class="btn btn-sm btn-edit" onclick="editRoom('${room.id}')">Edit</button>
              <button class="btn btn-sm btn-delete" onclick="deleteRoom('${room.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) { console.error(err); }
}

// Bookings Management
async function loadBookings() {
  const tbody = document.querySelector('#all-bookings-table tbody');
  try {
    const res = await fetch(`${API_URL}/admin/bookings`);
    const bookings = await res.json();
    tbody.innerHTML = '';
    bookings.forEach(b => {
      tbody.innerHTML += `
        <tr>
          <td>#${b.id.substring(0, 8)}</td>
          <td>${b.user?.name || 'Guest'}<br><small>${b.user?.email || ''}</small></td>
          <td>${b.room?.title || 'N/A'}</td>
          <td>${new Date(b.check_in).toLocaleDateString()}</td>
          <td>${new Date(b.check_out).toLocaleDateString()}</td>
          <td>${b.total_price} ETB</td>
          <td><span class="status-badge status-${b.status}">${b.status}</span></td>
          <td>
            <select onchange="updateBookingStatus('${b.id}', this.value)" class="btn btn-sm">
              <option value="pending" ${b.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="confirmed" ${b.status === 'confirmed' ? 'selected' : ''}>Confirm</option>
              <option value="cancelled" ${b.status === 'cancelled' ? 'selected' : ''}>Cancel</option>
            </select>
          </td>
        </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

// Menu Management
async function loadMenu() {
  const grid = document.getElementById('admin-menu-grid');
  try {
    const res = await fetch(`${API_URL}/menu`);
    const items = await res.json();
    grid.innerHTML = '';
    items.forEach(item => {
      grid.innerHTML += `
        <div class="admin-card">
          <img src="${item.image}" alt="${item.name}" class="admin-card-img">
          <div class="admin-card-body">
            <h3>${item.name}</h3>
            <p>${item.price} ETB</p>
            <div class="admin-card-actions">
              <button class="btn btn-sm btn-edit" onclick="editMenuItem('${item.id}')">Edit</button>
              <button class="btn btn-sm btn-delete" onclick="deleteMenuItem('${item.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    });
  } catch (err) { console.error(err); }
}

// Orders Management
async function loadOrders() {
  const tbody = document.querySelector('#all-orders-table tbody');
  try {
    const res = await fetch(`${API_URL}/admin/orders`);
    const orders = await res.json();
    tbody.innerHTML = '';
    orders.forEach(o => {
      const itemNames = o.order_items?.map(i => `${i.menu_items?.name} (x${i.quantity})`).join(', ') || 'No items';
      tbody.innerHTML += `
        <tr>
          <td>#${o.id.substring(0, 8)}</td>
          <td>${o.user?.name || 'Guest'}</td>
          <td>${itemNames}</td>
          <td>${o.total_amount} ETB</td>
          <td>${o.delivery_address || 'N/A'}</td>
          <td><span class="status-badge status-${o.status}">${o.status}</span></td>
          <td>
            <select onchange="updateOrderStatus('${o.id}', this.value)" class="btn btn-sm">
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>Pending</option>
              <option value="preparing" ${o.status === 'preparing' ? 'selected' : ''}>Preparing</option>
              <option value="ready" ${o.status === 'ready' ? 'selected' : ''}>Ready</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>Cancel</option>
            </select>
          </td>
        </tr>
      `;
    });
  } catch (err) { console.error(err); }
}

// Status Updates
async function updateBookingStatus(id, status) {
  try {
    await fetch(`${API_URL}/admin/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadBookings();
  } catch (err) { alert('Update failed'); }
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(`${API_URL}/admin/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    loadOrders();
  } catch (err) { alert('Update failed'); }
}

// CRUD Operations (Placeholders for demonstration)
// Image Upload Helper
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);
  try {
    const res = await fetch(`${API_URL.replace('/api', '')}/api/upload`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error('Upload failed:', err);
    return null;
  }
}

function openAddRoomModal() {
  const modal = document.getElementById('admin-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('admin-form');
  title.innerText = 'Add New Room';
  form.innerHTML = `
    <div class="form-group">
      <label>Room Title</label>
      <input type="text" id="room-title" required>
    </div>
    <div class="form-group">
      <label>Price per Night (ETB)</label>
      <input type="number" id="room-price" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="room-desc" required></textarea>
    </div>
    <div class="form-group">
      <label>Room Image</label>
      <input type="file" id="room-image-file" accept="image/*" required>
    </div>
    <button type="submit" class="btn btn-primary btn-block">Create Room</button>
  `;
  modal.style.display = 'flex';
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById('room-image-file').files[0];
    const imageUrl = await uploadImage(file);
    
    if (!imageUrl) {
      alert('Image upload failed');
      return;
    }

    const data = {
      title: document.getElementById('room-title').value,
      price: document.getElementById('room-price').value,
      description: document.getElementById('room-desc').value,
      image: imageUrl,
      capacity: 2
    };
    try {
      await fetch(`${API_URL}/admin/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      modal.style.display = 'none';
      loadRooms();
    } catch (err) { alert('Failed to create room'); }
  };
}

function openAddMenuModal() {
  const modal = document.getElementById('admin-modal');
  const title = document.getElementById('modal-title');
  const form = document.getElementById('admin-form');
  title.innerText = 'Add Cafe Menu Item';
  form.innerHTML = `
    <div class="form-group">
      <label>Item Name</label>
      <input type="text" id="menu-name" required>
    </div>
    <div class="form-group">
      <label>Category</label>
      <select id="menu-category">
        <option value="breakfast">Breakfast</option>
        <option value="mains">Mains</option>
        <option value="desserts">Desserts</option>
        <option value="drinks">Drinks</option>
      </select>
    </div>
    <div class="form-group">
      <label>Price (ETB)</label>
      <input type="number" id="menu-price" required>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="menu-desc" required></textarea>
    </div>
    <div class="form-group">
      <label>Item Image</label>
      <input type="file" id="menu-image-file" accept="image/*" required>
    </div>
    <button type="submit" class="btn btn-primary btn-block">Add Menu Item</button>
  `;
  modal.style.display = 'flex';
  
  form.onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById('menu-image-file').files[0];
    const imageUrl = await uploadImage(file);
    
    if (!imageUrl) {
      alert('Image upload failed');
      return;
    }

    const data = {
      name: document.getElementById('menu-name').value,
      category: document.getElementById('menu-category').value,
      price: document.getElementById('menu-price').value,
      description: document.getElementById('menu-desc').value,
      image: imageUrl
    };
    try {
      await fetch(`${API_URL}/admin/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      modal.style.display = 'none';
      loadMenu();
    } catch (err) { alert('Failed to add menu item'); }
  };
}

// Edit Room
async function editRoom(id) {
  try {
    const res = await fetch(`${API_URL}/rooms/${id}`);
    const room = await res.json();
    if (!res.ok) throw new Error(room.message);

    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('admin-form');
    title.innerText = 'Edit Room';
    form.innerHTML = `
      <div class="form-group">
        <label>Room Title</label>
        <input type="text" id="room-title" value="${room.title}" required>
      </div>
      <div class="form-group">
        <label>Price per Night (ETB)</label>
        <input type="number" id="room-price" value="${room.price}" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="room-desc" required>${room.description}</textarea>
      </div>
      <div class="form-group">
        <label>Room Image (Leave empty to keep current)</label>
        <input type="file" id="room-image-file" accept="image/*">
        <small style="display:block;margin-top:5px;color:#666">Current: ${room.image}</small>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
    `;
    modal.style.display = 'flex';
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      let imageUrl = room.image;
      const fileInput = document.getElementById('room-image-file');
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert('Image upload failed');
          return;
        }
      }

      const data = {
        title: document.getElementById('room-title').value,
        price: document.getElementById('room-price').value,
        description: document.getElementById('room-desc').value,
        image: imageUrl,
        capacity: room.capacity || 2
      };
      try {
        const updateRes = await fetch(`${API_URL}/admin/rooms/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!updateRes.ok) throw new Error('Update failed');
        modal.style.display = 'none';
        loadRooms();
      } catch (err) { alert('Failed to update room'); }
    };
  } catch (err) {
    alert('Failed to load room details');
  }
}

// Delete Room
async function deleteRoom(id) {
  if (!confirm('Are you sure you want to delete this room?')) return;
  try {
    const res = await fetch(`${API_URL}/admin/rooms/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete failed');
    loadRooms();
  } catch (err) {
    alert('Failed to delete room');
  }
}

// Edit Menu Item
async function editMenuItem(id) {
  try {
    const res = await fetch(`${API_URL}/menu/${id}`);
    const item = await res.json();
    if (!res.ok) throw new Error(item.message);

    const modal = document.getElementById('admin-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('admin-form');
    title.innerText = 'Edit Menu Item';
    form.innerHTML = `
      <div class="form-group">
        <label>Item Name</label>
        <input type="text" id="menu-name" value="${item.name}" required>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select id="menu-category">
          <option value="breakfast" ${item.category === 'breakfast' ? 'selected' : ''}>Breakfast</option>
          <option value="mains" ${item.category === 'mains' ? 'selected' : ''}>Mains</option>
          <option value="desserts" ${item.category === 'desserts' ? 'selected' : ''}>Desserts</option>
          <option value="drinks" ${item.category === 'drinks' ? 'selected' : ''}>Drinks</option>
        </select>
      </div>
      <div class="form-group">
        <label>Price (ETB)</label>
        <input type="number" id="menu-price" value="${item.price}" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea id="menu-desc" required>${item.description}</textarea>
      </div>
      <div class="form-group">
        <label>Item Image (Leave empty to keep current)</label>
        <input type="file" id="menu-image-file" accept="image/*">
        <small style="display:block;margin-top:5px;color:#666">Current: ${item.image}</small>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Save Changes</button>
    `;
    modal.style.display = 'flex';
    
    form.onsubmit = async (e) => {
      e.preventDefault();
      let imageUrl = item.image;
      const fileInput = document.getElementById('menu-image-file');
      if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const uploadedUrl = await uploadImage(file);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          alert('Image upload failed');
          return;
        }
      }

      const data = {
        name: document.getElementById('menu-name').value,
        category: document.getElementById('menu-category').value,
        price: document.getElementById('menu-price').value,
        description: document.getElementById('menu-desc').value,
        image: imageUrl
      };
      try {
        const updateRes = await fetch(`${API_URL}/admin/menu/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!updateRes.ok) throw new Error('Update failed');
        modal.style.display = 'none';
        loadMenu();
      } catch (err) { alert('Failed to update menu item'); }
    };
  } catch (err) {
    alert('Failed to load menu item details');
  }
}

// Delete Menu Item
async function deleteMenuItem(id) {
  if (!confirm('Are you sure you want to delete this menu item?')) return;
  try {
    const res = await fetch(`${API_URL}/admin/menu/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Delete failed');
    loadMenu();
  } catch (err) {
    alert('Failed to delete menu item');
  }
}

// Apply Role Permissions (Super Admin vs Sub-Admin)
function applyRolePermissions(role) {
  const usersTab = document.querySelector('.nav-item[data-tab="users"]');
  const settingsTab = document.querySelector('.nav-item[data-tab="settings"]');
  
  if (role === 'admin') {
    // Hide tabs for Sub-Admins
    if (usersTab) usersTab.style.setProperty('display', 'none', 'important');
    if (settingsTab) settingsTab.style.setProperty('display', 'none', 'important');
    
    // If they were on a restricted tab, switch them back to dashboard
    const activeTab = document.querySelector('.nav-item.active');
    if (activeTab && (activeTab.getAttribute('data-tab') === 'users' || activeTab.getAttribute('data-tab') === 'settings')) {
      const dashboardTab = document.querySelector('.nav-item[data-tab="dashboard"]');
      if (dashboardTab) dashboardTab.click();
    }
  } else {
    // Show tabs for Super Admin
    if (usersTab) usersTab.style.removeProperty('display');
    if (settingsTab) settingsTab.style.removeProperty('display');
  }
}

// Initialize
const savedToken = localStorage.getItem('adminToken');
const savedRole = localStorage.getItem('adminRole');
if (savedToken && (savedRole === 'admin' || savedRole === 'superadmin')) {
  document.getElementById('admin-login-overlay').style.display = 'none';
  document.querySelector('.admin-layout').style.display = 'flex';
  applyRolePermissions(savedRole);
  loadDashboardStats();
}

// Handle Logout
document.getElementById('admin-logout')?.addEventListener('click', (e) => {
  e.preventDefault();
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminRole');
  window.location.reload();
});

// Modal Close
document.getElementById('close-admin-modal').onclick = () => {
  document.getElementById('admin-modal').style.display = 'none';
};
window.onclick = (e) => {
  if (e.target.id === 'admin-modal') e.target.style.display = 'none';
};
