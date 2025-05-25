import e from "express";
import { authenticateUser } from "../middleware/authuser.js";
import { addNewBooks, addReviewToBook, deleteReview, getBookById, getBooksWithPagination, searchBooks, updateReview } from "../controllers/books-controller.js";

const router = e.Router();

router.get("/books",getBooksWithPagination);
router.post("/books",authenticateUser,addNewBooks);
router.get("/books/:id",getBookById);
router.post('/books/:id/reviews', authenticateUser, addReviewToBook);
router.put("/reviews/:id", authenticateUser, updateReview);
router.delete("/reviews/:id", authenticateUser, deleteReview);
router.get('/search', searchBooks);

export default router;