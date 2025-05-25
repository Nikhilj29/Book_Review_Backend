import {db} from "../index.js";
import jwt from "jsonwebtoken";

export const authenticateUser = async (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(300).json({ message: "Missing authorization header", success: false });
    }
    const token = String(req.headers.authorization).split(" ")[1];
  
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }
  
    try {
      const decoded = jwt.decode(token);
      if (!decoded || !decoded.username) {
        return res.status(401).json({success:false, error: 'Invalid token or missing username' });
      }
  
      const username = decoded.username;
  
      const result = await db.query('SELECT * FROM usercredential WHERE username = $1', [username]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({success:false, error: 'User not found in database' });
      }

      req.user = {
        name: username,
        id: username 
      };
     
  
      return next();
  
    } catch (err) {
      console.error('Authentication error:', err);
      return res.status(500).json({success:false, error: 'Internal server error' });
    }
  };