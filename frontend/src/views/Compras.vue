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
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#nuevaOrdenModal">
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
    <div class="modal fade" id="nuevaOrdenModal" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nueva Orden de Compra</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Proveedor</label>
              <select class="form-select" v-model="nuevaOrden.proveedor_id" required>
                <option value="">Seleccionar...</option>
                <option v-for="prov in proveedores" :key="prov.id" :value="prov.id">
                  {{ prov.nombre }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Fecha Entrega Esperada</label>
              <input type="date" class="form-control" v-model="nuevaOrden.fecha_entrega_esperada" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Productos</label>
              <button class="btn btn-sm btn-outline-primary mb-2" @click="agregarItemOrden">
                <i class="bi bi-plus"></i> Agregar Producto
              </button>
              <div v-for="(item, index) in nuevaOrden.items" :key="index" class="border p-2 mb-2">
                <div class="row">
                  <div class="col-md-5">
                    <select class="form-select form-select-sm" v-model="item.producto_id">
                      <option value="">Producto...</option>
                      <option v-for="prod in todosProductos" :key="prod.producto_id" :value="prod.producto_id">
                        {{ prod.nombre }}
                      </option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <input type="number" class="form-control form-control-sm" v-model.number="item.cantidad" placeholder="Cantidad" />
                  </div>
                  <div class="col-md-3">
                    <input type="number" step="0.01" class="form-control form-control-sm" v-model.number="item.precio_unitario" placeholder="Precio" />
                  </div>
                  <div class="col-md-1">
                    <button class="btn btn-sm btn-outline-danger" @click="eliminarItemOrden(index)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="crearOrden" :disabled="creandoOrden">
              <span v-if="creandoOrden" class="spinner-border spinner-border-sm me-2"></span>
              Crear Orden
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { Modal } from 'bootstrap';
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
    
    const nuevaOrden = ref({
      proveedor_id: '',
      fecha_entrega_esperada: '',
      items: []
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

    const crearOrden = async () => {
      if (!nuevaOrden.value.proveedor_id || nuevaOrden.value.items.length === 0) {
        alert('Complete todos los campos');
        return;
      }

      creandoOrden.value = true;
      try {
        await comprasService.crearOrden(nuevaOrden.value);
        alert('Orden creada exitosamente');
        
        const modal = Modal.getInstance(document.getElementById('nuevaOrdenModal'));
        modal.hide();
        
        nuevaOrden.value = { proveedor_id: '', fecha_entrega_esperada: '', items: [] };
        await cargarOrdenes();
      } catch (error) {
        alert('Error: ' + (error.message || 'Error al crear orden'));
      } finally {
        creandoOrden.value = false;
      }
    };

    const marcarRecibida = async (orden) => {
      if (!confirm('¿Marcar orden como recibida?')) return;
      
      try {
        const items = Array(orden.total_items).fill().map(() => ({
          producto_id: 1,
          cantidad_recibida: 1
        }));
        
        await comprasService.recibirOrden(orden.orden_id, items);
        alert('Orden recibida');
        await cargarOrdenes();
      } catch (error) {
        alert('Error: ' + error.message);
      }
    };

    const formatDate = (dateStr) => {
      return new Date(dateStr).toLocaleDateString();
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
      nuevaOrden,
      agregarItemOrden,
      eliminarItemOrden,
      crearOrden,
      marcarRecibida,
      formatDate,
      getEstadoBadge
    };
  }
};
</script>