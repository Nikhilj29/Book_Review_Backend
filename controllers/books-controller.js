import {db} from "../index.js";
import moment from "moment";

export const addNewBooks =async (req, res) => {
    try {
      const { title, author, genre, description, published_date } = req.body;
  
      if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
      }
  
    
  
      const createdAt = moment().unix();
      const updatedAt = createdAt;
      const reviews = '[]';
  
      const insertQuery = `
        INSERT INTO books (title, author, genre, description, published_date, reviews, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
  
      const values = [title, author, genre || null, description || null, published_date || null, reviews, createdAt, updatedAt];
  
      const { rows } = await db.query(insertQuery, values);
  
      return res.status(201).json({success:true, message: 'Book added successfully', book: rows[0] });
    } catch (err) {
      console.error('Error adding book:', err);
      return res.status(500).json({success:false, error: 'Internal server error' });
    }
  }


  export const getBooksWithPagination = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
  
      if (page < 1 || limit < 1) {
        return res.status(400).json({ success: false, error: 'Page and limit must be positive integers' });
      }
  
      const offset = (page - 1) * limit;
  
      const countQuery = 'SELECT COUNT(*) FROM books';
      const { rows: countResult } = await db.query(countQuery);
      const totalBooks = parseInt(countResult[0].count);
  
      const selectQuery = `
        SELECT * FROM books
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
  
      const { rows } = await db.query(selectQuery, [limit, offset]);
  
      return res.status(200).json({
        success: true,
        books: rows,
        pagination: {
          total: totalBooks,
          page,
          limit,
          totalPages: Math.ceil(totalBooks / limit)
        }
      });
    } catch (err) {
      console.error('Error retrieving books:', err);
      return res.status(500).json({ success: false, error: 'Internal server error' });
    }
  };
  
  export const getBookById = async (req, res) => {
    try {
      const bookId = req.params.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;
      const offset = (page - 1) * limit;
  
      const bookQuery = `SELECT * FROM books WHERE id = $1`;
      const { rows } = await db.query(bookQuery, [bookId]);
  
      if (rows.length === 0) {
        return res.status(404).json({ success: false, error: "Book not found" });
      }
  
      const book = rows[0];
  
      let reviews = JSON.parse(book.reviews || '[]');
  
      const averageRating =
        reviews.length > 0
          ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
          : null;
  
      const paginatedReviews = reviews.slice(offset, offset + limit);
  
      return res.status(200).json({
        success: true,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          genre: book.genre,
          description: book.description,
          published_date: book.published_date,
          average_rating: averageRating,
          total_reviews: reviews.length,
          reviews: paginatedReviews,
          review_pagination: {
            page,
            limit,
            total_pages: Math.ceil(reviews.length / limit)
          }
        }
      });
    } catch (err) {
      console.error("Error fetching book by ID:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

export const addReviewToBook = async (req, res) => {
  try {
    const bookId = parseInt(req.params.id, 10);
    const { comment, rating } = req.body;
    const username = req.user?.name;
    console.log(bookId,"bookId")

    if (!username) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
    }

    const bookResult = await db.query('SELECT reviews FROM books WHERE id = $1', [bookId]);
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: "Book not found" });
    }

    let reviews = [];
    try {
      reviews = JSON.parse(bookResult.rows[0].reviews || "[]");
    } catch {
      reviews = [];
    }

    const userHasReviewed = reviews.some(r => r.user === username);
    if (userHasReviewed) {
      return res.status(400).json({ success: false, error: "You have already reviewed this book" });
    }

    const newReview = {
      user: username,
      comment: comment || "",
      rating,
      created_at: moment().unix()
    };

    reviews.push(newReview);

    await db.query('UPDATE books SET reviews = $1, updated_at = $2 WHERE id = $3', [
      JSON.stringify(reviews),
      moment().unix(),
      bookId
    ]);

    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: newReview
    });

  } catch (err) {
    console.error("Error adding review:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
};

export const updateReview = async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const { comment, rating } = req.body;
      const username = req.user?.name;
  
      if (!username) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }
  
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({ success: false, error: "Rating must be between 1 and 5" });
      }
  
      const bookResult = await db.query('SELECT reviews FROM books WHERE id = $1', [bookId]);
      if (bookResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Book not found" });
      }
  
      let reviews = [];
      try {
        reviews = JSON.parse(bookResult.rows[0].reviews || "[]");
      } catch {
        reviews = [];
      }
  
      const reviewIndex = reviews.findIndex(r => r.user === username);
      if (reviewIndex === -1) {
        return res.status(404).json({ success: false, error: "Review not found for user" });
      }
  
      if (comment !== undefined) reviews[reviewIndex].comment = comment;
      if (rating !== undefined) reviews[reviewIndex].rating = rating;
      reviews[reviewIndex].updated_at = moment().unix();
  
      await db.query(
        'UPDATE books SET reviews = $1, updated_at = $2 WHERE id = $3',
        [JSON.stringify(reviews), moment().unix(), bookId]
      );
  
      return res.status(200).json({ success: true, message: "Review updated", review: reviews[reviewIndex] });
  
    } catch (err) {
      console.error("Error updating review:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };

  export const deleteReview = async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const username = req.user?.name;
  
      if (!username) {
        return res.status(401).json({ success: false, error: "Authentication required" });
      }
  
      const bookResult = await db.query('SELECT reviews FROM books WHERE id = $1', [bookId]);
      if (bookResult.rows.length === 0) {
        return res.status(404).json({ success: false, error: "Book not found" });
      }
  
      let reviews = [];
      try {
        reviews = JSON.parse(bookResult.rows[0].reviews || "[]");
      } catch {
        reviews = [];
      }
  
      const reviewIndex = reviews.findIndex(r => r.user === username);
      if (reviewIndex === -1) {
        return res.status(404).json({ success: false, error: "Review not found for user" });
      }
  
      reviews.splice(reviewIndex, 1);
  
      await db.query(
        'UPDATE books SET reviews = $1, updated_at = $2 WHERE id = $3',
        [JSON.stringify(reviews), moment().unix(), bookId]
      );
  
      return res.status(200).json({ success: true, message: "Review deleted" });
  
    } catch (err) {
      console.error("Error deleting review:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };


  export const searchBooks = async (req, res) => {
    try {
      const searchQuery = req.query.book;
  
      if (!searchQuery || searchQuery.trim() === "") {
        return res.status(400).json({ success: false, error: "Search query is required" });
      }
  
      const query = `
        SELECT * FROM books
        WHERE title ILIKE $1 OR author ILIKE $1
      `;
  
      const values = [`%${searchQuery}%`];
  
      const { rows } = await db.query(query, values);
  
      return res.status(200).json({ success: true, results: rows });
    } catch (err) {
      console.error("Error searching books:", err);
      return res.status(500).json({ success: false, error: "Internal server error" });
    }
  };
  