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
            <button class="btn btn-primary">
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
                    <h3 class="mb-0">21</h3>
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
                    <h3 class="mb-0 text-warning">2</h3>
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
                    <h3 class="mb-0 text-danger">1</h3>
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
                />
              </div>
              <div class="col-md-3">
                <select class="form-select">
                  <option value="">Todas las categorías</option>
                  <option value="Abarrotes">Abarrotes</option>
                  <option value="Carnes">Carnes</option>
                  <option value="Licores">Licores</option>
                  <option value="Varios">Varios</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select">
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
            <div class="table-responsive">
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
                  <tr>
                    <td>ARR001</td>
                    <td>Arroz 5kg</td>
                    <td><span class="badge bg-info">Abarrotes</span></td>
                    <td>$5.00</td>
                    <td>25</td>
                    <td><span class="badge bg-success">Normal</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-1">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>WHI001</td>
                    <td>Whisky Etiqueta Negra 750ml</td>
                    <td><span class="badge bg-warning">Licores</span></td>
                    <td>$42.00</td>
                    <td>8</td>
                    <td><span class="badge bg-warning">Stock Bajo</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-1">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td>CAR001</td>
                    <td>Carne de Res 1kg</td>
                    <td><span class="badge bg-danger">Carnes</span></td>
                    <td>$8.00</td>
                    <td>12</td>
                    <td><span class="badge bg-danger">Por Vencer</span></td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary me-1">
                        <i class="bi bi-pencil"></i>
                      </button>
                      <button class="btn btn-sm btn-outline-danger">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Nota -->
        <div class="alert alert-info mt-4">
          <i class="bi bi-info-circle me-2"></i>
          <strong>Próximamente:</strong> CRUD completo de productos, actualización de stock en tiempo real, y alertas automáticas.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import Navbar from '../components/common/Navbar.vue';
import Sidebar from '../components/common/Sidebar.vue';

export default {
  name: 'Inventario',
  components: {
    Navbar,
    Sidebar
  },
  setup() {
    const sidebarOpen = ref(false);

    return {
      sidebarOpen
    };
  }
};
</script>