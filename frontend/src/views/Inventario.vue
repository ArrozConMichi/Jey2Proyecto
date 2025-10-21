<template>
  <div class="app-container">
    <Sidebar :is-open="sidebarOpen" @close-sidebar="sidebarOpen = false" />
    
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      
      <div class="content-area">
        <!-- Header -->
        <div class="row mb-4">
          <div class="col-md-6">
            <h2><i class="bi bi-box-seam me-2"></i>Gestión de Inventario</h2>
            <p class="text-muted">Control de productos y stock</p>
          </div>
          <div class="col-md-6 text-end">
            <button class="btn btn-primary" @click="abrirModalNuevo">
              <i class="bi bi-plus-circle me-2"></i>
              Nuevo Producto
            </button>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Total Productos</p>
                    <h3 class="mb-0">{{ productosFiltrados.length }}</h3>
                  </div>
                  <i class="bi bi-box-seam fs-1 text-primary"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Stock Crítico</p>
                    <h3 class="mb-0 text-warning">{{ contarStockCritico }}</h3>
                  </div>
                  <i class="bi bi-exclamation-triangle fs-1 text-warning"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <p class="text-muted mb-1">Por Vencer</p>
                    <h3 class="mb-0 text-danger">{{ contarPorVencer }}</h3>
                  </div>
                  <i class="bi bi-calendar-x fs-1 text-danger"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Búsqueda y filtros -->
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="🔍 Buscar productos..."
                  v-model="busqueda"
                  @input="filtrarProductos"
                />
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="filtroCategoria" @change="filtrarProductos">
                  <option value="">Todas las categorías</option>
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Carnes">Carnes</option>
                  <option value="Licores">Licores</option>
                  <option value="Varios">Varios</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="filtroEstado" @change="filtrarProductos">
                  <option value="">Todos los estados</option>
                  <option value="Normal">Normal</option>
                  <option value="StockBajo">Stock Bajo</option>
                  <option value="PorVencer">Por Vencer</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla de productos -->
        <div class="card">
          <div class="card-header">
            <i class="bi bi-list-ul me-2"></i>
            Lista de Productos
          </div>
          <div class="card-body">
            <div v-if="cargando" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
              <p class="mt-2">Cargando productos...</p>
            </div>
            <div v-else-if="productosFiltrados.length === 0" class="text-center py-5">
              <i class="bi bi-inbox fs-1 text-muted"></i>
              <p class="mt-2 text-muted">No se encontraron productos</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio Venta</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="producto in productosFiltrados" :key="producto.producto_id">
                    <td>{{ producto.codigo }}</td>
                    <td>{{ producto.nombre }}</td>
                    <td><span class="badge" :class="getCategoriaColor(producto.categoria)">{{ producto.categoria }}</span></td>
                    <td>${{ producto.precio_venta }}</td>
                    <td>
                      <span :class="{'text-warning fw-bold': producto.stock_actual <= producto.stock_minimo}">
                        {{ producto.stock_actual }}
                      </span>
                    </td>
                    <td>
                      <span class="badge" :class="getEstadoBadge(producto)">
                        {{ getEstadoTexto(producto) }}
                      </span>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-1" @click="editarProducto(producto)">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger" @click="eliminarProducto(producto)">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Producto -->
    <ProductoModal 
      :show="mostrarModal"
      :producto="productoSeleccionado"
      @close="cerrarModal"
      @guardar="guardarProducto"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/common/Navbar.vue';
import Sidebar from '../components/common/Sidebar.vue';
import ProductoModal from '../components/inventario/ProductoModal.vue';
import inventarioService from '../services/inventario';

