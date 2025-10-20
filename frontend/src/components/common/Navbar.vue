<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white navbar-custom">
    <div class="container-fluid">
      <!-- Botón menú móvil -->
      <button class="btn btn-link d-lg-none" @click="$emit('toggle-sidebar')">
        <i class="bi bi-list fs-4"></i>
      </button>

      <!-- Título de la página -->
      <span class="navbar-brand mb-0 h1">{{ pageTitle }}</span>

      <!-- Usuario -->
      <div class="dropdown ms-auto">
        <button
          ref="dropdownBtn"
          class="btn btn-link text-decoration-none dropdown-toggle d-flex align-items-center"
          type="button"
          id="userDropdown"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person-circle fs-4 me-2"></i>
          <span class="d-none d-md-inline">{{ user?.nombre || 'Usuario' }}</span>
        </button>
        <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
          <li>
            <span class="dropdown-item-text">
              <strong>{{ user?.nombre }}</strong><br>
              <small class="text-muted">{{ user?.email }}</small><br>
              <span class="badge bg-primary mt-1">{{ user?.rol }}</span>
            </span>
          </li>
          <li><hr class="dropdown-divider"></li>
          <li>
            <a class="dropdown-item" href="#" @click.prevent="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>
              Cerrar Sesión
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import authService from '../../services/auth';
import { Dropdown } from 'bootstrap';

export default {
  name: 'Navbar',
  emits: ['toggle-sidebar'],
  setup() {
    const router = useRouter();
    const route = useRoute();
    const dropdownBtn = ref(null);
    let dropdownInstance = null;
    
    const user = computed(() => authService.getCurrentUser());
    
    const pageTitle = computed(() => {
      const titles = {
        'Dashboard': 'Dashboard',
        'Inventario': 'Gestión de Inventario',
        'Ventas': 'Punto de Venta',
        'Compras': 'Gestión de Compras',
        'Reportes': 'Reportes y Análisis'
      };
      return titles[route.name] || 'Sistema Jey2';
    });

    const handleLogout = () => {
      console.log('🚪 Cerrando sesión...');
      
      if (confirm('¿Estás seguro de cerrar sesión?')) {
        if (dropdownInstance) {
          dropdownInstance.hide();
        }
        
        console.log('✅ Usuario confirmó logout');
        authService.logout();
        
        console.log('🧹 localStorage limpiado');
        console.log('Token:', localStorage.getItem('token'));
        console.log('User:', localStorage.getItem('user'));
        
        router.push('/login').then(() => {
          console.log('✅ Redirigiendo a login');
          window.location.reload();
        });
      }
    };

    // ✅ Función para inicializar dropdown esperando a que Bootstrap esté disponible
    const initializeDropdown = () => {
      let attempts = 0;
      const maxAttempts = 50; // 5 segundos máximo (50 * 100ms)

      const tryInit = () => {
        attempts++;
        
        // Verificar si Bootstrap está disponible
        if (typeof window.bootstrap !== 'undefined' && dropdownBtn.value) {
          try {
            dropdownInstance = new window.bootstrap.Dropdown(dropdownBtn.value);
            console.log('✅ Bootstrap Dropdown inicializado correctamente');
            return true;
          } catch (error) {
            console.error('❌ Error al inicializar dropdown:', error);
            return false;
          }
        }
        
        // Si no está disponible y no hemos llegado al máximo, reintentar
        if (attempts < maxAttempts) {
          console.log(`⏳ Esperando Bootstrap... intento ${attempts}/${maxAttempts}`);
          setTimeout(tryInit, 100); // Reintentar cada 100ms
        } else {
          console.error('❌ Bootstrap no se cargó después de múltiples intentos');
        }
      };

      tryInit();
    };

    onMounted(() => {
      initializeDropdown();
      console.log('👤 Usuario actual:', user.value);
    });

    onBeforeUnmount(() => {
      if (dropdownInstance) {
        dropdownInstance.dispose();
        console.log('🧹 Dropdown limpiado');
      }
    });

    return {
      user,
      pageTitle,
      dropdownBtn,
      handleLogout
    };
  }
};
</script>

<style scoped>
.navbar-custom {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-bottom: 1px solid #e0e0e0;
}

.dropdown-menu {
  min-width: 250px;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  cursor: pointer;
}

.btn-link {
  color: #333;
  text-decoration: none;
}

.btn-link:hover {
  color: #0d6efd;
}

.dropdown-item-text {
  padding: 0.75rem 1rem;
}

.badge {
  font-size: 0.75rem;
}
</style>