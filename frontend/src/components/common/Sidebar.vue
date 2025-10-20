<template>
  <div class="sidebar" :class="{ 'show': isOpen }">
    <!-- Logo / Brand -->
    <div class="sidebar-brand">
      <i class="bi bi-shop fs-1"></i>
      <h4 class="mt-2">Sistema Jey2</h4>
      <small class="text-muted">Gestión Empresarial</small>
    </div>

    <!-- Menú -->
    <ul class="sidebar-menu">
      <li
        v-for="item in menuItems"
        :key="item.path"
        class="sidebar-menu-item"
      >
        <router-link
          :to="item.path"
          class="sidebar-menu-link"
          :class="{ 'active': isActive(item.path) }"
          @click="$emit('close-sidebar')"
        >
          <i :class="item.icon"></i>
          <span>{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'Sidebar',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close-sidebar'],
  setup() {
    const route = useRoute();

    const menuItems = ref([
      {
        path: '/dashboard',
        label: 'Dashboard',
        icon: 'bi bi-speedometer2'
      },
      {
        path: '/inventario',
        label: 'Inventario',
        icon: 'bi bi-box-seam'
      },
      {
        path: '/ventas',
        label: 'Ventas',
        icon: 'bi bi-cart-check'
      },
      {
        path: '/compras',
        label: 'Compras',
        icon: 'bi bi-bag-plus'
      },
      {
        path: '/reportes',
        label: 'Reportes',
        icon: 'bi bi-graph-up'
      }
    ]);

    const isActive = (path) => {
      return route.path === path;
    };

    return {
      menuItems,
      isActive
    };
  }
};
</script>