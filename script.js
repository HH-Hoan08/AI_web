
let isLoginMode = true;
let currentUser = JSON.parse(localStorage.getItem("luxury_user")) || null;
// data
const categories = [
  {icon:'👗',name:'Thời trang',count:'12,500 sản phẩm'},
  {icon:'📱',name:'Điện tử',count:'8,200 sản phẩm'},
  {icon:'👟',name:'Giày dép',count:'5,800 sản phẩm'},
  {icon:'💄',name:'Làm đẹp',count:'7,300 sản phẩm'},
  {icon:'🏠',name:'Nội thất',count:'4,100 sản phẩm'},
  {icon:'⌚',name:'Đồng hồ',count:'2,600 sản phẩm'},
  {icon:'🎮',name:'Gaming',count:'3,900 sản phẩm'},
  {icon:'📚',name:'Sách',count:'15,000 sản phẩm'},
];

const products = [
  {id:1,name:'Nike Air Max 2025',cat:'Giày thể thao',price:2850000,oldPrice:3500000,rating:4.8,reviews:234,icon:'👟',badges:['hot'],desc:'Đôi giày thể thao phong cách với công nghệ Air Max tiên tiến, mang lại sự thoải mái tối đa cho mọi hoạt động.'},
  {id:2,name:'Apple AirPods Pro 3',cat:'Điện tử',price:6990000,oldPrice:8500000,rating:4.9,reviews:567,icon:'🎧',badges:['new','sale'],desc:'Tai nghe không dây cao cấp với tính năng khử tiếng ồn chủ động và âm thanh vòm không gian.'},
  {id:3,name:'Gucci Mini Bag 2025',cat:'Thời trang',price:12500000,rating:4.7,reviews:89,icon:'👜',badges:['new'],desc:'Túi mini phong cách Gucci với da thật cao cấp, thiết kế tinh tế phù hợp cho mọi dịp.'},
  {id:4,name:'Rolex Datejust',cat:'Đồng hồ',price:45000000,oldPrice:52000000,rating:5.0,reviews:45,icon:'⌚',badges:['sale'],desc:'Đồng hồ Rolex Datejust cổ điển với mặt số màu champagne và dây kim loại bóng loáng.'},
  {id:5,name:'Chanel No. 5',cat:'Nước hoa',price:3200000,oldPrice:3800000,rating:4.8,reviews:312,icon:'🌸',badges:['hot'],desc:'Nước hoa huyền thoại Chanel No.5 với hương thơm floral-aldehyde đặc trưng không thể nhầm lẫn.'},
  {id:6,name:'MacBook Pro M4',cat:'Điện tử',price:35000000,rating:5.0,reviews:189,icon:'💻',badges:['new'],desc:'Laptop MacBook Pro với chip M4 mạnh mẽ nhất từ trước đến nay, màn hình Liquid Retina XDR.'},
  {id:7,name:'Adidas Ultraboost 24',cat:'Giày thể thao',price:3200000,oldPrice:4000000,rating:4.6,reviews:423,icon:'👟',badges:['sale'],desc:'Giày chạy bộ với đế Boost energy-return mang lại cảm giác bật nảy tuyệt vời cho mỗi bước chân.'},
  {id:8,name:'Sony WH-1000XM6',cat:'Điện tử',price:8500000,oldPrice:9900000,rating:4.9,reviews:678,icon:'🎧',badges:['hot','sale'],desc:'Tai nghe over-ear với tính năng khử tiếng ồn tốt nhất thị trường, pin 30 giờ nghe nhạc.'},
];

const flashSaleProducts = [
  {name:'Samsung Galaxy S25',icon:'📱',price:8900000,oldPrice:18000000,progress:75,off:51},
  {name:'Dép Birkenstock',icon:'👡',price:890000,oldPrice:2200000,progress:40,off:60},
  {name:'Loa JBL Xtreme 4',icon:'🔊',price:3200000,oldPrice:5500000,progress:85,off:42},
  {name:'Nồi Chiên Philips',icon:'🍳',price:1500000,oldPrice:3200000,progress:60,off:53},
];

