
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, AUTH_CONFIG } from '../config/config';
import {
  LoginRequest,
  LoginResponse,
  CreateVisitorRequest,
  VisitorResponse,
  CreateVisitRequest,
  VisitResponse,
  CloseVisitRequest,
  ApiErrorResponse
} from '../types/api.types';
import { logger } from './logger';

/**
 * Cliente HTTP Singleton para la API de GestionVisita
 */
class ApiClient {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    // Crear instancia de axios con configuración base
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.baseURL,
      timeout: API_CONFIG.timeout,
      headers: API_CONFIG.headers,
    });

    // Configurar interceptors
    this.setupInterceptors();
  }

  /**
   * Configura interceptors de request y response
   */
  private setupInterceptors(): void {
    // REQUEST INTERCEPTOR: Inyecta el token JWT automáticamente
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // RESPONSE INTERCEPTOR: Maneja errores comunes
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const status = error.response?.status;
        const errorData = error.response?.data;

        // 401 Unauthorized - Token expirado o inválido
        if (status === 401) {
          logger.warn('⚠️ Token inválido o expirado. Reautenticando...');
          this.accessToken = null;
          this.tokenExpiry = null;
          
          // Intentar reautenticar automáticamente
          await this.authenticate();
          
          // Reintentar el request original
          if (error.config) {
            return this.axiosInstance.request(error.config);
          }
        }

        // 500 Internal Server Error
        if (status === 500) {
          logger.error(`❌ Error del servidor: ${errorData?.error || 'Error interno'}`);
        }

        // 422 Unprocessable Entity (validación)
        if (status === 422 && errorData?.errors) {
          logger.error('❌ Error de validación:', errorData.errors);
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Autentica al usuario y obtiene el JWT
   * Se ejecuta automáticamente al inicio y cuando el token expira
   */
  async authenticate(): Promise<void> {
    try {
      logger.info('🔐 Autenticando...');

      const payload: LoginRequest = {
        email: AUTH_CONFIG.email,
        password: AUTH_CONFIG.password,
      };

      const response = await this.axiosInstance.post<LoginResponse>(
        '/api/auth/login',
        payload
      );

      this.accessToken = response.data.accessToken;
      
      // Calcular fecha de expiración (expiresIn está en segundos)
      const expiresInMs = response.data.expiresIn * 1000;
      this.tokenExpiry = new Date(Date.now() + expiresInMs);

      logger.info(`✅ Autenticado como: ${response.data.user.name} (${response.data.user.role})`);
      logger.info(`🔑 Token expira en: ${Math.floor(response.data.expiresIn / 60)} minutos`);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorData = error.response?.data as ApiErrorResponse;
        logger.error(`❌ Error de autenticación: ${errorData?.error || error.message}`);
      } else {
        logger.error('❌ Error desconocido en autenticación:', error);
      }
      throw new Error('No se pudo autenticar. Verifica las credenciales en .env');
    }
  }

  /**
   * Verifica si el token está próximo a expirar (dentro de 5 minutos)
   * Si es así, reautentica preventivamente
   */
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry) {
      await this.authenticate();
      return;
    }

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (this.tokenExpiry < fiveMinutesFromNow) {
      logger.info('🔄 Token próximo a expirar, renovando...');
      await this.authenticate();
    }
  }

  // ============================================
  // MÉTODOS DE API - VISITORS
  // ============================================

  /**
   * Crea un nuevo visitante
   * POST /api/visitor
   */
  async createVisitor(data: CreateVisitorRequest): Promise<VisitorResponse> {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.axiosInstance.post<{ message: string; data: VisitorResponse }>(
        '/api/visitor',
        data
      );
      return response.data.data;
    } catch (error) {
      this.handleError('createVisitor', error);
      throw error;
    }
  }

  // ============================================
  // MÉTODOS DE API - VISITS
  // ============================================

  /**
   * Crea una nueva visita
   * POST /api/visit
   */
  async createVisit(data: CreateVisitRequest): Promise<VisitResponse> {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.axiosInstance.post<{ message: string; data: VisitResponse }>(
        '/api/visit',
        data
      );
      return response.data.data;
    } catch (error) {
      this.handleError('createVisit', error);
      throw error;
    }
  }

  /**
   * Cierra una visita existente
   * POST /api/visit/{id}/close
   */
  async closeVisit(visitId: number, data?: CloseVisitRequest): Promise<VisitResponse> {
    await this.ensureAuthenticated();
    
    try {
      const response = await this.axiosInstance.post<{ message: string; data: VisitResponse }>(
        `/api/visit/${visitId}/close`,
        data || {}
      );
      return response.data.data;
    } catch (error) {
      this.handleError('closeVisit', error);
      throw error;
    }
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  /**
   * Maneja errores de forma consistente
   */
  private handleError(method: string, error: unknown): void {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorData = error.response?.data as ApiErrorResponse;
      
      logger.error(
        `❌ Error en ${method}:`,
        `[${status}] ${errorData?.error || error.message}`
      );
    } else {
      logger.error(`❌ Error desconocido en ${method}:`, error);
    }
  }
}

// ============================================
// EXPORTAR INSTANCIA SINGLETON
// ============================================

/**
 * Instancia única del cliente API
 * Usar en todo el simulador para garantizar un solo token compartido
 */
export const apiClient = new ApiClient();
