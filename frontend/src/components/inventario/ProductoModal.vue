<template>
  <div class="modal fade" :class="{ show: show }" :style="{ display: show ? 'block' : 'none' }" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            <i class="bi bi-box-seam me-2"></i>
            {{ esEdicion ? 'Editar Producto' : 'Nuevo Producto' }}
          </h5>
          <button type="button" class="btn-close" @click="cerrar"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="guardar">
            <div class="row">
              <!-- Código -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Código <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="formulario.codigo"
                  placeholder="Ej: ARR001"
                  required
                  :disabled="esEdicion"
                />
                <small class="text-muted" v-if="esEdicion">El código no se puede modificar</small>
              </div>

              <!-- Nombre -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Nombre <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  v-model="formulario.nombre"
                  placeholder="Nombre del producto"
                  required
                />
              </div>

              <!-- Categoría (ocupa toda la fila ahora) -->
              <div class="col-md-12 mb-3">
                <label class="form-label">Categoría <span class="text-danger">*</span></label>
                <select class="form-select" v-model="formulario.categoria" required>
                  <option value="">Seleccionar...</option>
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Carnes">Carnes</option>
                  <option value="Licores">Licores</option>
                  <option value="Varios">Varios</option>
                </select>
              </div>

              <!-- Precio Compra -->
              <div class="col-md-4 mb-3">
                <label class="form-label">Precio Compra <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  step="0.01"
                  class="form-control" 
                  v-model.number="formulario.precio_compra"
                  placeholder="0.00"
                  required
                />
              </div>

              <!-- Precio Venta -->
              <div class="col-md-4 mb-3">
                <label class="form-label">Precio Venta <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  step="0.01"
                  class="form-control" 
                  v-model.number="formulario.precio_venta"
                  placeholder="0.00"
                  required
                />
              </div>

              <!-- Margen -->
              <div class="col-md-4 mb-3">
                <label class="form-label">Margen (%)</label>
                <input 
                  type="text" 
                  class="form-control" 
                  :value="calcularMargen"
                  readonly
                  disabled
                />
              </div>

              <!-- Stock Actual (AHORA HABILITADO SIEMPRE) -->
              <div class="col-md-4 mb-3">
                <label class="form-label">Stock Actual <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="formulario.stock_actual"
                  placeholder="0"
                  required
                />
              </div>

              <!-- Stock Mínimo -->
              <div class="col-md-4 mb-3">
                <label class="form-label">Stock Mínimo <span class="text-danger">*</span></label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="formulario.stock_minimo"
                  placeholder="0"
                  required
                />
              </div>

              <!-- Stock Máximo -->
              <div class="col-md-4 mb-3">
                <label class="form-label">Stock Máximo</label>
                <input 
                  type="number" 
                  class="form-control" 
                  v-model.number="formulario.stock_maximo"
                  placeholder="0"
                />
              </div>

              <!-- Fecha Vencimiento -->
              <div class="col-md-6 mb-3">
                <label class="form-label">Fecha de Vencimiento</label>
                <input 
                  type="date" 
                  class="form-control" 
                  v-model="formulario.fecha_vencimiento"
                />
                <small class="text-muted">Opcional, para productos perecederos</small>
              </div>

              <!-- Proveedor Principal (DROPDOWN CON PRESELECCIÓN) -->
              <div class="col-md-6 mb-3">
                <label class="form-label">
                  <i class="bi bi-building me-1"></i>
                  Proveedor Principal
                </label>
                <select 
                  class="form-select" 
                  v-model="formulario.proveedor_id"
                  :disabled="cargandoProveedores"
                >
                  <option :value="null">Sin proveedor asignado</option>
                  <option 
                    v-for="proveedor in proveedores" 
                    :key="proveedor.id" 
                    :value="proveedor.id"
                  >
                    {{ proveedor.nombre }}
                  </option>
                </select>
                <small class="text-muted" v-if="cargandoProveedores">
                  <span class="spinner-border spinner-border-sm me-1"></span>
                  Cargando proveedores...
                </small>
                <small class="text-muted" v-else-if="formulario.proveedor_id">
                  ✓ Proveedor seleccionado
                </small>
              </div>

              <!-- Descripción -->
              <div class="col-12 mb-3">
                <label class="form-label">Descripción</label>
                <textarea 
                  class="form-control" 
                  v-model="formulario.descripcion"
                  rows="2"
                  placeholder="Descripción del producto (opcional)"
                ></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="cerrar">
            <i class="bi bi-x-circle me-2"></i>
            Cancelar
          </button>
          <button type="button" class="btn btn-primary" @click="guardar">
            <i class="bi bi-check-circle me-2"></i>
            {{ esEdicion ? 'Actualizar' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade" :class="{ show: show }" v-if="show"></div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue';
import comprasService from '../../services/compras';

export default {
  name: 'ProductoModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    producto: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'guardar'],
  setup(props, { emit }) {
    const proveedores = ref([]);
    const cargandoProveedores = ref(false);
    
    const formulario = ref({
      codigo: '',
      nombre: '',
      descripcion: '',
      categoria: '',
      precio_compra: 0,
      precio_venta: 0,
      stock_actual: 0,
      stock_minimo: 5,
      stock_maximo: 100,
      fecha_vencimiento: null,
      proveedor_id: null
    });

    const esEdicion = computed(() => {
      return props.producto !== null && props.producto.producto_id;
    });

    const calcularMargen = computed(() => {
      const compra = parseFloat(formulario.value.precio_compra) || 0;
      const venta = parseFloat(formulario.value.precio_venta) || 0;
      
      if (compra === 0) return '0.00%';
      
      const margen = ((venta - compra) / compra) * 100;
      return margen.toFixed(2) + '%';
    });

    // Cargar proveedores
    const cargarProveedores = async () => {
      cargandoProveedores.value = true;
      try {
        const response = await comprasService.obtenerProveedores();
        if (response.success) {
          proveedores.value = response.data;
          console.log('✅ Proveedores cargados:', proveedores.value.length);
          console.log('📋 Lista de proveedores:', proveedores.value);
        }
      } catch (error) {
        console.error('❌ Error al cargar proveedores:', error);
      } finally {
        cargandoProveedores.value = false;
      }
    };

    // Watch para abrir modal y cargar proveedores
    watch(() => props.show, async (nuevo) => {
      if (nuevo) {
        await cargarProveedores();
        
        // Si hay un producto, cargar sus datos DESPUÉS de tener proveedores
        if (props.producto) {
          cargarDatosProducto(props.producto);
        }
      }
    });

    // Función separada para cargar datos del producto
    const cargarDatosProducto = (producto) => {
      console.log('📝 Cargando producto para editar:', producto);
      console.log('👥 Proveedores disponibles:', proveedores.value);
      
      let proveedorId = null;
      
      // Caso 1: Ya viene proveedor_id (número)
      if (producto.proveedor_id && typeof producto.proveedor_id === 'number') {
        proveedorId = producto.proveedor_id;
        console.log('✅ Proveedor ID encontrado directamente:', proveedorId);
      }
      // Caso 2: Viene proveedor_principal (nombre como string)
      else if (producto.proveedor_principal && typeof producto.proveedor_principal === 'string') {
        const proveedorEncontrado = proveedores.value.find(
          p => p.nombre.toLowerCase().trim() === producto.proveedor_principal.toLowerCase().trim()
        );
        if (proveedorEncontrado) {
          proveedorId = proveedorEncontrado.id;
          console.log('✅ Proveedor encontrado por nombre:', proveedorEncontrado.nombre, '(ID:', proveedorId, ')');
        } else {
          console.log('⚠️ Proveedor no encontrado en la lista:', producto.proveedor_principal);
          console.log('📋 Proveedores disponibles:', proveedores.value.map(p => p.nombre));
        }
      }
      
      formulario.value = {
        producto_id: producto.producto_id,
        codigo: producto.codigo || '',
        nombre: producto.nombre || '',
        descripcion: producto.descripcion || '',
        categoria: producto.categoria || '',
        precio_compra: producto.precio_compra || 0,
        precio_venta: producto.precio_venta || 0,
        stock_actual: producto.stock_actual || 0,
        stock_minimo: producto.stock_minimo || 5,
        stock_maximo: producto.stock_maximo || 100,
        fecha_vencimiento: producto.fecha_vencimiento ? producto.fecha_vencimiento.split('T')[0] : null,
        proveedor_id: proveedorId
      };
      
      console.log('✅ Formulario cargado con proveedor_id:', proveedorId);
      console.log('📋 Formulario completo:', formulario.value);
    };

    // Watch para producto (cuando cambia)
    watch(() => props.producto, (nuevo) => {
      if (!nuevo) {
        // NUEVO PRODUCTO - Reset formulario
        formulario.value = {
          codigo: '',
          nombre: '',
          descripcion: '',
          categoria: '',
          precio_compra: 0,
          precio_venta: 0,
          stock_actual: 0,
          stock_minimo: 5,
          stock_maximo: 100,
          fecha_vencimiento: null,
          proveedor_id: null
        };
      } else if (proveedores.value.length > 0) {
        // Si ya están cargados los proveedores, cargar el producto
        cargarDatosProducto(nuevo);
      }
    });

    const cerrar = () => {
      emit('close');
    };

    const guardar = () => {
      // Validaciones básicas
      if (!formulario.value.codigo || !formulario.value.nombre || !formulario.value.categoria) {
        alert('Por favor complete los campos obligatorios');
        return;
      }

      if (formulario.value.precio_compra <= 0 || formulario.value.precio_venta <= 0) {
        alert('Los precios deben ser mayores a 0');
        return;
      }

      if (formulario.value.precio_venta < formulario.value.precio_compra) {
        if (!confirm('El precio de venta es menor al precio de compra. ¿Desea continuar?')) {
          return;
        }
      }

      // Preparar datos para enviar
      const datosEnviar = { ...formulario.value };
      
      // Convertir proveedor_id a proveedor_principal (nombre) para el backend
      if (datosEnviar.proveedor_id) {
        const proveedorSeleccionado = proveedores.value.find(
          p => p.id === datosEnviar.proveedor_id
        );
        if (proveedorSeleccionado) {
          datosEnviar.proveedor_principal = proveedorSeleccionado.nombre;
        }
      } else {
        datosEnviar.proveedor_principal = null;
      }

      console.log('💾 Guardando producto:', datosEnviar);
      emit('guardar', datosEnviar);
    };

    onMounted(() => {
      cargarProveedores();
    });

    return {
      formulario,
      proveedores,
      cargandoProveedores,
      esEdicion,
      calcularMargen,
      cerrar,
      guardar
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