const reviews = [
  {text:'Chất lượng sản phẩm tuyệt vời, đóng gói cẩn thận và giao hàng rất nhanh. Sẽ mua lại nhiều lần nữa!',name:'Nguyễn Thị Minh',info:'Khách hàng từ Hà Nội · Đã mua 12 đơn',avatar:'NM',rating:5},
  {text:'Giá cả hợp lý so với chất lượng, mình rất hài lòng. Team support nhiệt tình, giải đáp nhanh chóng.',name:'Trần Văn Hùng',info:'Khách hàng từ TP.HCM · Đã mua 8 đơn',avatar:'TH',rating:5},
  {text:'Website dễ sử dụng, tìm kiếm sản phẩm nhanh, thanh toán tiện lợi. Đây là shop online mình tin tưởng nhất!',name:'Lê Bảo Châu',info:'Khách hàng từ Đà Nẵng · Đã mua 25 đơn',avatar:'LC',rating:5},
  {text:'Nhận hàng đúng hẹn, sản phẩm y chang hình, rất chân thật. Khuyến mãi cũng rất hấp dẫn. 10 điểm!',name:'Phạm Thu Hà',info:'Khách hàng từ Cần Thơ · Đã mua 6 đơn',avatar:'PH',rating:4},
  {text:'Đã mua nhiều lần, lần nào cũng hài lòng. Sản phẩm chính hãng, có tem bảo hành rõ ràng, an tâm mua sắm.',name:'Võ Đình Long',info:'Khách hàng từ Nha Trang · Đã mua 19 đơn',avatar:'VL',rating:5},
  {text:'Flash sale giảm giá thật sự, không ảo. Mình đã mua iPhone và đồng hồ đều rất hài lòng về chất lượng.',name:'Đặng Quỳnh Anh',info:'Khách hàng từ Hải Phòng · Đã mua 11 đơn',avatar:'QA',rating:5},
];

// cart state
let cart = [];
if (currentUser) {
    cart = JSON.parse(
        localStorage.getItem("luxury_cart_" + currentUser.username)
    ) || [];
}
let currentFilter = 'Tất cả';
let currentSlide = 0;
let isDark = false;
let slideInterval;

// init
function init() {
  renderCategories();
  renderProducts();
  renderFlashSale();
  renderReviews();
  renderCart();
  updateNavBadge();
  startSlider();
  setupObserver();
  setupNavScroll();
}

// render categories
function renderCategories() {
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = categories.map(c => `
    <a class="cat-card reveal" onclick="filterByCategory('${c.name}')" href="#products">
      <span class="cat-icon">${c.icon}</span>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.count}</div>
    </a>
  `).join('');
}

