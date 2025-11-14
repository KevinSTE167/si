/* catalog.js
 - Carga productos desde ../extra/productos/productos.json
 - Búsqueda incremental (mientras tipeas)
 - Filtro por categorías (botones)
 - Ordenar por precio asc/desc
 - Grid fijo de 5 por fila (CSS)
 - Agregar al carrito con cantidad (default 1)
 - Actualiza contador de productos distintos en header
*/
const PRODUCTS_URL = '../extra/productos/productos.json';
let productos = [];
let productosMostrados = [];
const contenedorProd = document.getElementById('contenedor-prod');
const searchBar = document.getElementById('searchBar');
const categoriaBotones = document.querySelectorAll('.categoria-boton');
// util: actualizar el icono contador del carrito en el header (productos distintos)
function updateCartCount(){
const cart = JSON.parse(localStorage.getItem('carrito')||'[]');
const count = cart.length;
document.querySelectorAll('.numero').forEach(el => el.textContent = count);
}
async function loadProducts(){
try{
const res = await fetch(PRODUCTS_URL);
productos = await res.json();
}catch(e){
console.error('Error cargando productos', e);
productos = [];
}
productosMostrados = [...productos];
renderCategories();
showProd(productosMostrados);
updateCartCount();
}
function formatPrice(p){ return Number(p).toFixed(2); }

function showProd(list){
if(!contenedorProd) return;
contenedorProd.innerHTML = '';
list.forEach(prod =>{
const div = document.createElement('div');
div.className = 'producto';
div.innerHTML = `
 <img class="prod-img" src="${escapeHtml(prod.imagen)}" alt="${escapeHtml(prod.titulo)}">
 <div>
 <div class="prod-name">${escapeHtml(prod.titulo)}</div>
 <div class="prod-price">$${formatPrice(prod.precio)}</div>
 </div>
 <div class="prod-actions">
 <input class="qty-input" type="number" min="1" value="1" data-id="${escapeHtml(prod.id)}">
 <button class="add-btn" data-id="${escapeHtml(prod.id)}">Agregar</
button>
 </div>
 `;
contenedorProd.appendChild(div);
});
// attach add-to-cart handlers
document.querySelectorAll('.add-btn').forEach(btn=>
btn.addEventListener('click', (e)=>{
const id = e.currentTarget.dataset.id;
const qtyInput = document.querySelector(`.qty-input[data-id="${id}"]`);
const qty = Math.max(1, Number(qtyInput.value)||1);
addToCart(id, qty);
}));
}
function addToCart(id, qty){
const prod = productos.find(p=> String(p.id)===String(id));
if(!prod) return alert('Producto no encontrado');
let cart = JSON.parse(localStorage.getItem('carrito')||'[]');
const existing = cart.find(i=> String(i.id) === String(id));
if(existing){
existing.cantidad = Number(existing.cantidad) + Number(qty);
} else {
cart.push({ id: prod.id, titulo: prod.titulo, precio: prod.precio,
imagen: prod.imagen, cantidad: Number(qty) });
}
localStorage.setItem('carrito', JSON.stringify(cart));
updateCartCount();
alert(`${qty} x ${prod.titulo} agregado al carrito`);
}
// búsqueda incremental
if(searchBar){
searchBar.addEventListener('input', ()=>{
const q = searchBar.value.trim().toLowerCase();
if(q==='') productosMostrados = [...productos];
else productosMostrados = productos.filter(p =>
p.titulo.toLowerCase().includes(q));
showProd(productosMostrados);
});
}
// categorías dinámicas: los botones que ya tienes en HTML usan ids como 'CB','AU', etc.
function renderCategories(){
// si quisieras generar botones desde JSON podrías hacerlo aquí
// por ahora la página trae botones estáticos — escucha clicks
categoriaBotones.forEach(btn=> btn.addEventListener('click', (e)=>{
categoriaBotones.forEach(b=> b.classList.remove('active'));
e.currentTarget.classList.add('active');
const cat = e.currentTarget.id;
if(cat === 'all' || e.currentTarget.classList.contains('todo')){
productosMostrados = [...productos];
} else {
productosMostrados = productos.filter(p=> p.categoria === cat);
}
showProd(productosMostrados);
}));
}
// ordenar
const btnDesc = document.getElementById('btn-desc');
const btnAsc = document.getElementById('btn-asc');
if(btnDesc) btnDesc.addEventListener('click', ()=>{
productosMostrados.sort((a,b)=> b.precio - a.precio);
showProd(productosMostrados);
});
if(btnAsc) btnAsc.addEventListener('click', ()=>{
productosMostrados.sort((a,b)=> a.precio - b.precio);
showProd(productosMostrados);
});
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s => 
({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]); }
// inicializar
document.addEventListener('DOMContentLoaded', loadProducts);
// Exponer updateCartCount para otras páginas
window.updateCartCount = updateCartCount;
