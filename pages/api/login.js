
import { loginHandler } from '../../auth';

export default function handler(req, res) {
  if (req.method === 'POST') {
    return loginHandler(req, res);
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
