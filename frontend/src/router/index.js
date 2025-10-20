import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/auth';

// Importar vistas
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Inventario from '../views/Inventario.vue';
import Ventas from '../views/Ventas.vue';
import Compras from '../views/Compras.vue';
import Reportes from '../views/Reportes.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {requiresAuth: false}
  },
  {
    path: '/',
    name: 'Home',
    redirect: () => {
      return authService.isAuthenticated() ? '/dashboard' : '/login';
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/inventario',
    name: 'Inventario',
    component: Inventario,
    meta: { requiresAuth: true }
  },
  {
    path: '/ventas',
    name: 'Ventas',
    component: Ventas,
    meta: { requiresAuth: true }
  },
  {
    path: '/compras',
    name: 'Compras',
    component: Compras,
    meta: { requiresAuth: true }
  },
  {
    path: '/reportes',
    name: 'Reportes',
    component: Reportes,
    meta: { requiresAuth: true }
  },
  {
    path: '/pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  console.log('🔒 Navigation Guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth
  });

  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      console.log('❌ No autenticado, redirigiendo a login');
      return next('/login');
    }
  }

  // Si intenta ir al login estando autenticado
  if (to.path === '/login' && isAuthenticated) {
    console.log('✅ Ya autenticado, redirigiendo a dashboard');
    return next('/dashboard');
  }

  console.log('✅ Navegación permitida');
  next();
});

export default router;