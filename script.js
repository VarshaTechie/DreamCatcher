// ====== Data ======
// Motivational quotes
const quotes = [
  "Believe you can and you're halfway there.",
  "Don't watch the clock; do what it does — keep going.",
  "Dream big and dare to fail.",
  "It always seems impossible until it’s done.",
  "Small steps every day lead to big results."
];

// Goals array
let goals = [];
let activeCategory = null;

// ====== Initialization ======
document.addEventListener("DOMContentLoaded", () => {
  showDate();
  showQuote();
  document.getElementById("addBtn").addEventListener("click", addGoal);

  // Auto-focus when page loads
  document.getElementById("goalInput").focus();

  // Press Enter to add a goal
  document.getElementById("goalInput").addEventListener("keypress", e => {
    if (e.key === "Enter") addGoal();
  });

  // Load saved goals
  const savedGoals = JSON.parse(localStorage.getItem("goals") || "[]");
  goals = savedGoals;

  // Load last selected category
  const savedCategory = localStorage.getItem("activeCategory");
  if (savedCategory) {
    activeCategory = savedCategory === "null" ? null : savedCategory;
    document.querySelectorAll(".category-link").forEach(link => {
      if (link.textContent === savedCategory || (savedCategory === null && link.textContent === "All")) {
        link.classList.add("active");
      }
    });
  }

  renderGoals();
});

// ====== Show date ======
function showDate() {
  const today = new Date();
  document.getElementById("date").textContent = today.toDateString();
}

// ====== Show random daily quote ======
function showQuote() {
  const index = new Date().getDate() % quotes.length;
  document.getElementById("motivation").textContent = "💬 " + quotes[index];
}

// ====== Add a goal ======
function addGoal() {
  const goalText = document.getElementById("goalInput").value.trim();
  const dueDate = document.getElementById("dueDate").value;

  if (goalText === "") return alert("Please enter a goal!");

  goals.push({ text: goalText, due: dueDate, completed: false, category: activeCategory });

  // Clear inputs and re-focus
  document.getElementById("goalInput").value = "";
  document.getElementById("dueDate").value = "";
  document.getElementById("goalInput").focus();

  saveData();
  renderGoals();
}

// ====== Render goals ======
function renderGoals() {
  const list = document.getElementById("goalList");
  list.innerHTML = "";

  const filteredGoals = activeCategory
    ? goals.filter(g => g.category === activeCategory)
    : goals;

  // Empty state
  if (filteredGoals.length === 0) {
    list.innerHTML = "<li style='text-align:center; color:#666;'>No goals yet — add one above!</li>";
    updateProgress();
    return;
  }

  filteredGoals.forEach((goal, index) => {
    const li = document.createElement("li");
    li.classList.add("goal-item");
    if (goal.completed) li.classList.add("completed");

    // Overdue check
    const todayISO = new Date().toISOString().split("T")[0];
    if (goal.due && goal.due < todayISO && !goal.completed) {
      li.classList.add("overdue");
    }

    li.innerHTML = `
      <span class="goal-text">${goal.text}</span>
      ${goal.category ? `<span class="goal-meta">🏷 ${goal.category}</span>` : ""}
      ${goal.due ? `<span class="goal-meta">📅 ${new Date(goal.due).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>` : ""}
      <div class="goal-actions">
        <button class="btn-complete" onclick="toggleGoal(${index})">✓</button>
        <button class="btn-delete" onclick="deleteGoal(${index})">🗑</button>
      </div>
    `;
    list.appendChild(li);
  });

  updateProgress();
}

// ====== Toggle goal completion ======
function toggleGoal(index) {
  goals[index].completed = !goals[index].completed;
  saveData();
  renderGoals();
  if (goals[index].completed) {
    launchConfetti();
  }
}

// ====== Delete goal ======
function deleteGoal(index) {
  goals.splice(index, 1);
  saveData();
  renderGoals();
}

// ====== Clear completed goals ======
function clearCompleted() {
  goals = goals.filter(g => !g.completed);
  saveData();
  renderGoals();
}

// ====== Update progress ======
function updateProgress() {
  if (goals.length === 0) {
    document.getElementById("progressBar").style.width = "0%";
    document.getElementById("progressBar").textContent = "0%";
    return;
  }
  const completed = goals.filter(g => g.completed).length;
  const percent = Math.round((completed / goals.length) * 100);
  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressBar").textContent = percent + "%";
}

// ====== Confetti effect ======
function launchConfetti() {
  const duration = 1000;
  const end = Date.now() + duration;

  (function frame() {
    const particle = document.createElement("span");
    particle.textContent = "🎉";
    particle.style.position = "fixed";
    particle.style.left = Math.random() * window.innerWidth + "px";
    particle.style.top = "-20px";
    particle.style.fontSize = "20px";
    particle.style.animation = "fall 1s linear forwards";
    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

// ====== Filter by category ======
function filterCategory(el, category) {
  document.querySelectorAll(".category-link").forEach(link => link.classList.remove("active"));
  el.classList.add("active");

  activeCategory = category || null;
  localStorage.setItem("activeCategory", activeCategory);
  renderGoals();
}

// ====== Save data to LocalStorage ======
function saveData() {
  localStorage.setItem("goals", JSON.stringify(goals));
}
// ====== Add new category ======
function addCategory() {
  const newCatInput = document.getElementById("newCategory");
  const categoryName = newCatInput.value.trim();
  if (!categoryName) return alert("Please enter a category name");

  // Create category element
  createCategoryElement(categoryName);

  // Save category to localStorage
  const customCategories = JSON.parse(localStorage.getItem("customCategories") || "[]");
  customCategories.push(categoryName);
  localStorage.setItem("customCategories", JSON.stringify(customCategories));

  newCatInput.value = "";
}

// ====== Create category element in sidebar ======
function createCategoryElement(name) {
  const catList = document.getElementById("categoryList");
  const catDiv = document.createElement("div");
  catDiv.classList.add("category-link");
  catDiv.innerHTML = `
    <span class="cat-name" onclick="filterCategory(this.parentElement, '${name}')">${name}</span>
    <span class="cat-delete" onclick="deleteCategory('${name}', this)">×</span>
  `;
  catList.appendChild(catDiv);
}

// ====== Delete category ======
function deleteCategory(name, el) {
  // Remove from UI
  el.parentElement.remove();

  // Remove from localStorage
  let customCategories = JSON.parse(localStorage.getItem("customCategories") || "[]");
  customCategories = customCategories.filter(cat => cat !== name);
  localStorage.setItem("customCategories", JSON.stringify(customCategories));

  // If current filter was this category, reset to All
  if (activeCategory === name) {
    document.querySelectorAll(".category-link").forEach(link => link.classList.remove("active"));
    document.querySelector(".category-link").classList.add("active");
    activeCategory = null;
    localStorage.setItem("activeCategory", activeCategory);
    renderGoals();
  }
}

// ====== Load saved custom categories on page load ======
document.addEventListener("DOMContentLoaded", () => {
  const savedCats = JSON.parse(localStorage.getItem("customCategories") || "[]");
  savedCats.forEach(catName => createCategoryElement(catName));
});

