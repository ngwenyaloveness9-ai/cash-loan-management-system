-- ===============================
-- BRANCHES
-- ===============================
INSERT INTO branches (branch_name, location, contact_number)
VALUES
('KBN Branch', 'Kabokweni', '0130001111'),
('PIENAAR Branch', 'Tsila', '0130002222'),
('LKZ Branch', 'Lekazi', '0130003333');


-- ===============================
-- ADMIN USER (Head Office)
-- ===============================
INSERT INTO users (branch_id, full_name, email, password, phone, address, role)
VALUES (
  1,
  'System Admin',
  'admin@loanapp.com',
  'admin123',
  '0100000000',
  'Kabokweni',
  'admin'
);


-- ===============================
-- LOAN OFFICER (KBN Branch)
-- ===============================
INSERT INTO users (branch_id, full_name, email, password, phone, address, role)
VALUES (
  1,
  'KBN Loan Officer',
  'officer@loanapp.com',
  'officer123',
  '0101112222',
  'Kabokweni',
  'officer'
);


-- ===============================
-- BORROWER (PIENAAR Branch)
-- ===============================
INSERT INTO users (branch_id, full_name, email, password, phone, address, role)
VALUES (
  2,
  'Test Borrower',
  'borrower@loanapp.com',
  'borrower123',
  '0103334444',
  'Tsila',
  'borrower'
);
