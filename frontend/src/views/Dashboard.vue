<template>
  <div class="app-container">
    <Sidebar :is-open="sidebarOpen" @close-sidebar="sidebarOpen = false" />
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="content-area">
        <div class="row mb-4">
          <div class="col-12">
            <h2>¡Bienvenido, {{ user?.nombre }}!</h2>
            <p class="text-muted">Panel principal del Sistema Jey2</p>
          </div>
        </div>

        <div class="row">
          <div class="col-md-3 col-sm-6">
            <div class="stats-card stats-card-primary">
              <i class="bi bi-currency-dollar fs-1"></i>
              <h3>${{ metricas.ventas_hoy?.toFixed(2) || '0.00' }}</h3>
              <p>Ventas Hoy</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="stats-card stats-card-success">
              <i class="bi bi-box-seam fs-1"></i>
              <h3>{{ metricas.productos_en_stock || 0 }}</h3>
              <p>Productos en Stock</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="stats-card stats-card-warning">
              <i class="bi bi-exclamation-triangle fs-1"></i>
              <h3>{{ metricas.alertas_pendientes || 0 }}</h3>
              <p>Alertas Pendientes</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6">
            <div class="stats-card stats-card-danger">
              <i class="bi bi-cart-check fs-1"></i>
              <h3>{{ metricas.ordenes_pendientes || 0 }}</h3>
              <p>Órdenes Pendientes</p>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <i class="bi bi-info-circle me-2"></i>Estado del Sistema
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between mb-3">
                  <span>Backend API</span>
                  <span class="badge bg-success">Conectado</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span>Base de Datos</span>
                  <span class="badge bg-success">Operativa</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span>Rol del Usuario</span>
                  <span class="badge bg-primary">{{ user?.rol }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <i class="bi bi-lightning-charge me-2"></i>Accesos Rápidos
              </div>
              <div class="card-body">
                <div class="d-grid gap-2">
                  <router-link to="/ventas" class="btn btn-outline-primary">
                    <i class="bi bi-cart-plus me-2"></i>Nueva Venta
                  </router-link>
                  <router-link to="/inventario" class="btn btn-outline-success">
                    <i class="bi bi-box-seam me-2"></i>Ver Inventario
                  </router-link>
                  <router-link to="/compras" class="btn btn-outline-warning">
                    <i class="bi bi-bag-plus me-2"></i>Nueva Orden de Compra
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/common/Navbar.vue';
import Sidebar from '../components/common/Sidebar.vue';
import authService from '../services/auth';
import reportesService from '../services/reportes';

export default {
  name: 'Dashboard',
  components: { Navbar, Sidebar },
  setup() {
    const sidebarOpen = ref(false);
    const user = computed(() => authService.getCurrentUser());
    const metricas = ref({});

    const cargarMetricas = async () => {
      try {
        const response = await reportesService.obtenerDashboardMetricas();
        metricas.value = response.data;
      } catch (error) {
        console.error('Error al cargar métricas:', error);
      }
    };

    onMounted(() => {
      cargarMetricas();
    });

    return { sidebarOpen, user, metricas };
  }
};
</script>