import express from 'express';
const router = express.Router();
import * as flashcardsController from './flashcards.controller.js';
import auth from '../../middlewares/token_validation.js';

// Mounted at /user/flashcards. Decks are private to the learner who owns them,
// so every route is behind a token.
router.get('/', auth.checkToken, flashcardsController.listDecks);
router.get('/due', auth.checkToken, flashcardsController.dueCards);
router.post('/generate', auth.checkToken, flashcardsController.generateDeck);
router.post('/', auth.checkToken, flashcardsController.createCard);
router.post('/:id/review', auth.checkToken, flashcardsController.reviewCard);
router.patch('/:id', auth.checkToken, flashcardsController.updateCard);
router.delete('/:id', auth.checkToken, flashcardsController.deleteCard);

export default router;
