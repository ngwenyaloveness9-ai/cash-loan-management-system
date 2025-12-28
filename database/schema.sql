CREATE TABLE branches (
  branch_id INT AUTO_INCREMENT PRIMARY KEY,
  branch_name VARCHAR(100) NOT NULL,
  location VARCHAR(150),
  contact_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  branch_id INT NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('borrower', 'officer', 'admin') NOT NULL,
  status ENUM('active', 'blocked') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);
CREATE TABLE loans (
  loan_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  loan_amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2),
  repayment_period INT,
  loan_status ENUM('pending', 'approved', 'rejected', 'closed') DEFAULT 'pending',
  approved_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id),
  FOREIGN KEY (approved_by) REFERENCES users(user_id)
);
CREATE TABLE payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  user_id INT NOT NULL,
  branch_id INT NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (branch_id) REFERENCES branches(branch_id)
);
CREATE TABLE loan_documents (
  document_id INT AUTO_INCREMENT PRIMARY KEY,
  loan_id INT NOT NULL,
  document_type VARCHAR(50),
  file_path VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(loan_id)
);
CREATE TABLE audit_logs (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id)
);
