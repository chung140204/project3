const UserModel = require('../models/UserModel');
const bcrypt = require('bcrypt');

class UserController {
  /**
   * Get current user profile
   * GET /api/users/me
   * Protected route - requires JWT authentication
   */
  static async getCurrentUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Return only safe fields (no password_hash)
      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch user profile' });
    }
  }

  /**
   * Update current user profile
   * PUT /api/users/me
   * Protected route - requires JWT authentication
   * Only allows updating name and phone
   */
  static async updateCurrentUser(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const { name, phone } = req.body;

      // Validate name if provided
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ 
            success: false, 
            error: 'Name must be a non-empty string' 
          });
        }
      }

      // Validate phone if provided (optional, but if provided should be string)
      if (phone !== undefined && phone !== null && typeof phone !== 'string') {
        return res.status(400).json({ 
          success: false, 
          error: 'Phone must be a string or null' 
        });
      }

      // Update only name and phone
      const updatedUser = await UserModel.updateProfile(userId, {
        name: name?.trim(),
        phone: phone?.trim() || null
      });

      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ success: false, error: 'Failed to update user profile' });
    }
  }

  /**
   * Change current user's password
   * PUT /api/users/me/password
   * Protected route - requires JWT authentication
   * Body: { currentPassword, newPassword, confirmPassword }
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
      }

      const currentPassword = String(req.body?.currentPassword || '');
      const newPassword = String(req.body?.newPassword || '');
      const confirmPassword = String(req.body?.confirmPassword || '');

      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Vui lòng nhập đầy đủ mật khẩu hiện tại và mật khẩu mới'
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Mật khẩu mới phải có ít nhất 6 ký tự'
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          error: 'Xác nhận mật khẩu không khớp'
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          success: false,
          error: 'Mật khẩu mới phải khác mật khẩu hiện tại'
        });
      }

      const passwordHash = await UserModel.getPasswordHashById(userId);
      if (!passwordHash) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const ok = await bcrypt.compare(currentPassword, passwordHash);
      if (!ok) {
        return res.status(400).json({
          success: false,
          error: 'Mật khẩu hiện tại không đúng'
        });
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      const updated = await UserModel.updatePasswordHash(userId, newHash);
      if (!updated) {
        return res.status(500).json({
          success: false,
          error: 'Không thể đổi mật khẩu. Vui lòng thử lại.'
        });
      }

      return res.json({
        success: true,
        message: 'Đổi mật khẩu thành công'
      });
    } catch (error) {
      console.error('Error changing password:', error);
      return res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  }
}

module.exports = UserController;

