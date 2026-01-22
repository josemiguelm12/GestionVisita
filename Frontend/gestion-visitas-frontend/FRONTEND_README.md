# 🚀 Gestión de Visitas - Frontend

Frontend desarrollado con React + Vite + TypeScript + TailwindCSS para el sistema de gestión de visitas.

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Backend API ejecutándose en `https://localhost:5125`

## 🛠️ Instalación

```powershell
# Instalar dependencias
npm install
```

## 🚀 Desarrollo

```powershell
# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: http://localhost:5173/

## 🏗️ Build para Producción

```powershell
# Compilar para producción
npm run build

# Previsualizar build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── api/                    # Configuración de Axios y llamadas a la API
│   ├── axiosConfig.ts      # Cliente Axios con interceptors
│   ├── authApi.ts          # Endpoints de autenticación
│   ├── visitorApi.ts       # Endpoints de visitantes
│   ├── visitApi.ts         # Endpoints de visitas
│   └── statsApi.ts         # Endpoints de estadísticas
├── components/             # Componentes reutilizables
│   ├── auth/               # Componentes de autenticación
│   ├── common/             # Componentes comunes (botones, inputs, etc)
│   ├── dashboard/          # Componentes del dashboard
│   ├── layout/             # Layout y navegación
│   ├── visitors/           # Componentes de visitantes
│   └── visits/             # Componentes de visitas
├── context/                # Context API
│   └── AuthContext.tsx     # Contexto de autenticación
├── hooks/                  # Custom hooks
│   └── useAuth.ts          # Hook de autenticación
├── pages/                  # Páginas principales
│   ├── Dashboard.tsx       # Dashboard principal
│   ├── Login.tsx           # Página de login
│   ├── Visitors.tsx        # Gestión de visitantes
│   ├── Visits.tsx          # Gestión de visitas
│   └── NotFound.tsx        # Página 404
├── types/                  # Tipos TypeScript
│   ├── auth.types.ts       # Tipos de autenticación
│   ├── visitor.types.ts    # Tipos de visitantes
│   ├── visit.types.ts      # Tipos de visitas
│   └── stats.types.ts      # Tipos de estadísticas
├── utils/                  # Funciones utilitarias
│   ├── formatters.ts       # Formateo de datos
│   └── validators.ts       # Validaciones
├── App.tsx                 # Componente principal
└── main.tsx                # Punto de entrada
```

## 🔐 Credenciales de Prueba

```
Email: admin@gestionvisitas.com
Password: Admin123!
```

## 🎨 Tecnologías

- **React 19** - Framework UI
- **Vite** - Build tool
- **TypeScript** - Tipado estático
- **TailwindCSS** - Estilos
- **React Router** - Navegación
- **Axios** - Cliente HTTP
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos
- **Date-fns** - Manejo de fechas
- **Recharts** - Gráficas
- **React Hook Form** - Formularios
- **Zod** - Validación de esquemas

## 🔧 Variables de Entorno

Crea un archivo `.env.development` con:

```env
VITE_API_BASE_URL=https://localhost:5125/api
VITE_APP_NAME=Gestión de Visitas
```

## ✅ Estado Actual (Fase 1 Completada)

- ✅ Proyecto React configurado con Vite + TypeScript
- ✅ TailwindCSS configurado
- ✅ Estructura de carpetas creada
- ✅ Tipos TypeScript definidos
- ✅ Axios configurado con interceptors JWT
- ✅ API calls implementadas (auth, visitors, visits, stats)
- ✅ AuthContext y hooks creados
- ✅ Sistema de autenticación funcional
- ✅ Rutas protegidas implementadas
- ✅ Componente de Login funcional
- ✅ Páginas básicas creadas

## 📝 Próximas Fases

### Fase 2: Dashboard y Layout
- Layout con Navbar y Sidebar
- Dashboard con KPIs y estadísticas
- Gráficas de visitas

### Fase 3: Gestión de Visitantes
- Lista de visitantes con búsqueda
- Formulario de creación/edición
- Vista de detalles

### Fase 4: Gestión de Visitas
- Lista de visitas activas/históricas
- Formulario de registro de visita
- Cierre de visitas

## 🐛 Troubleshooting

### Error: Cannot find module 'lucide-react'
```powershell
npm install lucide-react
```

### Error: CORS
Verifica que el backend tenga CORS configurado para `http://localhost:5173`

### Error de autenticación
Verifica que el backend esté ejecutándose en `https://localhost:5125`

## 📞 Soporte

Para más información, revisa la documentación del backend en `Backend/docs/`
