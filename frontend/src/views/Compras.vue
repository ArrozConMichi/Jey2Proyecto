<template>
  <div class="app-container">
    <Sidebar :is-open="sidebarOpen" @close-sidebar="sidebarOpen = false" />
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="content-area">
        <div class="row mb-4">
          <div class="col-md-6">
            <h2><i class="bi bi-bag-plus me-2"></i>Gestión de Compras</h2>
          </div>
          <div class="col-md-6 text-end">
            <button class="btn btn-primary" @click="abrirModalNuevaOrden">
              <i class="bi bi-plus-circle me-2"></i>Nueva Orden de Compra
            </button>
          </div>
        </div>

        <ul class="nav nav-tabs mb-4">
          <li class="nav-item">
            <a class="nav-link" :class="{ active: tabActivo === 'ordenes' }" @click="tabActivo = 'ordenes'" href="#" @click.prevent>
              <i class="bi bi-file-earmark-text me-2"></i>Órdenes de Compra
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" :class="{ active: tabActivo === 'proveedores' }" @click="tabActivo = 'proveedores'" href="#" @click.prevent>
              <i class="bi bi-building me-2"></i>Proveedores
            </a>
          </li>
        </ul>

        <div v-show="tabActivo === 'ordenes'">
          <div class="card">
            <div class="card-header">Lista de Órdenes de Compra</div>
            <div class="card-body">
              <div v-if="cargandoOrdenes" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
              </div>
              <div v-else class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>N° Orden</th>
                      <th>Proveedor</th>
                      <th>Fecha</th>
                      <th>Total</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="orden in ordenes" :key="orden.orden_id">
                      <td>{{ orden.numero_orden }}</td>
                      <td>{{ orden.proveedor }}</td>
                      <td>{{ formatDate(orden.fecha_orden) }}</td>
                      <td>${{ orden.total_orden }}</td>
                      <td>
                        <span class="badge" :class="getEstadoBadge(orden.estado)">
                          {{ orden.estado }}
                        </span>
                      </td>
                      <td>
                        <button 
                          v-if="orden.estado === 'Pendiente' || orden.estado === 'Enviada'"
                          class="btn btn-sm btn-outline-success" 
                          @click="marcarRecibida(orden)"
                        >
                          <i class="bi bi-check-circle"></i> Recibir
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div v-show="tabActivo === 'proveedores'">
          <div class="row">
            <div class="col-md-4 mb-3" v-for="proveedor in proveedores" :key="proveedor.id">
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="bi bi-building me-2 text-primary"></i>
                    {{ proveedor.nombre }}
                  </h5>
                  <p class="text-muted mb-2">
                    <i class="bi bi-person me-2"></i>{{ proveedor.contacto }}
                  </p>
                  <p class="text-muted mb-2">
                    <i class="bi bi-telephone me-2"></i>{{ proveedor.telefono }}
                  </p>
                  <p class="text-muted mb-0">
                    <i class="bi bi-envelope me-2"></i>{{ proveedor.email }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nueva Orden -->
    <div class="modal fade" :class="{ show: mostrarModal }" :style="{ display: mostrarModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-bag-plus me-2"></i>
              Nueva Orden de Compra
            </h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <!-- Proveedor -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  <i class="bi bi-building me-1"></i>
                  Proveedor <span class="text-danger">*</span>
                </label>
                <select class="form-select" v-model="nuevaOrden.proveedor_id" required>
                  <option value="">Seleccionar proveedor...</option>
                  <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                    {{ prov.nombre }}
                  </option>
                </select>
              </div>

              <!-- Fecha Entrega Esperada -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  <i class="bi bi-calendar-event me-1"></i>
                  Fecha de Entrega Esperada <span class="text-danger">*</span>
                </label>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="nuevaOrden.fecha_entrega_esperada" 
                  :min="fechaMinima"
                  required 
                />
                <small class="text-muted">Fecha en que se espera recibir la mercancía</small>
              </div>
            </div>

            <!-- Productos -->
            <div class="mb-3">
              <label class="form-label">
                <i class="bi bi-box-seam me-1"></i>
                Productos de la Orden
              </label>
              <button 
                class="btn btn-sm btn-outline-primary mb-3 d-block" 
                @click="agregarItemOrden"
                type="button"
              >
                <i class="bi bi-plus-circle me-1"></i> Agregar Producto
              </button>

              <!-- Lista de productos -->
              <div v-if="nuevaOrden.items.length === 0" class="alert alert-info">
                <i class="bi bi-info-circle me-2"></i>
                Aún no has agregado productos a esta orden. Haz click en "Agregar Producto" para comenzar.
              </div>

              <div class="table-responsive" v-else>
                <table class="table table-bordered">
                  <thead class="table-light">
                    <tr>
                      <th style="width: 40%">Producto</th>
                      <th style="width: 20%">Cantidad</th>
                      <th style="width: 20%">Precio Unitario</th>
                      <th style="width: 15%">Subtotal</th>
                      <th style="width: 5%"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(item, index) in nuevaOrden.items" :key="index">
                      <!-- Producto -->
                      <td>
                        <select 
                          class="form-select form-select-sm" 
                          v-model="item.producto_id"
                          required
                        >
                          <option value="">Seleccionar producto...</option>
                          <option 
                            v-for="prod in todosProductos" 
                            :key="prod.producto_id" 
                            :value="prod.producto_id"
                          >
                            {{ prod.codigo }} - {{ prod.nombre }}
                          </option>
                        </select>
                      </td>

                      <!-- Cantidad -->
                      <td>
                        <input 
                          type="number" 
                          class="form-control form-control-sm" 
                          v-model.number="item.cantidad" 
                          placeholder="Ej: 10"
                          min="1"
                          required
                        />
                      </td>

                      <!-- Precio Unitario -->
                      <td>
                        <div class="input-group input-group-sm">
                          <span class="input-group-text">$</span>
                          <input 
                            type="number" 
                            step="0.01" 
                            class="form-control" 
                            v-model.number="item.precio_unitario" 
                            placeholder="0.00"
                            min="0.01"
                            required
                          />
                        </div>
                      </td>

                      <!-- Subtotal -->
                      <td class="text-end">
                        <strong>${{ calcularSubtotal(item) }}</strong>
                      </td>

                      <!-- Eliminar -->
                      <td class="text-center">
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="eliminarItemOrden(index)"
                          type="button"
                          title="Eliminar producto"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="table-light">
                    <tr>
                      <td colspan="3" class="text-end"><strong>TOTAL:</strong></td>
                      <td class="text-end">
                        <strong class="text-primary fs-5">${{ calcularTotal() }}</strong>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarModal">
              <i class="bi bi-x-circle me-2"></i>
              Cancelar
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="crearOrden" 
              :disabled="creandoOrden || !validarOrden()"
            >
              <span v-if="creandoOrden">
                <span class="spinner-border spinner-border-sm me-2"></span>
                Creando...
              </span>
              <span v-else>
                <i class="bi bi-check-circle me-2"></i>
                Crear Orden
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade" :class="{ show: mostrarModal }" v-if="mostrarModal"></div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import Navbar from '../components/common/Navbar.vue';
import Sidebar from '../components/common/Sidebar.vue';
import comprasService from '../services/compras';
import inventarioService from '../services/inventario';

export default {
  name: 'Compras',
  components: { Navbar, Sidebar },
  setup() {
    const sidebarOpen = ref(false);
    const tabActivo = ref('ordenes');
    const ordenes = ref([]);
    const proveedores = ref([]);
    const todosProductos = ref([]);
    const cargandoOrdenes = ref(false);
    const creandoOrden = ref(false);
    const mostrarModal = ref(false);
    
    const nuevaOrden = ref({
      proveedor_id: '',
      fecha_entrega_esperada: '',
      items: []
    });

    const fechaMinima = computed(() => {
      const hoy = new Date();
      return hoy.toISOString().split('T')[0];
    });

    const cargarOrdenes = async () => {
      cargandoOrdenes.value = true;
      try {
        const response = await comprasService.obtenerOrdenes();
        ordenes.value = response.data;
      } catch (error) {
        console.error('Error:', error);
      } finally {
        cargandoOrdenes.value = false;
      }
    };

    const cargarProveedores = async () => {
      try {
        const response = await comprasService.obtenerProveedores();
        proveedores.value = response.data;
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const cargarProductos = async () => {
      try {
        const response = await inventarioService.obtenerProductos();
        todosProductos.value = response.data;
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const abrirModalNuevaOrden = () => {
      nuevaOrden.value = {
        proveedor_id: '',
        fecha_entrega_esperada: '',
        items: []
      };
      mostrarModal.value = true;
    };

    const cerrarModal = () => {
      mostrarModal.value = false;
    };

    const agregarItemOrden = () => {
      nuevaOrden.value.items.push({
        producto_id: '',
        cantidad: 1,
        precio_unitario: 0
      });
    };

    const eliminarItemOrden = (index) => {
      nuevaOrden.value.items.splice(index, 1);
    };

    const calcularSubtotal = (item) => {
      return (item.cantidad * item.precio_unitario).toFixed(2);
    };

    const calcularTotal = () => {
      return nuevaOrden.value.items
        .reduce((total, item) => total + (item.cantidad * item.precio_unitario), 0)
        .toFixed(2);
    };

    const validarOrden = () => {
      if (!nuevaOrden.value.proveedor_id || !nuevaOrden.value.fecha_entrega_esperada) {
        return false;
      }
      if (nuevaOrden.value.items.length === 0) {
        return false;
      }
      for (const item of nuevaOrden.value.items) {
        if (!item.producto_id || item.cantidad <= 0 || item.precio_unitario <= 0) {
          return false;
        }
      }
      return true;
    };

    const crearOrden = async () => {
      if (!validarOrden()) {
        alert('Por favor complete todos los campos correctamente');
        return;
      }

      creandoOrden.value = true;
      try {
        await comprasService.crearOrden(nuevaOrden.value);
        alert('Orden creada exitosamente');
        
        cerrarModal();
        await cargarOrdenes();
      } catch (error) {
        alert('Error: ' + (error.message || 'Error al crear orden'));
      } finally {
        creandoOrden.value = false;
      }
    };

    const marcarRecibida = async (orden) => {
      if (!confirm('¿Marcar orden como recibida? Esto actualizará el inventario.')) return;
      
      try {
        const items = Array(orden.total_items).fill().map(() => ({
          producto_id: 1,
          cantidad_recibida: 1
        }));
        
        await comprasService.recibirOrden(orden.orden_id, items);
        alert('Orden recibida exitosamente');
        await cargarOrdenes();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString('es-PA');
    };

    const getEstadoBadge = (estado) => {
      const badges = {
        'Pendiente': 'bg-warning',
        'Enviada': 'bg-info',
        'Recibida': 'bg-success',
        'Cancelada': 'bg-danger'
      };
      return badges[estado] || 'bg-secondary';
    };

    onMounted(() => {
      cargarOrdenes();
      cargarProveedores();
      cargarProductos();
    });

    return {
      sidebarOpen,
      tabActivo,
      ordenes,
      proveedores,
      todosProductos,
      cargandoOrdenes,
      creandoOrden,
      mostrarModal,
      nuevaOrden,
      fechaMinima,
      abrirModalNuevaOrden,
      cerrarModal,
      agregarItemOrden,
      eliminarItemOrden,
      calcularSubtotal,
      calcularTotal,
      validarOrden,
      crearOrden,
      marcarRecibida,
      formatDate,
      getEstadoBadge
    };
  }
};
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block !important;
}

.modal-backdrop.show {
  opacity: 0.5;
}
</style>