// render products
function renderProducts(filter = 'Tất cả') {
  const filters = ['Tất cả', 'Thời trang', 'Điện tử', 'Giày dép', 'Đồng hồ'];
  const filterBar = document.getElementById('filterBar');
  filterBar.innerHTML = `
    <span style="font-weight:600;font-size:0.9rem;color:var(--text-muted);margin-right:8px">Lọc:</span>
    ${filters.map(f => `<button class="filter-chip ${f===filter?'active':''}" onclick="renderProducts('${f}')">${f}</button>`).join('')}
    <div style="margin-left:auto;display:flex;align-items:center;gap:8px">
      <span style="font-size:0.85rem;color:var(--text-muted)">Sắp xếp:</span>
      <select onchange="handleSort(this.value)" style="padding:8px 12px;border-radius:8px;border:1.5px solid var(--border);background:var(--card);color:var(--text);font-family:inherit;font-size:0.85rem;outline:none;cursor:pointer">
        <option>Nổi bật nhất</option>
        <option>Giá tăng dần</option>
        <option>Giá giảm dần</option>
        <option>Mới nhất</option>
        <option>Đánh giá cao</option>
      </select>
    </div>
  `;

  let filtered = filter === 'Tất cả' ? products : products.filter(p => 
    p.cat.includes(filter) || (filter==='Thời trang'&&p.cat==='Thời trang'));

  const grid = document.getElementById('productsGrid');
  grid.innerHTML = filtered.map(p => {
    const discount = p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0;
    return `
    <div class="product-card reveal" onclick="openProduct(${p.id})">
      <div class="product-img">
        <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:6rem;background:var(--bg2)">${p.icon}</div>
        <div class="product-badges">${p.badges.map(b=>`<span class="badge badge-${b}">${b==='new'?'MỚI':b==='sale'?'SALE':b==='hot'?'🔥 HOT':b.toUpperCase()}</span>`).join('')}</div>
        <div class="product-actions">
          <button class="action-btn" onclick="event.stopPropagation();addWishlist(${p.id})" title="Yêu thích">❤️</button>
          <button class="action-btn" onclick="event.stopPropagation();openProduct(${p.id})" title="Xem nhanh">👁</button>
          <button class="action-btn" onclick="event.stopPropagation();addToCart(${p.id})" title="Thêm giỏ">🛒</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-cat">${p.cat}</div>
        <div class="product-name">${p.name}</div>
        <div class="product-rating">
          <span class="stars">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}</span>
          <span class="rating-count">${p.rating} (${p.reviews})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${formatPrice(p.price)}</span>
          ${p.oldPrice?`<span class="price-old">${formatPrice(p.oldPrice)}</span><span class="price-off">-${discount}%</span>`:''}
        </div>
        <button class="add-cart-btn" onclick="event.stopPropagation();addToCart(${p.id})">
          🛒 Thêm vào giỏ
        </button>
      </div>
    </div>`;
  }).join('');
  setupObserver();
}

// render flash sale 
function renderFlashSale() {
  document.getElementById('flashGrid').innerHTML = flashSaleProducts.map(p => `
    <div class="flash-card reveal" onclick="showToast('Thêm ${p.name} vào giỏ hàng!','success')">
      <div class="flash-img">
        ${p.icon}
        <div class="flash-progress"><div class="flash-progress-bar" style="width:${p.progress}%"></div></div>
      </div>
      <div class="flash-info">
        <div class="flash-name">${p.name}</div>
        <div class="flash-price">
          <span class="flash-price-cur">${formatPrice(p.price)}</span>
          <span class="flash-price-old">${formatPrice(p.oldPrice)}</span>
          <span style="background:var(--accent);color:white;font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:6px;margin-left:auto">-${p.off}%</span>
        </div>
        <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:8px">Đã bán: ${p.progress}%</div>
      </div>
    </div>
  `).join('');
}

// render reviews
function renderReviews() {
  document.getElementById('reviewsGrid').innerHTML = reviews.map(r => `
    <div class="review-card reveal">
      <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
      <p class="review-text">${r.text}</p>
      <div class="reviewer">
        <div class="reviewer-avatar">${r.avatar}</div>
        <div>
          <div class="reviewer-name">${r.name}</div>
          <div class="reviewer-info">${r.info}</div>
        </div>
      </div>
    </div>
  `).join('');
}

