require('dotenv').config();
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

async function hashUsers() {
  try {
    // Create promise-based connection
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    const [users] = await db.execute(
      "SELECT user_id, password FROM users WHERE password NOT LIKE '$2b$%'"
    );

    if (users.length === 0) {
      console.log('All passwords are already hashed.');
      process.exit();
    }

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await db.execute(
        'UPDATE users SET password = ? WHERE user_id = ?',
        [hashedPassword, user.user_id]
      );

      console.log(`Hashed password for user ID ${user.user_id}`);
    }

    await db.end();
    process.exit();

  } catch (error) {
    console.error('Hashing error:', error);
    process.exit(1);
  }
}

hashUsers();
