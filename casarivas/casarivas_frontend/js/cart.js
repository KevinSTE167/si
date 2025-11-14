/* cart.js – Carrito funcional */

/* Util */
function escapeHtml(str){ 
    return String(str).replace(/[&<>"']/g, s =>
        ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])
    );
}

function getCart(){ 
    return JSON.parse(localStorage.getItem('carrito') || '[]'); 
}

function saveCart(c){
    localStorage.setItem('carrito', JSON.stringify(c));
    window.updateCartCount && window.updateCartCount();
}

/* Elementos */
const container = document.getElementById('carrito-container');
const totalElem = document.getElementById('total-general');
const btnComprar = document.getElementById('btn-comprar');
const btnVaciar = document.getElementById('btn-vaciar');

/* Render */
function renderCart(){
    const cart = getCart();

    if(!container) return;
    container.innerHTML = '';
    
    // Controlar visibilidad de la sección de acciones/resumen
    const resumenDiv = document.getElementById('carrito-resumen');
    if (resumenDiv) resumenDiv.style.display = cart.length === 0 ? 'none' : 'block';

    if(cart.length === 0){
        container.innerHTML = '<p style="grid-column: 1 / -1;" class="carrito-vacio">Tu carrito está vacío. ¡Explora el <a href="./catalogo.html">catálogo</a>!</p>';
        if(totalElem) totalElem.textContent = '$0.00';
        return;
    }

    let total = 0;

    cart.forEach((item, idx) =>{
        const subtotal = Number(item.precio) * Number(item.cantidad);
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'cart-prod';
        div.innerHTML = `
            <img class="cart-img-prod" src="${escapeHtml(item.imagen)}" alt="${escapeHtml(item.titulo)}">
            <div class="cart-prod-info">
                <div class="cart-pn">${escapeHtml(item.titulo)}</div>
                <div class="cart-prod-details">
                    <small>Precio: $${Number(item.precio).toFixed(2)}</small>
                    <small>
                        Cant.: <input type="number" min="1" value="${item.cantidad}" step="1" data-idx="${idx}" class="qty-cart">
                    </small>
                </div>
                <div class="cart-prod-subtotal">Subtotal: $${subtotal.toFixed(2)}</div>
            </div>
            <button class="cart-prod-delete" data-idx="${idx}">Eliminar</button>
        `;
        container.appendChild(div);
    });

    if(totalElem) totalElem.textContent = `$${total.toFixed(2)}`;

    /* Handlers */
    document.querySelectorAll('.qty-cart').forEach(inp =>
        inp.addEventListener('change', (e)=>{
            const idx = Number(e.target.dataset.idx);
            
            // 🎯 CORRECCIÓN: Trunca el valor a un entero y asegura que sea al menos 1
            const rawVal = Number(e.target.value);
            const intVal = Math.max(1, Math.floor(rawVal) || 1);
            
            // Actualiza el input visualmente
            e.target.value = intVal;

            const cart = getCart();
            cart[idx].cantidad = intVal;
            saveCart(cart);
            renderCart(); 
        })
    );

    document.querySelectorAll('.cart-prod-delete').forEach(btn =>
        btn.addEventListener('click', (e)=>{
            const idx = Number(e.currentTarget.dataset.idx);
            const cart = getCart(); 
            cart.splice(idx, 1); 
            saveCart(cart); 
            renderCart();
        })
    );
}

// Nuevo: Vaciar Carrito function
if(btnVaciar) btnVaciar.addEventListener('click', ()=>{
    if(getCart().length === 0) return;
    if(!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;
    saveCart([]);
    renderCart();
});

/* Comprar */
btnComprar && btnComprar.addEventListener('click', ()=>{
    const cart = getCart();
    if(cart.length === 0) return alert('El carrito está vacío');

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    if(!user){
        if(confirm('Debes iniciar sesión para finalizar la compra. Ir a iniciar sesión ahora?')){
            sessionStorage.setItem('ultimaPagina','./carrito.html');
            window.location.href = './login.html';
        }
        return;
    }

    if(!confirm('¿Deseas realizar la compra?')) return;

    alert('Compra realizada con éxito. Muchas gracias.');
    saveCart([]);
    renderCart();
});

/* Init */
document.addEventListener('DOMContentLoaded', ()=>{
    renderCart();
    window.updateCartCount && window.updateCartCount();
});