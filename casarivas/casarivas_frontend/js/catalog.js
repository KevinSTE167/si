/* catalog.js
 - Carga productos desde ../extra/productos/productos.json
 - Búsqueda incremental
 - Filtro por categorías
 - Ordenar por precio asc/desc
 - Agregar al carrito con cantidad (VISIBLE)
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
    
    // Al cargar, muestra todos los productos (vista por defecto sin filtro activo)
    productosMostrados = [...productos];
    renderCategories();
    showProd(productosMostrados);
    updateCartCount();
}

function formatPrice(p){ return Number(p).toFixed(2); }

function showProd(list){
    if(!contenedorProd) return;
    contenedorProd.innerHTML = '';
    
    if (list.length === 0) {
        contenedorProd.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; padding: 3rem 0; color: var(--clr-main-nav); font-style: italic;">No se encontraron productos en esta categoría o con este criterio de búsqueda.</p>';
        return;
    }

    list.forEach(prod =>{
        const div = document.createElement('div');
        div.className = 'producto';
        div.innerHTML = `
            <img class="prod-img" src="${escapeHtml(prod.imagen)}" alt="${escapeHtml(prod.titulo)}">
            <div class="prod-detail">
                <div class="prod-name">${escapeHtml(prod.titulo)}</div>
                <div class="prod-precio">$${formatPrice(prod.precio)}</div>
                <div class="prod-actions">
                    <input class="qty-input" type="number" min="1" value="1" step="1" data-id="${escapeHtml(prod.id)}">
                    <button class="prod-agregar" data-id="${escapeHtml(prod.id)}">Agregar al Carrito</button>
                </div>
            </div>
        `;
        contenedorProd.appendChild(div);
    });

    // adjuntar manejadores de agregar al carrito
    document.querySelectorAll('.prod-agregar').forEach(btn=>
        btn.addEventListener('click', (e)=>{
            const id = e.currentTarget.dataset.id;
            const qtyInput = document.querySelector(`.qty-input[data-id="${id}"]`);
            
            // 🎯 CORRECCIÓN: Trunca el valor a un entero antes de usarlo.
            const rawQty = Number(qtyInput.value);
            const qty = Math.max(1, Math.floor(rawQty) || 1);
            
            // Actualiza el input visualmente
            qtyInput.value = qty; 

            addToCart(id, qty);
        })
    );
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
    alert(`¡${qty} x ${prod.titulo} agregado al carrito!`);
}

// búsqueda incremental
if(searchBar){
    searchBar.addEventListener('input', ()=>{
        const q = searchBar.value.trim().toLowerCase();
        let currentCat = document.querySelector('.categoria-boton.active')?.id;
        
        let baseList = currentCat ? productos.filter(p=> p.categoria === currentCat) : productos;

        if(q==='') productosMostrados = baseList;
        else productosMostrados = baseList.filter(p => p.titulo.toLowerCase().includes(q));

        showProd(productosMostrados);
    });
}

// categorías dinámicas
function renderCategories(){
    categoriaBotones.forEach(btn=> btn.addEventListener('click', (e)=>{
        categoriaBotones.forEach(b=> b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        const cat = e.currentTarget.id;
        
        // Filtra por categoría
        productosMostrados = productos.filter(p=> p.categoria === cat);
        showProd(productosMostrados);
        
        // Limpiar búsqueda
        if(searchBar) searchBar.value = '';
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

function escapeHtml(str){ 
    return String(str).replace(/[&<>"']/g, s => 
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]); 
}

// inicializar
document.addEventListener('DOMContentLoaded', loadProducts);
window.updateCartCount = updateCartCount;