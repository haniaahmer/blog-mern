import jwt from 'jsonwebtoken';
import User from '../models/authModel.js';
import Admin from '../models/Admin.js';

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  console.log('🔍 [protect] Authorization header:', auth ? 'Present' : 'Missing');
  console.log('🔍 [protect] Token extracted:', token ? 'Present' : 'Missing');

  if (!token) {
    console.warn('⚠️ [protect] No token provided');
    return res.status(401).json({ error: 'No token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 [protect] JWT payload:', { id: payload.id, role: payload.role });

    let user = null;
    
    // Check User collection for editor
    if (payload.role === 'editor') {
      user = await User.findById(payload.id).select('email role name');
      console.log('🔍 [protect] User search result:', user ? 'Found in User collection' : 'Not found in User collection');
      if (user) {
        console.log('🔍 [protect] User data:', JSON.stringify(user.toObject(), null, 2));
      }
    }
    // Check Admin collection for admin or superadmin
    else if (payload.role === 'admin' || payload.role === 'superadmin') {
      user = await Admin.findById(payload.id).select('email role username');
      console.log('🔍 [protect] Admin search result:', user ? 'Found in Admin collection' : 'Not found in Admin collection');
      if (user) {
        console.log('🔍 [protect] Admin data:', JSON.stringify(user.toObject(), null, 2));
      }
    }

    if (!user) {
      console.warn(`⚠️ [protect] Invalid user for token with ID: ${payload.id}`);
      return res.status(401).json({ error: 'Invalid user' });
    }

    console.log('🔍 [protect] Found user:', {
      id: user._id,
      email: user.email,
      role: user.role,
      username: user.username || user.name
    });

    console.log(`🔑 [protect] Authenticated user: ${user.email || user.username}, role: ${user.role}`);
    req.user = { 
      id: user._id.toString(), 
      role: user.role,
      email: user.email,
      username: user.username || user.name
    };
    next();
  } catch (err) {
    console.error('❌ [protect] Token verification error:', err.message);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else {
      return res.status(401).json({ error: 'Authentication failed' });
    }
  }
};

export const authorize = (...roles) => (req, res, next) => {
  console.log('🔍 [authorize] Request user:', req.user);
  
  if (!req.user) {
    console.warn('⚠️ [authorize] No user in request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  console.log(`🔎 [authorize] Checking user role: ${req.user.role} against allowed roles: [${roles.join(', ')}]`);

  if (!roles.includes(req.user.role)) {
    console.warn(`⚠️ [authorize] Forbidden: user role '${req.user.role}' not in [${roles.join(', ')}]`);
    return res.status(403).json({
      error: `Access denied. Required roles: ${roles.join(', ')}`,
      userRole: req.user.role,
      allowedRoles: roles
    });
  }

  console.log(`✅ [authorize] User role '${req.user.role}' authorized`);
  next();
};