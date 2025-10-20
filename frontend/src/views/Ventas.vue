<template>
  <div class="app-container">
    <Sidebar :is-open="sidebarOpen" @close-sidebar="sidebarOpen = false" />
    <div class="main-content">
      <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
      <div class="content-area">
        <div class="row mb-4">
          <div class="col-12">
            <h2><i class="bi bi-cart-check me-2"></i>Punto de Venta</h2>
          </div>
        </div>

        <div class="row">
          <div class="col-lg-7">
            <div class="card mb-4">
              <div class="card-header">Buscar Productos</div>
              <div class="card-body">
                <input 
                  type="text" 
                  class="form-control form-control-lg" 
                  placeholder="🔍 Buscar producto..."
                  v-model="busqueda"
                  @input="buscarProductos"
                />
              </div>
            </div>

            <div class="card">
              <div class="card-body" style="max-height: 500px; overflow-y: auto;">
                <div class="row">
                  <div class="col-md-6 mb-3" v-for="producto in productosFiltrados" :key="producto.producto_id">
                    <div class="card cursor-pointer" @click="agregarAlCarrito(producto)">
                      <div class="card-body">
                        <h6 class="card-title">{{ producto.nombre }}</h6>
                        <p class="text-muted mb-1 small">{{ producto.codigo }}</p>
                        <div class="d-flex justify-content-between align-items-center">
                          <span class="text-success fw-bold">${{ producto.precio_venta }}</span>
                          <span class="badge bg-secondary">Stock: {{ producto.stock_actual }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="card">
              <div class="card-header bg-primary text-white">
                <i class="bi bi-cart3 me-2"></i>Carrito de Compra
              </div>
              <div class="card-body">
                <div class="mb-3" style="max-height: 300px; overflow-y: auto;">
                  <div v-if="carrito.length === 0" class="text-center text-muted py-5">
                    <i class="bi bi-cart-x fs-1 d-block mb-2"></i>
                    No hay productos
                  </div>
                  <div v-else>
                    <div v-for="item in carrito" :key="item.producto_id" class="border-bottom pb-2 mb-2">
                      <div class="d-flex justify-content-between align-items-center">
                        <div class="flex-grow-1">
                          <strong>{{ item.nombre }}</strong>
                          <p class="mb-0 small text-muted">${{ item.precio_unitario }} x {{ item.cantidad }}</p>
                        </div>
                        <div class="d-flex align-items-center">
                          <button class="btn btn-sm btn-outline-secondary me-1" @click="cambiarCantidad(item, -1)">-</button>
                          <span class="mx-2">{{ item.cantidad }}</span>
                          <button class="btn btn-sm btn-outline-secondary me-2" @click="cambiarCantidad(item, 1)">+</button>
                          <button class="btn btn-sm btn-outline-danger" @click="eliminarDelCarrito(item)">
                            <i class="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      <div class="text-end mt-1">
                        <strong>${{ item.subtotal.toFixed(2) }}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <hr>

                <div class="mb-2">
                  <div class="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>${{ subtotal.toFixed(2) }}</span>
                  </div>
                  <div class="d-flex justify-content-between">
                    <span>ITBMS (7%):</span>
                    <span>${{ impuesto.toFixed(2) }}</span>
                  </div>
                </div>

                <hr>

                <div class="d-flex justify-content-between mb-3">
                  <h5>Total:</h5>
                  <h4 class="text-primary">${{ total.toFixed(2) }}</h4>
                </div>

                <div class="mb-3">
                  <label class="form-label">Método de Pago:</label>
                  <select class="form-select" v-model="metodoPago">
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Credito">Crédito</option>
                  </select>
                </div>

                <div class="d-grid gap-2">
                  <button class="btn btn-success btn-lg" @click="procesarVenta" :disabled="carrito.length === 0 || procesando">
                    <span v-if="procesando" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="bi bi-check-circle me-2"></i>
                    Procesar Venta
                  </button>
                  <button class="btn btn-outline-danger" @click="limpiarCarrito">
                    <i class="bi bi-x-circle me-2"></i>Cancelar
                  </button>
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
import inventarioService from '../services/inventario';
import ventasService from '../services/ventas';

export default {
  name: 'Ventas',
  components: { Navbar, Sidebar },
  setup() {
    const sidebarOpen = ref(false);
    const productos = ref([]);
    const carrito = ref([]);
    const busqueda = ref('');
    const metodoPago = ref('Efectivo');
    const procesando = ref(false);

    const productosFiltrados = computed(() => {
      if (!busqueda.value) return productos.value;
      return productos.value.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.value.toLowerCase())
      );
    });

    const subtotal = computed(() => {
      return carrito.value.reduce((sum, item) => sum + item.subtotal, 0);
    });

    const impuesto = computed(() => {
      return subtotal.value * 0.07;
    });

    const total = computed(() => {
      return subtotal.value + impuesto.value;
    });

    const cargarProductos = async () => {
      try {
        const response = await inventarioService.obtenerProductos();
        productos.value = response.data.filter(p => p.stock_actual > 0);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const agregarAlCarrito = (producto) => {
      const existe = carrito.value.find(item => item.producto_id === producto.producto_id);
      if (existe) {
        if (existe.cantidad < producto.stock_actual) {
          existe.cantidad++;
          existe.subtotal = existe.cantidad * existe.precio_unitario;
        } else {
          alert('Stock insuficiente');
        }
      } else {
        carrito.value.push({
          producto_id: producto.producto_id,
          nombre: producto.nombre,
          precio_unitario: producto.precio_venta,
          cantidad: 1,
          subtotal: producto.precio_venta
        });
      }
    };

    const cambiarCantidad = (item, cambio) => {
      const producto = productos.value.find(p => p.producto_id === item.producto_id);
      const nuevaCantidad = item.cantidad + cambio;
      if (nuevaCantidad > 0 && nuevaCantidad <= producto.stock_actual) {
        item.cantidad = nuevaCantidad;
        item.subtotal = item.cantidad * item.precio_unitario;
      }
    };

    const eliminarDelCarrito = (item) => {
      const index = carrito.value.indexOf(item);
      if (index > -1) {
        carrito.value.splice(index, 1);
      }
    };

    const limpiarCarrito = () => {
      if (confirm('¿Cancelar venta?')) {
        carrito.value = [];
      }
    };

    const procesarVenta = async () => {
      if (carrito.value.length === 0) return;
      
      procesando.value = true;
      try {
        await ventasService.registrarVenta({
          items: carrito.value,
          metodo_pago: metodoPago.value,
          subtotal: subtotal.value,
          impuesto: impuesto.value,
          descuento: 0,
          total: total.value
        });
        
        alert('Venta registrada exitosamente');
        carrito.value = [];
        await cargarProductos();
      } catch (error) {
        alert('Error: ' + (error.message || 'Error al procesar venta'));
      } finally {
        procesando.value = false;
      }
    };

    onMounted(() => {
      cargarProductos();
    });

    return {
      sidebarOpen,
      productos,
      carrito,
      busqueda,
      metodoPago,
      procesando,
      productosFiltrados,
      subtotal,
      impuesto,
      total,
      agregarAlCarrito,
      cambiarCantidad,
      eliminarDelCarrito,
      limpiarCarrito,
      procesarVenta
    };
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;
}
.cursor-pointer:hover {
  transform: scale(1.02);
}
</style>