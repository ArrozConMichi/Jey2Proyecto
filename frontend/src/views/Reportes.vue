<template>
  <div class="app-container">
    <Sidebar :is-open="sidebarOpen" @close-sidebar="sidebarOpen = false" />
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="content-area">
        <div class="row mb-4">
          <div class="col-md-6">
            <h2><i class="bi bi-graph-up me-2"></i>Reportes y Análisis</h2>
          </div>
        </div>

        <!-- Métricas -->
        <div class="row mb-4">
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <i class="bi bi-currency-dollar fs-1 text-success"></i>
                <h3 class="mt-2">${{ metricas.ventas_mes?.toFixed(2) || '0.00' }}</h3>
                <p class="text-muted mb-0">Ventas del Mes</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <i class="bi bi-cart-check fs-1 text-primary"></i>
                <h3 class="mt-2">{{ metricas.transacciones_hoy || 0 }}</h3>
                <p class="text-muted mb-0">Transacciones Hoy</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <i class="bi bi-box-seam fs-1 text-warning"></i>
                <h3 class="mt-2">{{ metricas.productos_en_stock || 0 }}</h3>
                <p class="text-muted mb-0">Productos</p>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-center">
              <div class="card-body">
                <i class="bi bi-graph-up-arrow fs-1 text-info"></i>
                <h3 class="mt-2">${{ metricas.valor_inventario?.toFixed(2) || '0.00' }}</h3>
                <p class="text-muted mb-0">Valor Inventario</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Ventas por Categoría -->
        <div class="row mb-4">
          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <i class="bi bi-pie-chart me-2"></i>Ventas por Categoría
              </div>
              <div class="card-body">
                <div v-if="ventasPorCategoria.length === 0" class="text-center py-5 text-muted">
                  Sin datos disponibles
                </div>
                <div v-else class="table-responsive">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Categoría</th>
                        <th>Unidades</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="cat in ventasPorCategoria" :key="cat.categoria">
                        <td>
                          <span class="badge" :class="getBadgeCategoria(cat.categoria)">
                            {{ cat.categoria }}
                          </span>
                        </td>
                        <td>{{ cat.unidades_vendidas }}</td>
                        <td>${{ cat.total_ingresos }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-6">
            <div class="card">
              <div class="card-header">
                <i class="bi bi-trophy me-2"></i>Productos Más Vendidos
              </div>
              <div class="card-body">
                <div v-if="productosMasVendidos.length === 0" class="text-center py-5 text-muted">
                  Sin datos disponibles
                </div>
                <div v-else class="table-responsive">
                  <table class="table table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Producto</th>
                        <th>Vendidos</th>
                        <th>Ingresos</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(prod, index) in productosMasVendidos.slice(0, 5)" :key="prod.producto_id">
                        <td>{{ index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1 }}</td>
                        <td>{{ prod.nombre }}</td>
                        <td>{{ prod.total_vendido }}</td>
                        <td>${{ prod.ingresos_totales }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Ventas Diarias -->
        <div class="card">
          <div class="card-header">
            <i class="bi bi-calendar3 me-2"></i>Ventas Últimos 7 Días
          </div>
          <div class="card-body">
            <div v-if="ventasDiarias.length === 0" class="text-center py-5 text-muted">
              Sin datos disponibles
            </div>
            <div v-else class="table-responsive">
              <table class="table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Transacciones</th>
                    <th>Subtotal</th>
                    <th>Impuesto</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="venta in ventasDiarias.slice(0, 7)" :key="venta.fecha">
                    <td>{{ formatDate(venta.fecha) }}</td>
                    <td>{{ venta.total_transacciones }}</td>
                    <td>${{ venta.subtotal_dia }}</td>
                    <td>${{ venta.impuesto_dia }}</td>
                    <td><strong>${{ venta.total_dia }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import Navbar from '../components/common/Navbar.vue';
import Sidebar from '../components/common/Sidebar.vue';
import reportesService from '../services/reportes';

export default {
  name: 'Reportes',
  components: { Navbar, Sidebar },
  setup() {
    const sidebarOpen = ref(false);
    const metricas = ref({});
    const ventasPorCategoria = ref([]);
    const productosMasVendidos = ref([]);
    const ventasDiarias = ref([]);

    const cargarDatos = async () => {
      try {
        const [metricasRes, categoriasRes, productosRes, diariasRes] = await Promise.all([
          reportesService.obtenerDashboardMetricas(),
          reportesService.obtenerVentasPorCategoria(),
          reportesService.obtenerProductosMasVendidos(),
          reportesService.obtenerVentasDiarias()
        ]);

        metricas.value = metricasRes.data;
        ventasPorCategoria.value = categoriasRes.data;
        productosMasVendidos.value = productosRes.data;
        ventasDiarias.value = diariasRes.data;
      } catch (error) {
        console.error('Error al cargar reportes:', error);
      }
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('es-PA', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    };

    const getBadgeCategoria = (categoria) => {
      const badges = {
        'Abarrotes': 'bg-info',
        'Carnes': 'bg-danger',
        'Licores': 'bg-warning',
        'Varios': 'bg-secondary'
      };
      return badges[categoria] || 'bg-secondary';
    };

    onMounted(() => {
      cargarDatos();
    });

    return {
      sidebarOpen,
      metricas,
      ventasPorCategoria,
      productosMasVendidos,
      ventasDiarias,
      formatDate,
      getBadgeCategoria
    };
  }
};
</script>