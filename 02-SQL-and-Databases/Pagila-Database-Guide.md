# Pagila Sample Database: Schema & Practice Guide

## 1. Purpose
The Pagila sample database is a comprehensive relational database model representing a DVD rental business. It provides a realistic, highly normalized schema (3NF) populated with realistic data, making it the standard resource for learning SQL, query optimization, and relational database administration.

- **Repository Location:** [`D:\Learning\Databases\PostgreSQL\Resources\Pagila-Sample-Database\`](file:///D:/Learning/Databases/PostgreSQL/Resources/Pagila-Sample-Database/)
- **License:** PostgreSQL License

---

## 2. Prerequisites
- Basic understanding of relational concepts (tables, primary keys, foreign keys, one-to-many relationships).
- Basic SQL syntax (`SELECT`, `WHERE`, `JOIN`, `GROUP BY`).

---

## 3. What You Will Learn
- Real-world relational schema architecture: table normalization, surrogate keys, composite keys, and foreign key constraints.
- Multi-table JOIN operations connecting customers, rentals, payments, inventory, and film metadata.
- Query optimization concepts: indexes, foreign key lookup efficiency, and B-Tree mechanics.
- View and trigger design: materialized views, stored procedures, and audit columns (`last_update`).

---

## 4. Repository Structure: Key Files vs. Infrastructure

```
Pagila-Sample-Database/
├── pagila-schema.sql         <-- ESSENTIAL: Complete DDL (tables, constraints, views, indexes)
├── pagila-data.sql           <-- ESSENTIAL: Complete dataset (~45 MB of INSERT statements)
├── pagila-insert-data.sql    <-- ALTERNATIVE: Single large transaction variant
├── README.md                 <-- Upstream overview and release history
└── .git/                     <-- IGNORE: Git history metadata
```

### Which Files Matter to a Learner
1. **`pagila-schema.sql`:** Read this file first. It contains every `CREATE TABLE`, `CREATE INDEX`, `ALTER TABLE ... ADD CONSTRAINT`, and view definition. Studying this file teaches you how a production-grade relational database is designed.
2. **`pagila-data.sql`:** Contains realistic test records (thousands of films, actors, customers, rentals, and payments).

---

## 5. Entity Relationship Overview

The Pagila schema is organized into three major business subsystems:

```
+-----------------------------------------------------------------------------------+
| 1. FILM CATALOG                                                                   |
|    actor <---(film_actor)---> film <---(film_category)---> category               |
|                                 |                                                 |
|                                 v                                                 |
| 2. INVENTORY & STORES       inventory                                             |
|                                 |                                                 |
|                                 v                                                 |
| 3. RENTAL TRANSACTIONS        rental <-------- customer                           |
|                                 |                 |                               |
|                                 v                 v                               |
|                              payment ---------> staff                             |
+-----------------------------------------------------------------------------------+
```

### Core Business Entities
- **`film`:** Core movie catalog (title, description, release year, rental rate, replacement cost, rating).
- **`inventory`:** Physical copies of a film stocked at a specific store (`film_id`, `store_id`).
- **`customer`:** Registered users eligible to rent movies (`customer_id`, `store_id`, `email`, `active`).
- **`rental`:** The transaction of a customer taking out a copy of a film (`rental_date`, `return_date`).
- **`payment`:** Financial transactions recorded for each rental (`amount`, `payment_date`).

---

## 6. Progressive SQL Practice Exercises

You can write and test these queries mentally against `pagila-schema.sql` or against a local PostgreSQL database:

### Level 1: Basic Filtering and Inner Joins
- **Task:** Find the top 10 longest films in the catalog rated 'PG-13'.
  ```sql
  SELECT title, length, rating, rental_rate
  FROM film
  WHERE rating = 'PG-13'
  ORDER BY length DESC
  LIMIT 10;
  ```
- **Task:** List all movies rented by customer 'MARY SMITH' along with the rental dates.
  ```sql
  SELECT f.title, r.rental_date, r.return_date
  FROM customer c
  JOIN rental r ON c.customer_id = r.customer_id
  JOIN inventory i ON r.inventory_id = i.inventory_id
  JOIN film f ON i.film_id = f.film_id
  WHERE c.first_name = 'MARY' AND c.last_name = 'SMITH'
  ORDER BY r.rental_date DESC;
  ```

### Level 2: Grouping and Aggregations
- **Task:** Calculate total revenue generated per film category.
  ```sql
  SELECT c.name AS category_name, SUM(p.amount) AS total_revenue
  FROM category c
  JOIN film_category fc ON c.category_id = fc.category_id
  JOIN film f ON fc.film_id = f.film_id
  JOIN inventory i ON f.film_id = i.film_id
  JOIN rental r ON i.inventory_id = r.inventory_id
  JOIN payment p ON r.rental_id = p.rental_id
  GROUP BY c.name
  ORDER BY total_revenue DESC;
  ```

### Level 3: Advanced Analytic Window Functions
- **Task:** Rank the top 3 highest-spending customers within each store.
  ```sql
  WITH customer_spend AS (
      SELECT c.store_id, c.customer_id, c.first_name, c.last_name,
             SUM(p.amount) AS total_spent
      FROM customer c
      JOIN payment p ON c.customer_id = p.customer_id
      GROUP BY c.store_id, c.customer_id, c.first_name, c.last_name
  ),
  ranked_spend AS (
      SELECT store_id, customer_id, first_name, last_name, total_spent,
             DENSE_RANK() OVER (PARTITION BY store_id ORDER BY total_spent DESC) AS rnk
      FROM customer_spend
  )
  SELECT store_id, customer_id, first_name, last_name, total_spent, rnk
  FROM ranked_spend
  WHERE rnk <= 3;
  ```

---

## 7. Common Pitfalls When Studying Schemas
- **Confusing `film` with `inventory`:** A customer does not rent a `film` record; they rent an `inventory` item (a specific physical copy owned by a specific store).
- **Cartesian Product (Missing JOIN Predicates):** Joining 5 tables without explicit `ON` conditions results in massive cross joins. Always specify the foreign key relationship.
- **Ignoring Indexes:** When examining `pagila-schema.sql`, notice which columns have indexes (`CREATE INDEX idx_fk_customer_id ON payment(customer_id);`). Without this index, calculating customer revenue requires a full sequential scan of the payment table.

---

## 8. Companion Materials in this Library
- [`Use-The-Index-Luke.md`](file:///D:/Learning/Databases/SQL/Notes/Use-The-Index-Luke.md) — How PostgreSQL uses B-Trees and execution plans on tables like `payment`.
- [`PostgreSQL-16-Documentation.pdf`](file:///D:/Learning/Databases/PostgreSQL/PDFs/PostgreSQL-16-Documentation.pdf) — Official PostgreSQL reference manual.
- [`PGExercises-Index.md`](file:///D:/Learning/Databases/SQL/Resources/PGExercises-Index.md) — Step-by-step query practice problems.
