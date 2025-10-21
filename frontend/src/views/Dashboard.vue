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

        <!-- Métricas Principales -->
        <div class="row">
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="stats-card stats-card-primary">
              <i class="bi bi-currency-dollar fs-1"></i>
              <h3>${{ metricas.ventas_hoy?.toFixed(2) || '0.00' }}</h3>
              <p>Ventas Hoy</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="stats-card stats-card-success">
              <i class="bi bi-box-seam fs-1"></i>
              <h3>{{ metricas.productos_en_stock || 0 }}</h3>
              <p>Productos en Stock</p>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="stats-card stats-card-warning position-relative">
              <i 
                class="bi bi-info-circle position-absolute top-0 end-0 m-2 text-white" 
                style="cursor: pointer; font-size: 1.2rem;"
                data-bs-toggle="tooltip"
                data-bs-placement="bottom"
                :title="tooltipAlertas"
                ref="tooltipIcon"
              ></i>
              <i class="bi bi-exclamation-triangle fs-1"></i>
              <h3>{{ metricas.alertas_pendientes || 0 }}</h3>
              <p>Alertas Pendientes</p>
              <button 
                v-if="metricas.alertas_pendientes > 0"
                class="btn btn-sm btn-warning mt-2"
                @click="mostrarDetalleAlertas = true"
              >
                <i class="bi bi-eye me-1"></i>
                Ver Alertas
              </button>
            </div>
          </div>
          <div class="col-md-3 col-sm-6 mb-3">
            <div class="stats-card stats-card-danger">
              <i class="bi bi-cart-check fs-1"></i>
              <h3>{{ metricas.ordenes_pendientes || 0 }}</h3>
              <p>Órdenes Pendientes</p>
            </div>
          </div>
        </div>

        <!-- Detalle de Alertas (si hay) -->
        <div v-if="alertas.length > 0 && mostrarDetalleAlertas" class="row mt-3">
          <div class="col-12">
            <div class="card border-warning">
              <div class="card-header bg-warning text-dark">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                <strong>Alertas Activas del Sistema</strong>
                <button 
                  class="btn btn-sm btn-close float-end" 
                  @click="mostrarDetalleAlertas = false"
                ></button>
              </div>
              <div class="card-body">
                <div class="list-group">
                  <div 
                    v-for="alerta in alertas" 
                    :key="alerta.alerta_id"
                    class="list-group-item"
                    :class="getPrioridadClass(alerta.prioridad)"
                  >
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 class="mb-1">
                          <i :class="getTipoIcon(alerta.tipo_alerta)" class="me-2"></i>
                          {{ alerta.tipo_alerta }}
                        </h6>
                        <p class="mb-1">{{ alerta.mensaje }}</p>
                        <small class="text-muted">
                          Producto: {{ alerta.producto_nombre }} ({{ alerta.producto_codigo }})
                        </small>
                      </div>
                      <span class="badge" :class="getPrioridadBadge(alerta.prioridad)">
                        {{ alerta.prioridad }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del Sistema y Accesos Rápidos -->
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
import { Tooltip } from 'bootstrap';
import Navbar from '../components/common/Navbar.vue';
import Sidebar from '../components/common/Sidebar.vue';
import authService from '../services/auth';
import reportesService from '../services/reportes';
import inventarioService from '../services/inventario';

export default {
  name: 'Dashboard',
  components: { Navbar, Sidebar },
  setup() {
    const sidebarOpen = ref(false);
    const user = computed(() => authService.getCurrentUser());
    const metricas = ref({});
    const alertas = ref([]);
    const mostrarDetalleAlertas = ref(false);
    const tooltipIcon = ref(null);

    const tooltipAlertas = `Alertas del Sistema:
• Stock Crítico: Productos con inventario bajo
• Por Vencer: Productos próximos a caducar
• Sin Stock: Productos agotados
• Reabastecimiento: Sugerencias de compra`;

    const cargarMetricas = async () => {
      try {
        const response = await reportesService.obtenerDashboardMetricas();
        metricas.value = response.data;
      } catch (error) {
        console.error('Error al cargar métricas:', error);
      }
    };

    const cargarAlertas = async () => {
      try {
        const response = await inventarioService.obtenerAlertas();
        if (response.success) {
          alertas.value = response.data;
        }
      } catch (error) {
        console.error('Error al cargar alertas:', error);
      }
    };

    const getTipoIcon = (tipo) => {
      const iconos = {
        'Stock Crítico': 'bi bi-exclamation-triangle-fill text-warning',
        'Stock Bajo': 'bi bi-exclamation-circle-fill text-warning',
        'Por Vencer': 'bi bi-calendar-x-fill text-danger',
        'Sin Stock': 'bi bi-x-circle-fill text-danger',
        'Reabastecimiento': 'bi bi-arrow-repeat text-info'
      };
      return iconos[tipo] || 'bi bi-info-circle text-secondary';
    };

    const getPrioridadClass = (prioridad) => {
      if (prioridad === 'Alta') return 'border-danger';
      if (prioridad === 'Media') return 'border-warning';
      return 'border-secondary';
    };

    const getPrioridadBadge = (prioridad) => {
      if (prioridad === 'Alta') return 'bg-danger';
      if (prioridad === 'Media') return 'bg-warning';
      return 'bg-secondary';
    };

    onMounted(() => {
      cargarMetricas();
      cargarAlertas();

      // Inicializar tooltip
      setTimeout(() => {
        if (tooltipIcon.value) {
          new Tooltip(tooltipIcon.value);
        }
      }, 500);
    });

    return { 
      sidebarOpen, 
      user, 
      metricas, 
      alertas,
      mostrarDetalleAlertas,
      tooltipAlertas,
      tooltipIcon,
      getTipoIcon,
      getPrioridadClass,
      getPrioridadBadge
    };
  }
};
</script>

<style scoped>
.stats-card {
  position: relative;
}
</style>