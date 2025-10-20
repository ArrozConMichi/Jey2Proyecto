<template>
  <div id="app">
    <router-view v-if="!checking" />
    <div v-else class="d-flex justify-content-center align-items-center" style="height: 100vh;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import authService from './services/auth';

export default {
  name: 'App',
  setup() {
    const router = useRouter();
    const checking = ref(true);

    onMounted(async () => {
      console.log('🚀 App iniciando...');
      
      const token = localStorage.getItem('token');
      
      if (token) {
        console.log('✅ Token encontrado, verificando...');
        
        try {
          // Verificar si el token es válido
          const isValid = await authService.verifyToken();
          
          if (!isValid) {
            console.log('❌ Token inválido, limpiando...');
            authService.logout();
            router.push('/login');
          } else {
            console.log('✅ Token válido');
          }
        } catch (error) {
          console.error('❌ Error verificando token:', error);
          authService.logout();
          router.push('/login');
        }
      } else {
        console.log('ℹ️ No hay token, usuario debe hacer login');
      }
      
      checking.value = false;
    });

    return {
      checking
    };
  }
}
</script>