export default {
  name: 'Inventario',
  components: {
    Navbar,
    Sidebar,
    ProductoModal
  },
  setup() {
    const sidebarOpen = ref(false);
    const productos = ref([]);
    const productosFiltrados = ref([]);
    const cargando = ref(false);
    const busqueda = ref('');
    const filtroCategoria = ref('');
    const filtroEstado = ref('');
    const mostrarModal = ref(false);
    const productoSeleccionado = ref(null);

    // Cargar productos
    const cargarProductos = async () => {
      cargando.value = true;
      try {
        const response = await inventarioService.obtenerProductos();
        if (response.success) {
          productos.value = response.data;
          productosFiltrados.value = response.data;
        }
      } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
      } finally {
        cargando.value = false;
      }
    };

    // Filtrar productos
    const filtrarProductos = () => {
      let resultado = [...productos.value];

      // Filtro de búsqueda
      if (busqueda.value) {
        const termino = busqueda.value.toLowerCase();
        resultado = resultado.filter(p => 
          p.nombre.toLowerCase().includes(termino) ||
          p.codigo.toLowerCase().includes(termino)
        );
      }

      // Filtro de categoría
      if (filtroCategoria.value) {
        resultado = resultado.filter(p => p.categoria === filtroCategoria.value);
      }

      // Filtro de estado
      if (filtroEstado.value) {
        resultado = resultado.filter(p => {
          const estado = getEstadoTexto(p);
          return estado === filtroEstado.value.replace('StockBajo', 'Stock Bajo').replace('PorVencer', 'Por Vencer');
        });
      }

      productosFiltrados.value = resultado;
    };

    // Contadores
    const contarStockCritico = computed(() => {
      return productos.value.filter(p => p.stock_actual <= p.stock_minimo).length;
    });

    const contarPorVencer = computed(() => {
      const hoy = new Date();
      const diasLimite = 7;
      return productos.value.filter(p => {
        if (!p.fecha_vencimiento) return false;
        const vencimiento = new Date(p.fecha_vencimiento);
        const diferencia = (vencimiento - hoy) / (1000 * 60 * 60 * 24);
        return diferencia > 0 && diferencia <= diasLimite;
      }).length;
    });

    // Utilidades
    const getCategoriaColor = (categoria) => {
      const colores = {
        'Abarrotes': 'bg-info',
        'Carnes': 'bg-danger',
        'Licores': 'bg-warning',
        'Varios': 'bg-secondary'
      };
      return colores[categoria] || 'bg-secondary';
    };

    const getEstadoTexto = (producto) => {
      if (producto.stock_actual <= producto.stock_minimo) return 'Stock Bajo';
      
      if (producto.fecha_vencimiento) {
        const hoy = new Date();
        const vencimiento = new Date(producto.fecha_vencimiento);
        const diferencia = (vencimiento - hoy) / (1000 * 60 * 60 * 24);
        if (diferencia > 0 && diferencia <= 7) return 'Por Vencer';
      }
      
      return 'Normal';
    };

    const getEstadoBadge = (producto) => {
      const estado = getEstadoTexto(producto);
      const badges = {
        'Normal': 'bg-success',
        'Stock Bajo': 'bg-warning',
        'Por Vencer': 'bg-danger'
      };
      return badges[estado] || 'bg-secondary';
    };

    // Modal
    const abrirModalNuevo = () => {
      productoSeleccionado.value = null;
      mostrarModal.value = true;
    };

    const editarProducto = (producto) => {
      productoSeleccionado.value = { ...producto };
      mostrarModal.value = true;
    };

    const cerrarModal = () => {
      mostrarModal.value = false;
      productoSeleccionado.value = null;
    };

    const guardarProducto = async (producto) => {
      try {
        if (producto.producto_id) {
          // Editar
          await inventarioService.actualizarProducto(producto.producto_id, producto);
          alert('Producto actualizado correctamente');
        } else {
          // Crear
          await inventarioService.crearProducto(producto);
          alert('Producto creado correctamente');
        }
        cerrarModal();
        await cargarProductos();
      } catch (error) {
        console.error('Error al guardar producto:', error);
        alert('Error al guardar producto: ' + (error.message || 'Error desconocido'));
      }
    };

    const eliminarProducto = async (producto) => {
      if (!confirm(`¿Estás seguro de eliminar "${producto.nombre}"?`)) return;

      try {
        await inventarioService.eliminarProducto(producto.producto_id);
        alert('Producto eliminado correctamente');
        await cargarProductos();
      } catch (error) {
        console.error('Error al eliminar producto:', error);
        alert('Error al eliminar producto: ' + (error.message || 'Error desconocido'));
      }
    };

    onMounted(() => {
      cargarProductos();
    });

    return {
      sidebarOpen,
      productos,
      productosFiltrados,
      cargando,
      busqueda,
      filtroCategoria,
      filtroEstado,
      mostrarModal,
      productoSeleccionado,
      contarStockCritico,
      contarPorVencer,
      filtrarProductos,
      getCategoriaColor,
      getEstadoBadge,
      getEstadoTexto,
      abrirModalNuevo,
      editarProducto,
      cerrarModal,
      guardarProducto,
      eliminarProducto
    };
  }
};
</script>