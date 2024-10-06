
import { loginHandler } from '../../auth';
import session from 'express-session';

export default function handler(req, res) {
  session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  })(req, res, () => {
    return loginHandler(req, res);
  });
}
