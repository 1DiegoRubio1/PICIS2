import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS: Permitir peticiones del frontend
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Middleware para JSON y sesión
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "mi_secreto_super_seguro",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      httpOnly: true, 
      secure: false, 
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000
    },
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// ======================
// 🎯 CONFIGURACIÓN DE GOOGLE OAUTH
// ======================

const googleAuthCallback = (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  let rol = "Analista";

  // Asigna roles personalizados según correo
  if (email === "cervantesmaxtlasaul@gmail.com") rol = "Gestor de autenticación de entidades humanas";
  else if (email === "geometrydas1@gmail.com") rol = "Responsable de autenticación";
  else if (email === "felipehiram.ramirez@gmail.com") rol = "Supervisor de entidades humanas";
  else if (email === "zamora.motoya.laura.ivanna@gmail.com") rol = "Gestor de autenticación de entidades no humanas";
  else if (email === "vianneyquevedo05@gmail.com") rol = "Supervisor";
  else if (email === "acevedo.romo.jimena.olivia@gmail.com") rol = "Responsable";
  else if (email === "arcebermudezm@gmai.com") rol = "Analista";

  const user = {
    id: profile.id,
    nombre: profile.displayName,
    correo: email,
    rol: rol 
  };

  console.log(`✅ Usuario autenticado: ${email} → ${rol}`);
  return done(null, user);
};

// ESTRATEGIA PARA LOGIN NORMAL
passport.use('google-login', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/callback",
    passReqToCallback: false
  },
  googleAuthCallback
));

// ESTRATEGIA PARA RE-AUTENTICACIÓN - CON ACCESO AL REQUEST
passport.use('google-reauth', new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/auth/google/reauthenticate/callback",
    passReqToCallback: true  // IMPORTANTE: Permitir acceso al request
  },
  (req, accessToken, refreshToken, profile, done) => {
    console.log("🔐 Re-autenticación - Session ID:", req.sessionID);
    console.log("🔐 Re-autenticación - Usuario original guardado:", req.session.originalUser?.correo);
    
    const email = profile.emails[0].value;
    let rol = "Analista";

    // Misma lógica de asignación de roles
    if (email === "cervantesmaxtlasaul@gmail.com") rol = "Gestor de autenticación de entidades humanas";
    else if (email === "geometrydas1@gmail.com") rol = "Responsable de autenticación";
    // ... resto de asignaciones

    const user = {
      id: profile.id,
      nombre: profile.displayName,
      correo: email,
      rol: rol 
    };

    console.log(`✅ Usuario re-autenticado: ${email} → ${rol}`);
    
    // IMPORTANTE: Preservar la sesión original
    req.session.originalUser = req.session.originalUser;
    req.session.reauthenticating = true;
    
    return done(null, user);
  }
));

// SERIALIZACIÓN SESIÓN
passport.serializeUser((user, done) => {
  console.log("🔐 Serializando usuario:", user.correo);
  done(null, user);
});

passport.deserializeUser((user, done) => {
  console.log("🔐 Deserializando usuario:", user?.correo);
  done(null, user);
});

// ======================
// 🔹 RUTAS DE AUTENTICACIÓN NORMAL
// ======================

// Iniciar sesión con Google
app.get("/auth/google", 
  passport.authenticate("google-login", { scope: ["profile", "email"] })
);

// Callback de Google normal
app.get(
  "/auth/google/callback",
  passport.authenticate("google-login", { failureRedirect: "http://localhost:5173/" }),
  (req, res) => {
    console.log("✅ Login exitoso, usuario:", req.user.correo);
    res.redirect(`http://localhost:5173/oauth-success?user=${encodeURIComponent(JSON.stringify(req.user))}`);
  }
);

// ======================
// 🔐 RUTAS DE RE-AUTENTICACIÓN
// ======================

// Middleware para debug de sesión
app.use((req, res, next) => {
  console.log("🔍 Sesión actual:", {
    sessionID: req.sessionID,
    user: req.user?.correo,
    originalUser: req.session.originalUser?.correo
  });
  next();
});

// Ruta específica para re-autenticación
app.get("/auth/google/reauthenticate", (req, res, next) => {
  if (!req.user) {
    console.log("❌ No hay usuario autenticado para re-autenticación");
    return res.redirect('http://localhost:5173/');
  }
  
  console.log("🔐 Iniciando re-autenticación forzada para:", req.user.correo);
  
  // Guardar usuario actual como original en la sesión ACTUAL
  req.session.originalUser = {
    id: req.user.id,
    nombre: req.user.nombre,
    correo: req.user.correo,
    rol: req.user.rol
  };
  
  console.log("✅ Usuario original guardado en sesión:", req.session.originalUser.correo);
  console.log("🔐 Session ID actual:", req.sessionID);
  
  passport.authenticate("google-reauth", { 
    scope: ["profile", "email"],
    prompt: "select_account consent",
    accessType: "offline",
    loginHint: req.user.correo,
    includeGrantedScopes: true
  })(req, res, next);
});

