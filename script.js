// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyCZ2xJ3Gx79n8eTDrT4ibEzV4mftz_jrEA",
    authDomain: "mg-coffee.firebaseapp.com",
    databaseURL: "https://mg-coffee-default-rtdb.firebaseio.com",
    projectId: "mg-coffee",
    storageBucket: "mg-coffee.appspot.com",
    messagingSenderId: "334517515261",
    appId: "1:334517515261:web:58734403dee3526482df94",
    measurementId: "G-F7V9XTQHMC"
  };
  
  // Initialize Firebase
  const app = firebase.initializeApp(firebaseConfig);
  const database = firebase.database();
  
  // Create the orders reference AFTER initialization
  const ordersRef = database.ref('orders');
  
  // Test the connection
  ordersRef.once('value')
    .then(snapshot => console.log("Firebase connected! Data:", snapshot.val()))
    .catch(error => console.error("Firebase error:", error));
  
  // Array to store orders locally
  let orders = [];
  let selectedExtras = [];
  
  // DOM elements
  const orderList = document.getElementById('order-list');
  const recipePanel = document.getElementById('recipe-panel');
  const pendingCount = document.getElementById('pending-count');
  const preparingCount = document.getElementById('preparing-count');
  const completedCount = document.getElementById('completed-count');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const newOrderBtn = document.getElementById('new-order-btn');
  const orderModal = document.getElementById('order-modal');
  const closeBtn = document.querySelector('.close-btn');
  const orderForm = document.getElementById('order-form');
  const addExtraBtn = document.getElementById('add-extra');
  const customExtraInput = document.getElementById('custom-extra');
  const extrasList = document.getElementById('extras-list');
  
  // Initialize the app
  function init() {
      // Listen for order changes
      ordersRef.on('value', (snapshot) => {
          orders = [];
          snapshot.forEach((childSnapshot) => {
              orders.push({
                  id: childSnapshot.key,
                  ...childSnapshot.val()
              });
          });
          renderOrders();
          updateStats();
      });
      
      // Set up event listeners
      setupEventListeners();
  }
  
  // Set up all event listeners
  function setupEventListeners() {
      // New order button
      newOrderBtn.addEventListener('click', () => {
          orderModal.style.display = 'block';
      });
  
      // Close modal button
      closeBtn.addEventListener('click', () => {
          orderModal.style.display = 'none';
          resetForm();
      });
  
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
          if (e.target === orderModal) {
              orderModal.style.display = 'none';
              resetForm();
          }
      });
  
      // Form submission
      orderForm.addEventListener('submit', (e) => {
          e.preventDefault();
          handleFormSubmission();
      });
  
      // Add extra button
      addExtraBtn.addEventListener('click', () => {
          const extra = customExtraInput.value.trim();
          if (extra) {
              addExtra(extra);
              customExtraInput.value = '';
          }
      });
  
      // Filter buttons
      filterButtons.forEach(button => {
          button.addEventListener('click', () => {
              filterButtons.forEach(btn => btn.classList.remove('active'));
              button.classList.add('active');
              renderOrders(button.dataset.filter);
          });
      });
  
      // Checkbox extras
      document.querySelectorAll('.extras-container input[type="checkbox"]').forEach(checkbox => {
          checkbox.addEventListener('change', (e) => {
              if (e.target.checked) {
                  addExtra(e.target.value);
              } else {
                  removeExtra(e.target.value);
              }
          });
      });
  }
  
  // Handle form submission
  function handleFormSubmission() {
      const customerName = document.getElementById('customer-name').value;
      const drink = document.getElementById('drink-select').value;
      
      if (!customerName || !drink) {
          alert('Please fill in all required fields');
          return;
      }
      
      const newOrder = {
          customer: customerName,
          drink: drink,
          extras: selectedExtras,
          status: 'pending',
          recipe: getDefaultRecipe(drink),
          createdAt: firebase.database.ServerValue.TIMESTAMP
      };
      
      addOrderToFirebase(newOrder);
      orderModal.style.display = 'none';
      resetForm();
  }
  
  // Add order to Firebase
  function addOrderToFirebase(order) {
      const newOrderRef = ordersRef.push();
      newOrderRef.set(order)
          .then(() => console.log("Order added successfully"))
          .catch((error) => console.error("Error adding order: ", error));
  }
  
  // Update order status in Firebase
  function updateOrderStatusInFirebase(orderId, newStatus) {
      database.ref('orders/' + orderId).update({
          status: newStatus
      })
      .then(() => console.log("Status updated successfully"))
      .catch((error) => console.error("Error updating status: ", error));
  }
  
  // Render orders to the queue
  function renderOrders(filter = 'all') {
      orderList.innerHTML = '';
      
      if (orders.length === 0) {
          orderList.innerHTML = `
              <div class="empty-queue">
                  <i class="fas fa-mug-hot"></i>
                  <p>No orders in queue</p>
              </div>
          `;
          return;
      }
      
      const filteredOrders = filter === 'all' 
          ? orders 
          : orders.filter(order => order.status === filter);
      
      if (filteredOrders.length === 0) {
          orderList.innerHTML = `
              <div class="empty-queue">
                  <i class="fas ${filter === 'completed' ? 'fa-check-circle' : 'fa-mug-hot'}"></i>
                  <p>No ${filter} orders</p>
              </div>
          `;
          return;
      }
      
      filteredOrders.forEach(order => {
          const orderCard = document.createElement('div');
          orderCard.className = `order-card ${order.status}`;
          orderCard.innerHTML = `
              <div class="order-header">
                  <span class="order-number">#${order.id.substring(0, 6)}</span>
                  <span class="order-status ${order.status}">${order.status}</span>
              </div>
              <div class="order-customer">${order.customer}</div>
              <div class="order-drink">${order.drink}</div>
              ${order.extras && order.extras.length > 0 ? `
                  <div class="order-extras">
                      ${order.extras.map(extra => `<span class="extra-tag">${extra}</span>`).join('')}
                  </div>
              ` : ''}
              <div class="order-actions">
                  ${order.status !== 'completed' ? `
                      <button class="action-btn ${order.status === 'pending' ? 'prepare-btn' : 'complete-btn'}" data-id="${order.id}">
                          <i class="fas ${order.status === 'pending' ? 'fa-mug-hot' : 'fa-check'}"></i>
                          ${order.status === 'pending' ? 'Start Preparing' : 'Mark Complete'}
                      </button>
                  ` : ''}
              </div>
          `;
          
          orderCard.addEventListener('click', (e) => {
              if (!e.target.classList.contains('action-btn')) {
                  showRecipe(order);
              }
          });
          
          orderList.appendChild(orderCard);
      });
      
      // Add event listeners to action buttons
      document.querySelectorAll('.action-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const orderId = btn.getAttribute('data-id');
              updateOrderStatus(orderId);
          });
      });
  }
  
  // Show recipe details
  function showRecipe(order) {
      recipePanel.innerHTML = `
          <div class="recipe-details">
              <div class="recipe-header">
                  <h3 class="recipe-title">${order.drink}</h3>
                  <p class="recipe-subtitle">Order #${order.id.substring(0, 6)} • ${order.customer}</p>
              </div>
              <div class="recipe-ingredients">
                  <h3>Ingredients</h3>
                  <ul class="ingredient-list">
                      ${order.recipe.ingredients.map(ing => `<li class="ingredient-item">${ing}</li>`).join('')}
                  </ul>
              </div>
              <div class="recipe-steps">
                  <h3>Preparation Steps</h3>
                  <ul class="step-list">
                      ${order.recipe.steps.map((step, i) => `
                          <li class="step-item">
                              <span class="step-number">${i + 1}.</span>
                              <span class="step-text">${step}</span>
                          </li>
                      `).join('')}
                  </ul>
              </div>
          </div>
      `;
  }
  
  // Update order status
  function updateOrderStatus(orderId) {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      let newStatus;
      if (order.status === 'pending') {
          newStatus = 'preparing';
      } else if (order.status === 'preparing') {
          newStatus = 'completed';
      }
      
      if (newStatus) {
          updateOrderStatusInFirebase(orderId, newStatus);
      }
  }
  
  // Update statistics counters
  function updateStats() {
      const pending = orders.filter(o => o.status === 'pending').length;
      const preparing = orders.filter(o => o.status === 'preparing').length;
      const completed = orders.filter(o => o.status === 'completed').length;
      
      pendingCount.textContent = pending;
      preparingCount.textContent = preparing;
      completedCount.textContent = completed;
  }

  // Add this with your other DOM element selectors
