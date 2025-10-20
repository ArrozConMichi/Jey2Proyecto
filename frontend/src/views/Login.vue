<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-logo">
        <i class="bi bi-shop"></i>
        <h2>Sistema Jey2</h2>
        <p class="text-muted">Gestión Integral Empresarial</p>
      </div>

      <!-- Alerta de error -->
      <div v-if="error" class="alert alert-danger" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ error }}
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="handleLogin">
        <div class="mb-3">
          <label for="email" class="form-label">Correo Electrónico</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              class="form-control"
              id="email"
              v-model="credentials.email"
              placeholder="usuario@jey2.com"
              required
              :disabled="loading"
            />
          </div>
        </div>

        <div class="mb-3">
          <label for="password" class="form-label">Contraseña</label>
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-lock"></i>
            </span>
            <input
              :type="showPassword ? 'text' : 'password'"
              class="form-control"
              id="password"
              v-model="credentials.password"
              placeholder="••••••••"
              required
              :disabled="loading"
            />
            <button
              class="btn btn-outline-secondary"
              type="button"
              @click="showPassword = !showPassword"
              :disabled="loading"
            >
              <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-primary w-100"
          :disabled="loading"
        >
          <span v-if="loading">
            <span class="spinner-border spinner-border-sm me-2"></span>
            Iniciando sesión...
          </span>
          <span v-else>
            <i class="bi bi-box-arrow-in-right me-2"></i>
            Iniciar Sesión
          </span>
        </button>
      </form>

      <!-- Info de usuarios de prueba -->
      <div class="mt-4 text-center">
        <small class="text-muted">
          <i class="bi bi-info-circle"></i>
          Usuario de prueba: jefe@jey2.com / password123
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authService from '../services/auth';

export default {
  name: 'Login',
  setup() {
    const router = useRouter();
    
    const credentials = ref({
      email: '',
      password: ''
    });
    
    const error = ref('');
    const loading = ref(false);
    const showPassword = ref(false);

    const handleLogin = async () => {
      error.value = '';
      loading.value = true;

      try {
        const result = await authService.login(
          credentials.value.email,
          credentials.value.password
        );

        if (result.success) {
          router.push('/dashboard');
        } else {
          error.value = result.message || 'Credenciales inválidas';
        }
      } catch (err) {
        error.value = 'Error de conexión. Verifica que el backend esté corriendo.';
      } finally {
        loading.value = false;
      }
    };

    return {
      credentials,
      error,
      loading,
      showPassword,
      handleLogin
    };
  }
};
</script>