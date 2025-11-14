/* auth.js
 - Maneja login/registro en frontend 
 - Si tus servlets backend están disponibles, intenta usarlos; si fallan, cae
a almacenamiento local (solo prototipo)
 - Guarda sesión en localStorage key 'user'
*/
function httpPost(url, data){
return fetch(url, { method: 'POST', headers: {'Content-Type':'application/x-www-form-urlencoded'}, body: new URLSearchParams(data) });
}
// UTILS
function getUsersLocal(){ return JSON.parse(localStorage.getItem('users') ||
'[]'); }
function saveUsersLocal(u){ localStorage.setItem('users',
JSON.stringify(u)); }
// Registro (registro.html)
async function handleRegister(e){
e.preventDefault();
const nombre = document.getElementById('nombre').value.trim();
const correo = document.getElementById('correo').value.trim();
const contrasena = document.getElementById('contrasena').value;
const direccion = document.getElementById('direccion').value.trim();
const telefono = document.getElementById('telefono').value.trim();
if(!nombre || !correo || !contrasena) return alert('Completa los campos obligatorios');
// Intentar backend primero
try{
const res = await httpPost('http://localhost:8080/casa_rivas/RegistroServlet', {nombre, correo, contrasena, direccion, telefono});
if(res.ok){
document.getElementById('success-msg') &&
(document.getElementById('success-msg').textContent = 'Registro exitoso. Ahora inicia sesión.');
document.getElementById('registerForm') &&
document.getElementById('registerForm').reset();
return;
}
}catch(e){
// sigue a almacenamiento local
}
// fallback: guardar en localStorage (solo para prototipo)
const users = getUsersLocal();
if(users.some(u=> u.correo === correo)) return alert('Ya existe una cuenta con ese correo');
users.push({ nombre, correo, contrasena, direccion, telefono });
saveUsersLocal(users);
document.getElementById('success-msg') && (document.getElementById('success-msg').textContent = 'Registro guardado localmente. Inicia sesión.');
document.getElementById('registerForm') &&
document.getElementById('registerForm').reset();
}
// Login (login.html)
async function handleLogin(e){
e.preventDefault();
const correo = document.getElementById('correo').value.trim();
const contrasena = document.getElementById('contrasena').value;
// intentar backend
try{
const res = await httpPost('http://localhost:8080/casa_rivas/LoginServlet', {correo, contrasena});
if(res.ok){
const json = await res.json();
if(json.status === 'ok'){
localStorage.setItem('user', JSON.stringify({ nombre: json.nombre,
correo }));
const destino = sessionStorage.getItem('ultimaPagina') || './perfil.html';
window.location.href = destino;
return;
}
}
}catch(e){
// fallback
}
// fallback local
const users = getUsersLocal();
const u = users.find(x=> x.correo===correo && x.contrasena===contrasena);
if(!u) return document.getElementById('error-msg') &&
(document.getElementById('error-msg').textContent = 'Credenciales inválidas');
localStorage.setItem('user', JSON.stringify({ nombre: u.nombre, correo:
u.correo }));
const destino = sessionStorage.getItem('ultimaPagina') || './perfil.html';
window.location.href = destino;
}
// Logout
async function handleLogout(){
try{ await fetch('http://localhost:8080/casa_rivas/SesionServlet', {
method:'POST' }); }catch(e){}
localStorage.removeItem('user');
// actualizar header
renderHeaderAuth();
window.location.href = './index.html';
}
// Header: mostrar 'Hola, nombre' y boton cerrar sesion
function renderHeaderAuth(){
const nav = document.querySelector('.nav-links');
if(!nav) return;
// eliminar previos custom
const existing = nav.querySelector('.user-pill');
if(existing) existing.remove();
const user = JSON.parse(localStorage.getItem('user') || 'null');
if(user){
const li = document.createElement('li'); li.className = 'user-pill';
li.innerHTML = `<a class="boton-menu" href="./perfil.html">Hola, ${escapeHtml(user.nombre)}</a>`;
nav.appendChild(li);
const li2 = document.createElement('li'); li2.className = 'user-pill';
li2.innerHTML = `<a class="boton-menu" href="#" id="logoutBtn">Cerrar
sesión</a>`;
nav.appendChild(li2);
// remover link login si existe
const loginLink = nav.querySelector('a[href="./login.html"]');
if(loginLink) loginLink.parentElement.remove();
}
}
// utilidad
function escapeHtml(str){ return String(str).replace(/[&<>"']/g, s =>
({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[s]); }
// listeners globales
document.addEventListener('DOMContentLoaded', ()=>{
renderHeaderAuth();
const loginForm = document.getElementById('loginForm');
if(loginForm) loginForm.addEventListener('submit', handleLogin);
const registerForm = document.getElementById('registerForm');
if(registerForm) registerForm.addEventListener('submit', handleRegister);
document.addEventListener('click', (e)=>{
if(e.target && e.target.id === 'logoutBtn'){
e.preventDefault(); handleLogout();
}
});
// Si estamos en perfil.html mostrar nombre
const nombreUsuario = document.getElementById('nombre-usuario');
const u = JSON.parse(localStorage.getItem('user')||'null');
if(nombreUsuario && u){ nombreUsuario.textContent = `Nombre: ${u.nombre} —
Correo: ${u.correo}`; }
});