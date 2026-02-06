const pool = require('../config/database');

class UserModel {
  // Find all users
  // Handle both 'name' and 'full_name' column names
  static async findAll() {
    try {
      // Try with name column first
      const [rows] = await pool.query(
        'SELECT id, name, email, phone, role, created_at, updated_at FROM users'
      );
      return rows;
    } catch (error) {
      // If name column doesn't exist, try with full_name
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        const [rows] = await pool.query(
          'SELECT id, full_name as name, email, phone, role, created_at, updated_at FROM users'
        );
        return rows;
      }
      throw error;
    }
  }

  // Find user by ID
  // Handle both 'name' and 'full_name' column names
  static async findById(id) {
    try {
      // Try with name column first
      const [rows] = await pool.query(
        'SELECT id, name, email, phone, role, created_at, updated_at FROM users WHERE id = ?',
        [id]
      );
      if (rows.length > 0) {
        return rows[0];
      }
    } catch (error) {
      // If name column doesn't exist, try with full_name
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        const [rows] = await pool.query(
          'SELECT id, full_name as name, email, phone, role, created_at, updated_at FROM users WHERE id = ?',
          [id]
        );
        return rows[0] || null;
      }
      throw error;
    }
    return null;
  }

  // Find user by email (includes password_hash for auth)
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Create new user
  // Handle both 'name' and 'full_name' column names for backward compatibility
  static async create(userData) {
    const { name, email, password_hash, phone, role } = userData;
    
    // Validate required fields
    if (!name || !email || !password_hash) {
      throw new Error('Name, email, and password_hash are required');
    }

    // Try different column combinations based on database schema
    // Priority: 1) name + phone, 2) full_name + phone, 3) name only, 4) full_name only
    try {
      // Try 1: name + phone
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
        [name, email, password_hash, phone || null, role || 'CUSTOMER']
      );
      return this.findById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR') {
        // Try 2: full_name + phone
        try {
          const [result] = await pool.query(
            'INSERT INTO users (full_name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, password_hash, phone || null, role || 'CUSTOMER']
          );
          return this.findById(result.insertId);
        } catch (error2) {
          if (error2.code === 'ER_BAD_FIELD_ERROR' && error2.message.includes('phone')) {
            // Try 3: name only (no phone)
            try {
              const [result] = await pool.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                [name, email, password_hash, role || 'CUSTOMER']
              );
              return this.findById(result.insertId);
            } catch (error3) {
              // Try 4: full_name only (no phone)
              if (error3.code === 'ER_BAD_FIELD_ERROR' && error3.message.includes('name')) {
                const [result] = await pool.query(
                  'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
                  [name, email, password_hash, role || 'CUSTOMER']
                );
                return this.findById(result.insertId);
              }
              throw error3;
            }
          }
          throw error2;
        }
      }
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    const { name, email, role } = userData;
    await pool.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    return this.findById(id);
  }

  /**
   * Update user (admin) - full_name/name, email, phone, role, optional password_hash
   * Handles both 'name' and 'full_name' column names.
   */
  static async updateForAdmin(id, userData) {
    const { name, email, phone, role, password_hash } = userData;
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name.trim());
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email.trim().toLowerCase());
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone ? String(phone).trim() : null);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (password_hash !== undefined && password_hash !== null && password_hash !== '') {
      updateFields.push('password_hash = ?');
      updateValues.push(password_hash);
    }
    if (updateFields.length === 0) {
      return this.findById(id);
    }
    updateValues.push(id);

    let query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    try {
      await pool.query(query, updateValues);
      return this.findById(id);
    } catch (error) {
      if (error.code === 'ER_BAD_FIELD_ERROR' && error.message.includes('name')) {
        const nameIdx = updateFields.indexOf('name = ?');
        if (nameIdx !== -1) {
          updateFields[nameIdx] = 'full_name = ?';
          query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
          await pool.query(query, updateValues);
          return this.findById(id);
        }
      }
      throw error;
    }
  }

  /** Count users with role ADMIN (for prevent delete last admin) */
  static async countByRole(role) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = ?',
      [role]
    );
    return rows[0]?.count ?? 0;
  }

  /** Find by email excluding id (for unique check on update) */
  static async findByEmailExcludingId(email, excludeId) {
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.trim().toLowerCase(), excludeId]
    );
    return rows[0] || null;
  }

  // Update current user profile (name and phone only)
  // Database schema: id, name, email, password_hash, phone, role, created_at, updated_at
  static async updateProfile(id, userData) {
    const { name, phone } = userData;
    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name.trim());
    }

    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone || null);
    }

    if (updateFields.length === 0) {
      return this.findById(id);
    }

    updateValues.push(id);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    await pool.query(query, updateValues);
    
    return this.findById(id);
  }

  /** Get password_hash by user id (for change password flow) */
  static async getPasswordHashById(id) {
    const [rows] = await pool.query(
      'SELECT password_hash FROM users WHERE id = ?',
      [id]
    );
    return rows[0]?.password_hash ?? null;
  }

  /** Update password_hash by user id */
  static async updatePasswordHash(id, password_hash) {
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [password_hash, id]
    );
    return result.affectedRows > 0;
  }

  // Delete user
  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;