// product modal
function openProduct(id) {
  const p = products.find(x => x.id===id);
  if(!p) return;
  const discount = p.oldPrice ? Math.round((1-p.price/p.oldPrice)*100) : 0;
  document.getElementById('modalGrid').innerHTML = `
    <div class="modal-img">${p.icon}</div>
    <div class="modal-info">
      <div class="modal-cat">${p.cat}</div>
      <div class="modal-name">${p.name}</div>
      <div class="modal-rating">
        <span style="color:#f4a261;font-size:1rem">${'★'.repeat(Math.floor(p.rating))}</span>
        <span style="font-size:0.9rem;color:var(--text-muted);font-weight:600">${p.rating} · ${p.reviews} đánh giá</span>
      </div>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-price-row">
        <span class="modal-price">${formatPrice(p.price)}</span>
        ${p.oldPrice?`<span class="modal-old">${formatPrice(p.oldPrice)}</span><span style="background:rgba(230,57,70,0.1);color:var(--accent);padding:4px 10px;border-radius:8px;font-size:0.8rem;font-weight:700">-${discount}%</span>`:''}
      </div>
      <div style="margin-bottom:20px">
        <div style="font-size:0.85rem;font-weight:600;margin-bottom:10px;color:var(--text-muted)">Kích thước:</div>
        <div style="display:flex;gap:8px">${['S','M','L','XL','XXL'].map(s=>`<button onclick="selectSize(this)" style="padding:8px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;font-family:inherit;font-weight:600;color:var(--text);transition:all 0.2s">${s}</button>`).join('')}</div>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" onclick="addToCart(${p.id});closeProductModal()" style="width:100%;justify-content:center;border-radius:12px">🛒 Thêm vào giỏ</button>
        <button class="btn-secondary" onclick="closeProductModal()" style="width:100%;justify-content:center;border-radius:12px">❤️ Yêu thích</button>
      </div>
      <div style="margin-top:16px;padding:16px;background:var(--bg2);border-radius:12px;font-size:0.82rem;color:var(--text-muted);display:flex;gap:16px;flex-wrap:wrap">
        <span>✅ Chính hãng 100%</span>
        <span>🚚 Giao trong 2-3 ngày</span>
        <span>🔄 Đổi trả 30 ngày</span>
      </div>
    </div>
  `;
  document.getElementById('productModal').classList.add('open');
}
function closeProductModal(){document.getElementById('productModal').classList.remove('open')}
function closeModal(e){if(e.target===document.getElementById('productModal'))closeProductModal()}
function selectSize(btn){btn.closest('div').querySelectorAll('button').forEach(b=>b.style.cssText='padding:8px 16px;border-radius:10px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;font-family:inherit;font-weight:600;color:var(--text);transition:all 0.2s');btn.style.cssText='padding:8px 16px;border-radius:10px;border:2px solid var(--accent);background:rgba(230,57,70,0.1);cursor:pointer;font-family:inherit;font-weight:700;color:var(--accent);transition:all 0.2s'}

// cart function
function addToCart(id) {

    // kiem tra dang nhap
    if (!currentUser) {
        showToast("⚠️ Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng", "error");
        openAuthModal();
        return;
    }

    const product = products.find(p => p.id === id);

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({
            ...product,
            qty: 1
        });
    }

    saveCart();
    renderCart();
    updateNavBadge();

    showToast("✅ Đã thêm sản phẩm vào giỏ hàng", "success");
}

function removeFromCart(id) {
  cart=cart.filter(c=>c.id!==id);
  saveCart();
  renderCart();
  updateNavBadge()
}

function changeQty(id,delta){
  const item=cart.find(c=>c.id===id);
  if(!item)
    return;
  item.qty+=delta;
  if(item.qty<=0)
    removeFromCart(id);
  else {
    saveCart();
    renderCart();
  }
}

function saveCart() {
    if (!currentUser) return;

    localStorage.setItem(
        "luxury_cart_" + currentUser.username,
        JSON.stringify(cart)
    );
}

function updateNavBadge(){
  const total=cart.reduce((s,c)=>s+c.qty,0);
  const badge=document.getElementById('cartBadge');
  badge.textContent=total;
  badge.style.display=total>0?'flex':'none';
}

