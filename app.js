import express from "express"; 
import bodyParser from "body-parser"; 
import ejsLayouts from "express-ejs-layouts"; 
import path from "path"; 
import dotenv from "dotenv"; 
import session from "express-session"; 
import passport from "passport"; 
import { Strategy as GoogleStrategy } from "passport-google-oauth20";

import { connectUsingMongoose } from "./config/mongodb.js"; 
import router from "./routes/routes.js"; 
import authrouter from "./routes/authRoutes.js"; 

dotenv.config(); 
const app = express(); 

// =====================
// MIDDLEWARES
// =====================

// Session middleware
app.use(
  session({
    secret: "SecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware thêm Student Info vào tất cả các page
// **Đặt sau session, passport, trước routes**
app.use((req, res, next) => {
  res.locals.studentID = "22689261"; 
  res.locals.fullName = "Le Quoc Khanh"; 
  next();
});

// =====================
// Passport Google Strategy
// =====================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL:
        "https://nodejs-authentication-system-l2pu.onrender.com/auth/google/callback",
      scope: ["profile", "email"],
    },
    function (accessToken, refreshToken, profile, callback) {
      callback(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// =====================
// Set Templates
// =====================
app.set("view engine", "ejs"); 
app.use(ejsLayouts); 
app.set("views", path.join(path.resolve(), "views")); 

// =====================
// DB Connection
// =====================
connectUsingMongoose();

// =====================
// ROUTES
// =====================

// Homepage render home.ejs
app.get("/", (req, res) => {
  res.render("home", { title: "Home Page" }); 
});

// Mount routers
app.use("/user", router);
app.use("/auth", authrouter);

// Static files
app.use(express.static("public"));

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
