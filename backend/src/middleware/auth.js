const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'votre_clé_secrète_super_sécurisée';

const auth = (req, res, next) => {
  try {
    // Récupérer le token du cookie ou de l'en-tête Authorization
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).json({ error: 'Accès non autorisé - Token manquant' });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Ajouter l'utilisateur à l'objet requête
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ error: 'Accès non autorisé - Token invalide' });
  }
};

module.exports = { auth, JWT_SECRET };