function renderCart(){
  const container=document.getElementById('cartItems');
  const footer=document.getElementById('cartFooter');
  if(cart.length===0){
    container.innerHTML=`<div style="text-align:center;padding:60px 0;color:var(--text-muted)"><div style="font-size:4rem;margin-bottom:16px">🛒</div><p style="font-weight:600">Giỏ hàng trống</p><p style="font-size:0.85rem;margin-top:8px">Hãy thêm sản phẩm vào giỏ nhé!</p></div>`;
    footer.style.display='none';
  } else {
    const total=cart.reduce((s,c)=>s+c.price*c.qty,0);
    container.innerHTML=cart.map(c=>`
      <div class="cart-item">
        <div class="cart-item-img">${c.icon}</div>
        <div class="cart-item-info">
          <div class="cart-item-name">${c.name}</div>
          <div class="cart-item-price">${formatPrice(c.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${c.id},-1)">−</button>
            <span class="qty-num">${c.qty}</span>
            <button class="qty-btn" onclick="changeQty(${c.id},1)">+</button>
          </div>
        </div>
        <button class="remove-item" onclick="removeFromCart(${c.id})">🗑</button>
      </div>
    `).join('');
    document.getElementById('cartSubtotal').textContent=formatPrice(total);
    document.getElementById('cartTotal').textContent=formatPrice(total);
    footer.style.display='block';
  }
}

function toggleCart(){
  document.getElementById('cartSidebar').classList.toggle('open');
  document.getElementById('cartOverlay').classList.toggle('open');
}

function checkout(){
  if(cart.length===0)return showToast('Giỏ hàng trống!','error');
  toggleCart();
  setTimeout(()=>{
    showToast('🎉 Cảm ơn bạn đã đặt hàng!!!' ,'success');
    cart=[];saveCart();renderCart();updateNavBadge();
  },300);
}

// search 
function toggleSearch() {
    document.getElementById('searchOverlay').classList.toggle('open');
    setTimeout(()=>document.getElementById('bigSearchInput').focus(),100)
}

function closeSearch(e) {
    if(e.target===document.getElementById('searchOverlay'))
        toggleSearch()
}

function handleSearch(v) {
    if(v.length>1)
        showToast(`Đang tìm: "${v}"...`,'success')
    }
document.addEventListener('keydown',e=> {
    if(e.key==='Escape'){closeProductModal();
        document.getElementById('searchOverlay').classList.remove('open')
    }
    if((e.ctrlKey||e.metaKey)&&e.key==='k') {
        e.preventDefault();toggleSearch()
    }
    }
);

// slider
function goSlide(n){
  currentSlide=n;
  document.getElementById('slidesTrack').style.transform=`translateX(-${n*100}%)`;
  document.querySelectorAll('.dot').forEach((d,i)=>{d.classList.toggle('active',i===n)});
}

function changeSlide(d) {
    goSlide((currentSlide+d+3)%3)
}

function startSlider() {
    slideInterval=setInterval(()=>changeSlide(1),5000)
}

document.getElementById('bannerSlider').addEventListener('mouseenter',()=>clearInterval(slideInterval));
document.getElementById('bannerSlider').addEventListener('mouseleave',()=>{startSlider()});

// countdown
let endTime=new Date().getTime()+8*3600000+45*60000+30000;
function updateCountdown(){
  const diff=endTime-new Date().getTime();
  if(diff<0) {
    endTime=new Date().getTime()+12*3600000;return
  }
  const h=Math.floor(diff/3600000);
  const m=Math.floor((diff%3600000)/60000);
  const s=Math.floor((diff%60000)/1000);
  document.getElementById('countH').textContent=String(h).padStart(2,'0');
  document.getElementById('countM').textContent=String(m).padStart(2,'0');
  document.getElementById('countS').textContent=String(s).padStart(2,'0');
}

setInterval(updateCountdown,1000);