// CALLBACK DE RE-AUTENTICACIÓN 
app.get(
  "/auth/google/reauthenticate/callback",
  (req, res, next) => {
    console.log("🔐 Callback de re-autenticación - Session ID:", req.sessionID);
    console.log("🔐 Callback - Usuario original en sesión:", req.session.originalUser?.correo);
    
    // Guardar el originalUser antes de que Passport lo sobreescriba
    const savedOriginalUser = req.session.originalUser;
    
    passport.authenticate("google-reauth", (err, user, info) => {
      if (err) {
        console.error("❌ Error en re-autenticación:", err);
        return res.redirect("http://localhost:5173/reauthentication-failed");
      }
      if (!user) {
        console.log("❌ Re-autenticación fallida - no user");
        return res.redirect("http://localhost:5173/reauthentication-failed");
      }
      
      // Manualmente loguear al usuario preservando la sesión
      req.logIn(user, (err) => {
        if (err) {
          console.error("❌ Error en req.logIn:", err);
          return res.redirect("http://localhost:5173/reauthentication-failed");
        }
        
        console.log("🔐 Después de logIn - Session ID:", req.sessionID);
        console.log("🔐 Usuario re-autenticado:", user.correo);
        console.log("🔐 Usuario original guardado:", savedOriginalUser?.correo);
        
        // Restaurar el originalUser en la sesión
        req.session.originalUser = savedOriginalUser;
        req.session.reauthenticated = true;
        req.session.reauthenticatedAt = Date.now();
        
        console.log("🔐 Estado final - Usuario original:", req.session.originalUser?.correo);
        
        // Verificar coincidencia
        if (savedOriginalUser && user.correo === savedOriginalUser.correo) {
          console.log("✅ Re-autenticación exitosa - usuarios coinciden");
          res.redirect("http://localhost:5173/reauthentication-success");
        } else {
          console.log("❌ Re-autenticación fallida - usuarios diferentes");
          res.redirect("http://localhost:5173/reauthentication-failed");
        }
      });
    })(req, res, next);
  }
);

// Verificar estado de re-autenticación
app.get("/auth/reauthentication-status", (req, res) => {
  const isReauthenticated = req.session.reauthenticated && 
                           req.session.reauthenticatedAt && 
                           (Date.now() - req.session.reauthenticatedAt) < 300000;
  
  console.log("🔍 Verificando estado de re-autenticación:", {
    reauthenticated: req.session.reauthenticated,
    reauthenticatedAt: req.session.reauthenticatedAt,
    isReauthenticated,
    tiempoRestante: req.session.reauthenticatedAt ? (300000 - (Date.now() - req.session.reauthenticatedAt)) / 1000 + ' segundos' : 'N/A',
    originalUser: req.session.originalUser?.correo
  });
  
  // SOLO verificar, NO resetear
  res.json({ 
    authenticated: isReauthenticated,
    reauthenticatedAt: req.session.reauthenticatedAt
  });
});

// Resetear explícitamente el estado de re-autenticación
app.post("/auth/reset-reauthentication", (req, res) => {
  console.log("🔄 Reseteando estado de re-autenticación explícitamente");
  req.session.reauthenticated = false;
  req.session.reauthenticatedAt = null;
  res.json({ success: true });
});

// ======================
// 🔹 RUTAS GENERALES
// ======================

// Obtener usuario autenticado
app.get("/api/user", (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  if (req.user) {
    console.log("API User - Sesión activa:", req.user.correo);
    return res.json(req.user);
  }
  console.log("API User - No hay sesión activa");
  res.status(401).json({ message: "No autenticado" });
});

// Obtener información de sesión completa (para debugging)
app.get("/api/session-info", (req, res) => {
  res.json({ 
    sessionID: req.sessionID,
    user: req.user,
    originalUser: req.session.originalUser,
    reauthenticated: req.session.reauthenticated,
    reauthenticatedAt: req.session.reauthenticatedAt
  });
});

// Logout
app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destruyendo sesión:', err);
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Sesión cerrada correctamente' });
    });
  });
});

// Laura
import entidadesRouter from "./backend/routes/entidades.routes.js";
app.use("/entidades", entidadesRouter);

import solicitudesRoutes from "./backend/routes/solicitudes.routes.js";
app.use("/solicitudes", solicitudesRoutes);


// INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`✅ Servidor escuchando en http://localhost:${PORT}`);
});