const clearAllBtn = document.getElementById('clear-all-btn');

// Clear all orders function
clearAllBtn.addEventListener('click', () => {
  // Show confirmation dialog
  const isConfirmed = confirm("⚠️ WARNING: This will delete ALL orders permanently.\n\nAre you sure you want to proceed?");
  
  if (isConfirmed) {
    // User clicked "OK" - clear all orders
    ordersRef.remove()
      .then(() => {
        console.log("All orders cleared successfully");
        // Optional: Show a success message
        alert("All orders have been cleared successfully.");
      })
      .catch((error) => {
        console.error("Error clearing orders: ", error);
        alert("Error clearing orders. Please try again.");
      });
  } else {
    // User clicked "Cancel" - do nothing
    console.log("Order clearance cancelled");
  }
});
  
  // Extra management functions
  function addExtra(extra) {
      if (!selectedExtras.includes(extra)) {
          selectedExtras.push(extra);
          renderExtrasList();
      }
  }
  
  function removeExtra(extra) {
      selectedExtras = selectedExtras.filter(item => item !== extra);
      renderExtrasList();
  }
  
  function renderExtrasList() {
      extrasList.innerHTML = '';
      selectedExtras.forEach(extra => {
          const tag = document.createElement('span');
          tag.className = 'extra-tag';
          tag.innerHTML = `
              ${extra}
              <span class="remove-extra" data-extra="${extra}">&times;</span>
          `;
          extrasList.appendChild(tag);
      });
      
      document.querySelectorAll('.remove-extra').forEach(btn => {
          btn.addEventListener('click', (e) => {
              const extra = e.target.getAttribute('data-extra');
              removeExtra(extra);
              const checkbox = document.querySelector(`.extras-container input[value="${extra}"]`);
              if (checkbox) checkbox.checked = false;
          });
      });
  }
  
  // Reset form
  function resetForm() {
      orderForm.reset();
      selectedExtras = [];
      extrasList.innerHTML = '';
      document.querySelectorAll('.extras-container input[type="checkbox"]').forEach(checkbox => {
          checkbox.checked = false;
      });
  }
  
  // Generate default recipe
  function getDefaultRecipe(drinkName) {
      return {
          ingredients: [
              "Standard ingredients for " + drinkName,
              ...(selectedExtras.length > 0 ? ["Additional ingredients: " + selectedExtras.join(", ")] : [])
          ],
          steps: [
              "Standard preparation steps for " + drinkName,
              ...(selectedExtras.length > 0 ? ["Additional steps for: " + selectedExtras.join(", ")] : []),
              "Serve and enjoy!"
          ]
      };
  }
  
  // Initialize the app when DOM is loaded
  document.addEventListener('DOMContentLoaded', init);
  