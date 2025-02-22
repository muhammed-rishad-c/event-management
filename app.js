import express from "express";
import path from 'path';
import { fileURLToPath } from 'url';
import userRoutes from './routes/user.js';
import adminRoutes from './routes/admin.js';
import session from 'express-session';

const app=express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = 3000;

app.use('/uploads', express.static('public/uploads'));

// Session middleware
app.use(session({
  secret: 'your-secret-key',
  resave: false, 
  saveUninitialized: true,
  cookie: { secure: false } // Set secure: true in production
})); 

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
  
app.use('/user', userRoutes);
app.use('/admin', adminRoutes);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('starting'); // Use render instead of sendFile
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});