// toast
function showToast(msg,type='success'){
  const c=document.getElementById('toastContainer');
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`<span class="toast-icon">${type==='success'?'✅':'❌'}</span><span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  c.appendChild(t);
  setTimeout(()=>t.remove(),4000);
}

// theme
function toggleTheme(){
  isDark=!isDark;
  document.documentElement.setAttribute('data-theme',isDark?'dark':'light');
  document.querySelector('.theme-toggle').textContent=isDark?'☀️':'🌙';
}

// scroll observer
function setupObserver(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
  },{threshold:0.1,rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));
}

// nav scroll
function setupNavScroll(){
  window.addEventListener('scroll',()=>{
    document.getElementById('navbar').classList.toggle('scrolled',window.scrollY>50);
  });
}

// lazy load img
document.querySelectorAll("img").forEach(img => {
  img.setAttribute("loading", "lazy");
});

// helpers
function formatPrice(n) {
    return n.toLocaleString('vi-VN')+'₫'
}

function filterByCategory(cat) {
    renderProducts(cat)
}

function openCategory(name) {
    showToast(`Đang xem: ${name}`,'success')
}

function addWishlist(id) {
    const p=products.find(x=>x.id===id);
    showToast(`❤️ Đã thêm "${p.name}" vào danh sách yêu thích!`,'success')
}

function handleSort(v) {
    showToast(`Sắp xếp theo: ${v}`,'success')
}

function showProfile() {
    if (!currentUser) {
        showToast("Vui lòng đăng nhập để xem hồ sơ",'error');
        return;
    }
    openProfileModal();
}

function subscribe() {
    const e=document.getElementById('emailInput').value;
    if(!e) {
        showToast('Vui lòng nhập email!','error');
        return
    }
    showToast(`✅ Đăng ký thành công: ${e}`,'success');
    document.getElementById('emailInput').value=''
}

function toggleMenu() {
    showToast('📱 Menu mobile đang được phát triển','success')
}

// auth state


// open modal 
function openAuthModal() {
    document.getElementById("authModal").style.display = "flex";
}

function closeAuthModal() {
    document.getElementById("authModal").style.display = "none";
}

// toggle login / register
function toggleAuthMode() {
    isLoginMode = !isLoginMode;

    document.getElementById("authTitle").innerText = 
        isLoginMode ? "Đăng nhập" : "Đăng ký";

    document.getElementById("switchAuth").innerHTML = 
        isLoginMode
        ? `Chưa có tài khoản? <span onclick="toggleAuthMode()">Đăng ký</span>`
        : `Đã có tài khoản? <span onclick="toggleAuthMode()">Đăng nhập</span>`;
}
// modal open, close, toggle login/register, handle auth (login/register), update UI after auth, logout
// handle auth
function handleAuth() {
    const username = document.getElementById("authUsername").value;
    const password = document.getElementById("authPassword").value;

    if (!username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    let users = JSON.parse(localStorage.getItem("luxury_users")) || [];

    if (isLoginMode) {
        const user = users.find(u => 
            u.username === username && u.password === password
        );

        if (!user) {
            alert("Sai tài khoản hoặc mật khẩu!");
            return;
        }

        currentUser = user;
        localStorage.setItem("luxury_user", JSON.stringify(user));
        alert("Đăng nhập thành công!");
    } 
    else {
        if (users.some(u => u.username === username)) {
            alert("Tên đăng nhập đã tồn tại!");
            return;
        }

        const newUser = { username, password };
        users.push(newUser);
        localStorage.setItem("luxury_users", JSON.stringify(users));

        alert("Đăng ký thành công! Hãy đăng nhập.");
        toggleAuthMode();
        return;
    }

    updateUserUI();
    closeAuthModal();
}

// profile modal 
function openProfileModal() {
    document.getElementById("profileUsername").innerText = currentUser.username;
    document.getElementById("profileModal").style.display = "flex";
}

function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
}

// update UI
function updateUserUI() {
    const greeting = document.getElementById("userGreeting");
    const loginBtn = document.querySelector(".login-btn");

    if (currentUser) {
        greeting.innerHTML = `
        <span class="user-name">Xin chào, ${currentUser.username}</span>
        <button class="logout-btn" onclick="logout()">Đăng xuất</button> `;
        loginBtn.style.display = "none";
    } else {
        greeting.innerHTML = "";
        loginBtn.style.display = "inline-block";
    }
}

// logout
function logout() {
    currentUser = null;
    localStorage.removeItem("luxury_user");
    updateUserUI();
}

// start
window.addEventListener("DOMContentLoaded", init);