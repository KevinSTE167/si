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

/* Render */
function renderCart(){
    const cart = getCart();

    if(!container) return;
    container.innerHTML = '';

    if(cart.length === 0){
        container.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
        if(totalElem) totalElem.textContent = '$0.00';
        return;
    }

    let total = 0;

    cart.forEach((item, idx) =>{
        const subtotal = Number(item.precio) * Number(item.cantidad);
        total += subtotal;

        const div = document.createElement('div');
        div.className = 'carrito-item';
        div.innerHTML = `
            <img class="prod-img" src="${escapeHtml(item.imagen)}" alt="${escapeHtml(item.titulo)}">
            <div class="prod-name">${escapeHtml(item.titulo)}</div>
            <div>Precio unit.: $${Number(item.precio).toFixed(2)}</div>
            <div>Cantidad: <input type="number" min="1" value="${item.cantidad}" data-idx="${idx}" class="qty-cart"></div>
            <div>Subtotal: $<span class="sub" data-idx="${idx}">${subtotal.toFixed(2)}</span></div>
            <div><button class="remove-btn" data-idx="${idx}">Eliminar</button></div>
        `;
        container.appendChild(div);
    });

    if(totalElem) totalElem.textContent = `$${total.toFixed(2)}`;

    /* Handlers */
    document.querySelectorAll('.qty-cart').forEach(inp =>
        inp.addEventListener('change', (e)=>{
            const idx = Number(e.target.dataset.idx);
            const val = Math.max(1, Number(e.target.value) || 1);
            const cart = getCart();
            cart[idx].cantidad = val;
            saveCart(cart);
            renderCart();
        })
    );

    document.querySelectorAll('.remove-btn').forEach(btn =>
        btn.addEventListener('click', (e)=>{
            const idx = Number(e.currentTarget.dataset.idx);
            const cart = getCart(); 
            cart.splice(idx, 1); 
            saveCart(cart); 
            renderCart();
        })
    );
}

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
