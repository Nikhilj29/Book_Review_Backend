# 📚 Book Review Backend
A backend API for creating and managing book reviews. It supports user authentication, book management, and review functionality with secure access control using JWT.

## 🚀 Project Setup Instructions

1. Clone the repository:
   git clone https://github.com/Nikhilj29/Book_Review_Backend.git
   cd Book_Review_Backend
   
2. Install dependencies:
   npm install

3.Create an environment file:
   POSTGRESS_USER=your_postgres_username
   POSTGRESS_PASS=your_postgres_password
   POSTGRES_DATABASE=your_database_name
   POSTGRES_HOST=localhost
   POSTGRES_PORT=5432
   JWT_TOKEN=your_jwt_secret

4.Set up PostgreSQL
   Ensure PostgreSQL is installed and running.
   Create a database matching of which design is explained below.
   Run migration scripts if included.

5.Start the server:
   node index.js or if you nhave nodemon install then nodemon index.js


## 💻 How to Run Locally

1.Make sure PostgreSQL is running and your .env file is configured.
2.Run the development server.
3.View log f server running and database connected.

## 🔄 Example API Requests

POST /signup
curl --location 'http://localhost:5000/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username":"bharati",
    "password":"bharati@123"
}'

POST /login
curl --location 'http://localhost:5000/login' \
--header 'Content-Type: application/json' \
--data-raw '{
    "username":"bharati",
    "password":"bharati@123"
}'

POST /books
curl --location 'http://localhost:5000/books' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJoYXJhdGkiLCJpYXQiOjE3NDgxNTU3OTYsImV4cCI6MTc0ODE1OTM5Nn0.PUHpNi6NI_6MKIiP46PtGMrE8NpgyrQZZvaA92shC5U' \
--data '{
            "id": 11,
            "title": "The Titan",
            "author": "Paulo Coelho",
            "genre": "Adventure",
            "description": "A young shepherd’s journey to find his personal legend.",
            "published_date": "577152000"
        }'

GET /books
curl --location 'http://localhost:5000/books?page=1&limit=5'

GET /books/:id
curl --location 'http://localhost:5000/books/12'

POST /books/:id/reviews
curl --location 'http://localhost:5000/books/12/reviews' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJoYXJhdGkiLCJpYXQiOjE3NDgxNTU3OTYsImV4cCI6MTc0ODE1OTM5Nn0.PUHpNi6NI_6MKIiP46PtGMrE8NpgyrQZZvaA92shC5U' \
--data '{
    "comment":"This Book is Awesome!!!",
    "rating":5
}'

PUT /reviews/:id
curl --location --request PUT 'http://localhost:5000/reviews/12' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJoYXJhdGkiLCJpYXQiOjE3NDgxNTU3OTYsImV4cCI6MTc0ODE1OTM5Nn0.PUHpNi6NI_6MKIiP46PtGMrE8NpgyrQZZvaA92shC5U' \
--data '{
    "comment":"This Book is Bad!!!",
    "rating":1
}'

DELETE /reviews/:id 
curl --location --request DELETE 'http://localhost:5000/reviews/12' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJoYXJhdGkiLCJpYXQiOjE3NDgxNTU3OTYsImV4cCI6MTc0ODE1OTM5Nn0.PUHpNi6NI_6MKIiP46PtGMrE8NpgyrQZZvaA92shC5U'


GET /search 
curl --location 'http://localhost:5000/search?book=to'

## DataBase Design 

Database Schema
This project uses two main tables: usercredential and books.

1. usercredential Table
Stores user authentication details.

Column	| Type	| Description
userid	| SERIAL	| Primary key (auto-increment)
username	| TEXT	| Unique username
password	| TEXT	| Hashed password (bcrypt format)

2. books Table
Stores book details along with reviews as JSON.

 Column          | Type   | Description                                                       
 
 id              | SERIAL | Primary key (auto-increment)                                      
 title           | TEXT   | Title of the book                                                 
 author          | TEXT   | Author of the book                                                
 genre           | TEXT   | Book genre/category                                               
 description     | TEXT   | Brief description of the book                                     
 published\_date | BIGINT | Published date (Unix timestamp in seconds)                        
 reviews         | JSONB  | JSON array of reviews (`user`, `comment`, `rating`, `created_at`) 
 created\_at     | BIGINT | Record creation timestamp (Unix timestamp)                        
 updated\_at     | BIGINT | Record last update timestamp (Unix timestamp)                     
