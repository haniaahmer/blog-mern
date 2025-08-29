// Optional auth middleware (add this to your auth.js file)
export const optionalAuth = async (req, res, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    // No token, but we'll continue anyway
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    let user = null;
    
    if (payload.role === 'editor') {
      user = await User.findById(payload.id).select('email role name');
    } else if (payload.role === 'admin' || payload.role === 'superadmin') {
      user = await Admin.findById(payload.id).select('email role username');
    }

    if (user) {
      req.user = { 
        id: user._id.toString(), 
        role: user.role,
        email: user.email,
        username: user.username || user.name
      };
    } else {
      req.user = null;
    }
    
    next();
  } catch (err) {
    // If token is invalid, just continue without user
    req.user = null;
    next();
  }
};