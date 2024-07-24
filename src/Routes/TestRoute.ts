import express from 'express';
import { getData } from '../Controllers/TestController';

const router = express.Router();

router.get('/files', getData);

export default router;
