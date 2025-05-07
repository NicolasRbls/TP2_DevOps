const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { auth, JWT_SECRET } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Database connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Routes d'authentification
// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validation de base
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Vérifier si l'utilisateur existe déjà
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Cet email ou nom d\'utilisateur est déjà utilisé' });
    }
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Créer le nouvel utilisateur
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    
    // Créer un token JWT
    const payload = {
      id: newUser.rows[0].id,
      username: newUser.rows[0].username
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    
    // Envoyer le token dans un cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 jour
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation de base
    if (!email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    // Créer un token JWT
    const payload = {
      id: user.rows[0].id,
      username: user.rows[0].username
    };
    
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    
    // Envoyer le token dans un cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 jour
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
    
    res.json({
      message: 'Connexion réussie',
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        email: user.rows[0].email
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Déconnexion
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Déconnexion réussie' });
});

// Obtenir l'utilisateur courant
app.get('/api/auth/user', auth, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username
    }
  });
});

// Routes pour les campagnes
// GET - Liste des campagnes de l'utilisateur
app.get('/api/campaigns', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM campaigns WHERE user_id = $1 ORDER BY id DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET - Une campagne par son ID
app.get('/api/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST - Créer une nouvelle campagne
app.post('/api/campaigns', auth, async (req, res) => {
  try {
    const { name, budget, status } = req.body;
    
    // Validation
    if (!name || !budget || !status) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    const result = await pool.query(
      'INSERT INTO campaigns (name, budget, status, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, budget, status, req.user.id]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT - Mettre à jour une campagne
app.put('/api/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, budget, status } = req.body;
    
    // Validation
    if (!name || !budget || !status) {
      return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    // Vérifier que la campagne appartient à l'utilisateur
    const checkCampaign = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (checkCampaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }
    
    const result = await pool.query(
      'UPDATE campaigns SET name = $1, budget = $2, status = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, budget, status, id, req.user.id]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE - Supprimer une campagne
app.delete('/api/campaigns/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier que la campagne appartient à l'utilisateur
    const checkCampaign = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    
    if (checkCampaign.rows.length === 0) {
      return res.status(404).json({ error: 'Campagne non trouvée' });
    }
    
    const result = await pool.query(
      'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.user.id]
    );
    
    res.json({ message: 'Campagne supprimée avec succès', campaign: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});